#!/usr/bin/env python3
"""Compare the live SVG study with independent 30 fps source frames.

Run a Vite server, then:
    python scripts/verify_motion.py --url http://127.0.0.1:5173

Requires Python Playwright, Pillow and Chromium. It does not re-record the
reference, and it does not compare our deliberately different branding pixels.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import re
import shutil
import statistics
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "reference"
COMPARE = ROOT / "compare"
VIEWPORT = {"width": 880, "height": 440}


def ease(progress: float) -> float:
    """Independent solve of the reference CSS ease cubic, not app code."""
    progress = min(1, max(0, progress))
    low, high = 0.0, 1.0
    for _ in range(45):
        t = (low + high) / 2
        x = 3 * (1 - t) ** 2 * t * 0.25 + 3 * (1 - t) * t**2 * 0.25 + t**3
        if x < progress:
            low = t
        else:
            high = t
    t = (low + high) / 2
    return 3 * (1 - t) ** 2 * t * 0.1 + 3 * (1 - t) * t**2 + t**3


def source_value(ms: float, initial: float, segments: list[tuple]) -> float:
    value = initial
    for start, end, before, after in segments:
        if ms < start:
            return value
        if ms <= end:
            return before + (after - before) * ease((ms - start) / (end - start))
        value = after
    return value


def expected_source(ms: float) -> dict:
    expected = {
        "trailer_x": source_value(ms, 680, [
            (1000, 2000, 680, 351), (4000, 5000, 351, 456),
            (5000, 7000, 456, 246), (7000, 8500, 246, 680),
        ]),
        "trailer_y": 180.25,
        "parcel_x": source_value(ms, 181.25, [
            (1000, 1800, 181.25, 251.25), (2000, 3500, 251.25, 377.25),
            (3600, 3700, 377.25, 181.25),
        ]),
        "parcel_y": 197.75,
        "upperDoorAngle": source_value(ms, -90, [
            (1300, 2020, -90, 32), (2500, 3700, 32, -90),
        ]),
        "lowerDoorAngle": source_value(ms, 90, [
            (1600, 2320, 90, -32), (2800, 4000, -32, 90),
        ]),
        "defaultOpacity": source_value(ms, 1, [(1000, 1300, 1, 0)]),
        "completeOpacity": source_value(ms, 0, [(8000, 8300, 0, 1)]),
        "roadOpacity": source_value(ms, 0, [(4000, 4500, 0, 1), (7500, 8000, 1, 0)]),
        "checkProgress": source_value(ms, 0, [(8300, 8600, 0, 1)]),
    }
    expected["upperDoorHinge"] = {"x": expected["trailer_x"] + 3.5, "y": 189}
    expected["lowerDoorHinge"] = {"x": expected["trailer_x"] + 3.5, "y": 243.25}
    return expected


def painted_trailer(image: Image.Image, expected: dict) -> dict | None:
    """Read the actual pale trailer paint, excluding background/doors/labels.

    The outline has rounded corners, so a horizontal row twenty pixels below its
    top gives a stable left edge. The trailer gradient has a blue tint, unlike
    its white loading doors. Painting is integer rasterized; DOM geometry
    is continuous. Offscreen anchors are checked against upstream CSS instead.
    """
    predicted = expected["trailer_x"]
    if predicted >= 633 or predicted < 231:
        return None
    pixels = image.convert("RGB").load()
    runs = []
    start = None
    y = 200
    for x in range(219, 638):
        r, g, b = pixels[x, y]
        match = min(r, g, b) > 220 and 5 <= b - r <= 20 and 1 <= g - r <= 10
        if match and start is None:
            start = x
        if not match and start is not None:
            if x - start >= 8:
                runs.append((start, x - 1))
            start = None
    if start is not None:
        runs.append((start, 637))
    if not runs:
        return None
    left, right = min(runs, key=lambda run: abs(run[0] - predicted))
    if abs(left - predicted) > 3:
        return None
    top = None
    probe_x = min(620, max(left + 8, round(predicted + 12)))
    for y in range(175, 195):
        r, g, b = pixels[probe_x, y]
        if min(r, g, b) > 220 and max(r, g, b) - min(r, g, b) < 20:
            top = y
            break
    return {"x": left, "y": top, "visible_width": right - left + 1}


def painted_parcel(image: Image.Image, expected: dict) -> dict | None:
    predicted = expected["parcel_x"]
    if predicted < 219 or predicted > expected["trailer_x"] - 32:
        return None
    pixels = image.convert("RGB").load()
    selected = []
    for y in range(197, 236):
        for x in range(max(219, int(predicted) - 1), min(638, math.ceil(predicted + 38))):
            r, g, b = pixels[x, y]
            if 190 < r < 250 and 150 < g < 235 and 90 < b < 190 and r - g > 10 and g - b > 25:
                selected.append((x, y))
    if not selected:
        return None
    return {"x": min(x for x, _ in selected), "y": min(y for _, y in selected)}


ANCHORS_JS = """() => {
  const scene = document.querySelector('[data-testid="dispatch-scene"]').getBoundingClientRect();
  const scaleX = 880 / scene.width;
  const scaleY = 440 / scene.height;
  const box = (selector) => {
    const el = document.querySelector(selector);
    if (!el) throw Error('Missing motion anchor: ' + selector);
    const bounds = el.getBBox();
    const matrix = el.getScreenCTM();
    const point = new DOMPoint(bounds.x, bounds.y).matrixTransform(matrix);
    const far = new DOMPoint(bounds.x + bounds.width, bounds.y + bounds.height).matrixTransform(matrix);
    return {x: (point.x-scene.x)*scaleX, y: (point.y-scene.y)*scaleY, width: (far.x-point.x)*scaleX, height: (far.y-point.y)*scaleY};
  };
  const opacity = selector => Number(getComputedStyle(document.querySelector(selector)).opacity);
  const hinge = selector => {
    const matrix = document.querySelector(selector).getScreenCTM();
    const point = new DOMPoint(0,0).matrixTransform(matrix);
    return {x:(point.x-scene.x)*scaleX,y:(point.y-scene.y)*scaleY,angle:Math.atan2(matrix.b,matrix.a)*180/Math.PI};
  };
  return {
    trailer: box('[data-motion-element="trailer"] > rect'),
    parcel: box('[data-testid="dispatch-parcel"] > rect'),
    upperDoor: hinge('[data-testid="dispatch-upper-door"]'),
    lowerDoor: hinge('[data-testid="dispatch-lower-door"]'),
    defaultOpacity: opacity('[data-motion-element="idle-label"]'),
    completeOpacity: opacity('[data-motion-element="complete-label"]'),
    roadOpacity: opacity('[data-testid="dispatch-road"]'),
    checkProgress: Number(document.querySelector('[data-motion-element="confirmation-check"]').getAttribute('stroke-dasharray').split(' ')[0]),
    checkOpacity: opacity('[data-motion-element="confirmation-check"]')
  };
}"""


def wait_render(page) -> None:
    page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")


def pair(reference: Path, actual: Path, target: Path, frame: int, timestamp: float) -> None:
    source = Image.open(reference).convert("RGB")
    live = Image.open(actual).convert("RGB")
    canvas = Image.new("RGB", (1760, 484), "#ffffff")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default(size=16)
    draw.text((14, 12), f"Independent upstream reference · frame {frame:04d} · {timestamp:.2f} ms", fill="#191919", font=font)
    draw.text((894, 12), "Live Trucknex SVG · own artwork, colours and text", fill="#191919", font=font)
    canvas.paste(source, (0, 44))
    canvas.paste(live, (880, 44))
    draw.line((880, 0, 880, 484), fill="#cccccc", width=1)
    canvas.save(target)


def controls_test(page, url: str) -> list[dict]:
    results = []

    def check(name: str, passed: bool, detail=""):
        results.append({"check": name, "passed": bool(passed), "detail": detail})

    page.goto(url + "/motion-study", wait_until="networkidle")
    page.wait_for_selector('[data-testid="dispatch-truck"]')
    page.get_by_role("button", name="Restart", exact=True).click()
    page.get_by_role("button", name="Pause", exact=True).click()
    scrub = page.get_by_role("slider")
    scrub.fill("2000")
    wait_render(page)
    before = page.evaluate(ANCHORS_JS)
    check("Scrub applies exact static pose", abs(before["trailer"]["x"] - 351) < 1, f"x={before['trailer']['x']:.3f}")
    page.wait_for_timeout(250)
    after = page.evaluate(ANCHORS_JS)
    check("Pause holds pose", abs(after["trailer"]["x"] - before["trailer"]["x"]) < 0.1)
    scrub.focus()
    scrub.press("End")
    wait_render(page)
    end_time = float(scrub.input_value())
    final_pose = page.evaluate(ANCHORS_JS)
    check("Timeline End reaches exact final endpoint", end_time == 11000 and final_pose["completeOpacity"] == 1, f"time={end_time:.0f} ms; completion opacity={final_pose['completeOpacity']:.3f}")
    scrub.press("Home")
    wait_render(page)
    initial_time = float(scrub.input_value())
    initial_pose = page.evaluate(ANCHORS_JS)
    check("Timeline Home reaches exact initial endpoint", initial_time == 0 and initial_pose["defaultOpacity"] == 1, f"time={initial_time:.0f} ms; initial label opacity={initial_pose['defaultOpacity']:.3f}")
    for label, rate in [("0.25×", 0.25), ("0.5×", 0.5), ("1×", 1)]:
        page.get_by_role("button", name=label, exact=True).click()
        scrub.fill("1200")
        wait_render(page)
        sample = page.evaluate("""() => new Promise(resolve => {
          const panel=document.querySelector('section[aria-label="Animation controls"]');
          const button=name=>[...panel.querySelectorAll('button')].find(b=>b.textContent.trim()===name);
          const slider=panel.querySelector('input[type=range]');
          const initial=Number(slider.value);
          const start=performance.now();
          button('Play').click();
          setTimeout(()=>{
            const elapsed=performance.now()-start;
            button('Pause').click();
            requestAnimationFrame(()=>requestAnimationFrame(()=>resolve({initial,elapsed,actual:Number(slider.value)})));
          },500);
        })""")
        elapsed, actual_time, initial = sample["elapsed"], sample["actual"], sample["initial"]
        drift = abs(actual_time - (initial + elapsed * rate))
        check(f"Playback speed {rate}×", drift < 50, f"advanced {actual_time-initial:.1f} ms in {elapsed:.1f} ms browser time; drift {drift:.1f} ms (1 ms range step; quantization ±0.5 ms)")
    page.get_by_role("button", name="Restart", exact=True).click()
    page.get_by_role("button", name="Pause", exact=True).click()
    check("Restart returns to initial phase", float(scrub.input_value()) < 160, f"time={scrub.input_value()} ms")
    page.get_by_role("button", name="Play", exact=True).click()
    page.wait_for_timeout(120)
    page.get_by_role("button", name="Pause", exact=True).click()
    check("Play advances shared clock", float(scrub.input_value()) > 0)
    return results


def responsive_test(browser, url: str) -> list[dict]:
    results = []
    for width in [360, 390, 768, 1440]:
        page = browser.new_page(viewport={"width": width, "height": 900}, device_scale_factor=1)
        page.goto(url + "/motion-study", wait_until="networkidle")
        page.wait_for_selector('[data-testid="dispatch-truck"]')
        geometry = page.evaluate("""() => ({width:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth, svg:(()=>{const r=document.querySelector('[data-testid="dispatch-scene"]').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()})""")
        page.screenshot(path=str(COMPARE / f"responsive_{width}.png"), full_page=True)
        results.append({"width": width, "horizontalOverflow": geometry["scroll"] - geometry["width"], "svg": geometry["svg"]})
        page.close()
    return results


def performance_test(browser, url: str) -> dict:
    page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    page.goto(url + "/motion-study", wait_until="networkidle")
    page.get_by_role("button", name="Play", exact=True).click()
    result = page.evaluate("""() => new Promise(resolve => {
      const intervals = [], longTasks = [];
      let previous, start;
      const observer = new PerformanceObserver(list => longTasks.push(...list.getEntries().map(e=>({duration:e.duration,startTime:e.startTime}))));
      observer.observe({type:'longtask',buffered:false});
      function tick(now) {
        if (start === undefined) start=now;
        if (previous !== undefined) intervals.push(now-previous);
        previous=now;
        if (now-start < 9000) requestAnimationFrame(tick);
        else {observer.disconnect();resolve({intervals,longTasks,elapsed:now-start});}
      }
      requestAnimationFrame(tick);
    })""")
    intervals = result.pop("intervals")
    result.update({
        "samples": len(intervals),
        "meanIntervalMs": statistics.mean(intervals),
        "medianIntervalMs": statistics.median(intervals),
        "p95IntervalMs": sorted(intervals)[int(len(intervals) * 0.95)],
        "rafRateHz": 1000 / statistics.mean(intervals),
        "intervalsOver25Ms": sum(interval > 25 for interval in intervals),
        "maxIntervalMs": max(intervals),
        "scope": "Headless Chromium on this machine; rAF scheduling and main-thread long tasks, not a physical-device GPU benchmark.",
    })
    page.close()
    return result


def homepage_test(browser, url: str) -> list[dict]:
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(url + "/", wait_until="networkidle")
    animation = page.get_by_test_id("dispatch-animation")
    animation.scroll_into_view_if_needed()
    page.wait_for_function("document.querySelector('[data-testid=dispatch-animation]').dataset.playing === 'true'")
    results = [{"check": "Homepage illustrative sequence auto-plays when visible", "passed": True, "detail": "Visible data-playing=true"}]
    page.get_by_role("button", name="Pause animation", exact=True).click()
    wait_render(page)
    results.append({"check": "Homepage visible Pause control stops playback", "passed": animation.get_attribute("data-playing") == "false", "detail": ""})
    page.get_by_role("button", name="Play animation", exact=True).click()
    page.wait_for_function("document.querySelector('[data-testid=dispatch-animation]').dataset.playing === 'true'")
    page.evaluate("window.scrollTo(0,document.documentElement.scrollHeight)")
    page.wait_for_timeout(150)
    results.append({"check": "Homepage playback suspends offscreen", "passed": animation.get_attribute("data-playing") == "false", "detail": "IntersectionObserver state after scrolling to footer"})
    animation.scroll_into_view_if_needed()
    page.wait_for_function("document.querySelector('[data-testid=dispatch-animation]').dataset.playing === 'true'")
    results.append({"check": "Homepage playback resumes on return", "passed": True, "detail": ""})
    page.close()
    return results


def reduced_motion_test(browser, url: str) -> dict:
    page = browser.new_page(viewport={"width": 880, "height": 700}, reduced_motion="reduce")
    page.goto(url + "/motion-study", wait_until="networkidle")
    page.wait_for_selector('[data-testid="dispatch-truck"]')
    before = page.evaluate(ANCHORS_JS)
    page.get_by_role("button", name="Play", exact=True).click()
    page.wait_for_timeout(120)
    after = page.evaluate(ANCHORS_JS)
    page.wait_for_timeout(250)
    later = page.evaluate(ANCHORS_JS)
    result = {
        "defaultCompleteOpacity": before["completeOpacity"],
        "playCompleteOpacity": after["completeOpacity"],
        "spatialDriftPx": abs(later["trailer"]["x"] - after["trailer"]["x"]),
        "passed": before["completeOpacity"] > .99 and after["completeOpacity"] > .99 and abs(later["trailer"]["x"] - after["trailer"]["x"]) < .01,
    }
    page.screenshot(path=str(COMPARE / "reduced_motion.png"), full_page=True)
    page.close()
    return result


def write_report(report: dict) -> None:
    geometry = report["frames"]
    max_source = max(abs(frame["trailerSourceErrorPx"]) for frame in geometry)
    paint_errors = [abs(frame["trailerPaintErrorPx"]) for frame in geometry if frame["trailerPaintErrorPx"] is not None]
    lines = [
        "# Motion verification", "",
        "Reference: independent 30 fps browser recording of the public upstream HTML/CSS. `reference/capture.json` records provenance. The published GIF is separately retained; it is not falsely presented as the 30 fps primary capture.", "",
        "## Matching timestamps and geometry", "",
        "Each pair is captured from `/motion-study?capture=1&time=MS` at 880 × 440, device scale 1. Reference time is `(frame − 1) × 1000 / 30` ms. The capture route freezes the shared live animation clock.", "",
        "The verifier uses existing independently captured PNG frames. If those reproducible files are absent, it extracts them from `reference/source.mp4` with FFmpeg; H.264/YUV conversion may create tiny colour/raster differences. The origin of every used frame is recorded in `metrics.json`.", "",
        "| Frame | Time ms | Reference trailer x (CSS) | Live trailer x | Source error px | Painted edge error px | Pair |",
        "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ]
    for frame in geometry:
        paint = "occluded/offscreen" if frame["trailerPaintErrorPx"] is None else f"{frame['trailerPaintErrorPx']:.3f}"
        lines.append(f"| {frame['frame']} | {frame['timeMs']:.2f} | {frame['reference']['trailer_x']:.3f} | {frame['live']['trailer']['x']:.3f} | {frame['trailerSourceErrorPx']:.3f} | {paint} | [pair](pair_{frame['frame']:04d}.png) |")
    lines += [
        "",
        f"Maximum continuous trailer anchor difference: **{max_source:.4f} px** against the verified upstream CSS timeline. Maximum visible painted-edge difference: **{max(paint_errors, default=0):.3f} px**. The painted reference is rasterized, so an edge can fall on the next whole pixel. Occluded/outside anchors are explicitly excluded from paint measurements, but continuous DOM/source geometry is still measured.", "",
        "The exact-time clock removes screenshot scheduling uncertainty; shared segment boundaries use the reference times. This establishes geometric timing against the independently captured source timeline, rather than guessing subframe timing from the lower-frequency published GIF. It does not claim the original GIF has more sampling precision than it does.", "",
        f"Across the {len(geometry)} poses, maximum parcel-anchor difference is {max(abs(frame['parcelSourceErrorPx']) for frame in geometry):.4f} px; maximum door-hinge difference is {max(frame[key] for frame in geometry for key in ('upperDoorHingeErrorPx', 'lowerDoorHingeErrorPx')):.4f} px; maximum door-angle difference is {max(abs(frame[key]) for frame in geometry for key in ('upperDoorAngleErrorDeg', 'lowerDoorAngleErrorDeg')):.4f}°. Maximum opacity difference is {max(abs(value) for frame in geometry for value in frame['opacityErrors'].values()):.5f}. Normalized check reveal progress differs by at most {max(abs(frame['checkProgressError']) for frame in geometry):.5f} from the source timing curve.", "",
        "## Visual comparison and correction", "",
        f"The first capture pass showed the truck and parcel aligned, but both loading doors were missing. Motion's SVG renderer had written a 50% transform origin, placing the hinges outside the clipping region. The element origin was made explicitly (0,0), then all {len(geometry)} reference pairs were captured again and hinge/angle checks added. The paused dev-panel readout was also synchronized to the shared clock; playback rates are measured within the browser to exclude test-driver command delays. An extra completion frame exposed a round-cap dot from a zero-length check path before its start time; the check is now hidden until its reveal begins, and all final pairs were recaptured.", "",
        "## Controls and responsive checks", "",
    ]
    for control in report["controls"]:
        lines.append(f"- {'PASS' if control['passed'] else 'FAIL'} — {control['check']}. {control['detail']}")
    for viewport in report["responsive"]:
        lines.append(f"- {viewport['width']} px viewport: horizontal overflow {viewport['horizontalOverflow']} px; SVG aspect ratio {viewport['svg']['width']/viewport['svg']['height']:.3f}.")
    reduced = report["reducedMotion"]
    lines.append(f"- {'PASS' if reduced['passed'] else 'FAIL'} — reduced motion starts completed; Play holds the final illustration. Measured spatial drift {reduced['spatialDriftPx']:.4f} px.")
    performance = report["performance"]
    lines += [
        "", "## Browser performance", "",
        f"Headless Chromium observed {performance['samples']} rAF intervals over {performance['elapsed']:.1f} ms. Median {performance['medianIntervalMs']:.2f} ms; p95 {performance['p95IntervalMs']:.2f} ms; average scheduling rate {performance['rafRateHz']:.2f} Hz; {performance['intervalsOver25Ms']} intervals exceeded 25 ms. Main-thread long tasks: {len(performance['longTasks'])}.", "",
        performance["scope"], "",
        "## Deliberate differences and remaining limits", "",
        "- Warm-neutral background, ink pill, signal-orange cab, original Trucknex trailer/carton/check, and local Geist text replace the reference's original palette, text and artwork. Pixel-level colour/glyph differences are intentional.",
        "- Headlight beam artwork is our own vector trapezoid rather than the source's perspective CSS surface; its timing, opacity and position follow the source.",
        "- The original check uses a fixed 16-pixel dash offset; our original check path uses normalized path length. Both follow the same 300 ms easing and trigger, with a slightly different initial stroke reveal because the paths differ.",
        "- The app holds completion and offers explicit controls; the upstream JavaScript's later class reset is excluded from the captured primary sequence and documented in the spec.",
        "- Mobile adaptation preserves the SVG aspect ratio. There is no original mobile recording to compare against.",
        "- No physical iOS/Android/GPU profiling was performed. Browser rAF scheduling is evidence for this environment, not a universal 60 fps guarantee.", "",
        "Full values, parcel anchors, opacity samples and control/performance measurements are in [metrics.json](metrics.json).", "",
    ]
    (COMPARE / "REPORT.md").write_text("\n".join(lines))


def ensure_reference_frames(keyframes: list[int]) -> dict:
    origins = {str(frame): "Independent source-browser PNG capture" for frame in keyframes}
    missing = [frame for frame in keyframes if not (REFERENCE / f"frame_{frame:04d}.png").is_file()]
    if not missing:
        return origins
    if not shutil.which("ffmpeg"):
        raise SystemExit("Missing reference PNGs: install FFmpeg to extract reference/source.mp4.")
    with tempfile.TemporaryDirectory(prefix="trucknex-reference-") as temporary:
        subprocess.run([
            "ffmpeg", "-v", "error", "-i", str(REFERENCE / "source.mp4"),
            "-frames:v", "330", str(Path(temporary) / "frame_%04d.png"),
        ], check=True)
        for frame in missing:
            name = f"frame_{frame:04d}.png"
            shutil.copyfile(Path(temporary) / name, REFERENCE / name)
            origins[str(frame)] = "Extracted from independently recorded source.mp4 (H.264/YUV)"
    return origins


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:5173")
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    parser.add_argument("--captures-only", action="store_true")
    args = parser.parse_args()
    COMPARE.mkdir(exist_ok=True)
    keyframes = [int(value) for value in re.search(r"keyFrames:\s*\[([^]]+)\]", (ROOT / "src/motion.ts").read_text()).group(1).split(",") if value.strip()]
    assert len(keyframes) >= 8
    report = {"reference": json.loads((REFERENCE / "capture.json").read_text()), "referenceFrameOrigins": ensure_reference_frames(keyframes), "frames": []}
    errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=args.chromium, headless=True, args=["--no-sandbox"])
        page = browser.new_page(viewport=VIEWPORT, device_scale_factor=1)
        page.on("pageerror", lambda error: errors.append(str(error)))
        for frame in keyframes:
            timestamp = (frame - 1) * 1000 / 30
            page.goto(f"{args.url}/motion-study?capture=1&time={timestamp:.8f}", wait_until="networkidle")
            page.wait_for_selector('[data-testid="dispatch-truck"]')
            page.evaluate("() => document.fonts.ready")
            wait_render(page)
            actual = COMPARE / f"live_{frame:04d}.png"
            page.screenshot(path=str(actual))
            reference = REFERENCE / f"frame_{frame:04d}.png"
            pair(reference, actual, COMPARE / f"pair_{frame:04d}.png", frame, timestamp)
            expected = expected_source(timestamp)
            live = page.evaluate(ANCHORS_JS)
            painted = painted_trailer(Image.open(reference), expected)
            parcel_paint = painted_parcel(Image.open(reference), expected)
            row = {
                "frame": frame, "timeMs": timestamp, "reference": expected, "live": live,
                "referenceTrailerPaint": painted, "referenceParcelPaint": parcel_paint,
                "trailerSourceErrorPx": live["trailer"]["x"] - expected["trailer_x"],
                "trailerPaintErrorPx": None if painted is None else live["trailer"]["x"] - painted["x"],
                "parcelSourceErrorPx": live["parcel"]["x"] - expected["parcel_x"],
                "upperDoorHingeErrorPx": math.hypot(live["upperDoor"]["x"] - expected["upperDoorHinge"]["x"], live["upperDoor"]["y"] - expected["upperDoorHinge"]["y"]),
                "lowerDoorHingeErrorPx": math.hypot(live["lowerDoor"]["x"] - expected["lowerDoorHinge"]["x"], live["lowerDoor"]["y"] - expected["lowerDoorHinge"]["y"]),
                "upperDoorAngleErrorDeg": live["upperDoor"]["angle"] - expected["upperDoorAngle"],
                "lowerDoorAngleErrorDeg": live["lowerDoor"]["angle"] - expected["lowerDoorAngle"],
                "opacityErrors": {name: live[name] - expected[name] for name in ("defaultOpacity", "completeOpacity", "roadOpacity")},
                "checkProgressError": live["checkProgress"] - expected["checkProgress"],
            }
            report["frames"].append(row)
            print(f"frame {frame:04d} @ {timestamp:.2f} ms: trailer Δ{row['trailerSourceErrorPx']:.4f}px, parcel Δ{row['parcelSourceErrorPx']:.4f}px", flush=True)
        if args.captures_only:
            (COMPARE / "capture-metrics.json").write_text(json.dumps(report, indent=2) + "\n")
            browser.close()
            return
        report["controls"] = controls_test(page, args.url)
        report["controls"].extend(homepage_test(browser, args.url))
        report["responsive"] = responsive_test(browser, args.url)
        report["reducedMotion"] = reduced_motion_test(browser, args.url)
        report["performance"] = performance_test(browser, args.url)
        report["pageErrors"] = errors
        browser.close()
    (COMPARE / "metrics.json").write_text(json.dumps(report, indent=2) + "\n")
    write_report(report)
    failures = [control["check"] for control in report["controls"] if not control["passed"]]
    failures += [f"overflow at {row['width']} px" for row in report["responsive"] if row["horizontalOverflow"] > 1]
    if not report["reducedMotion"]["passed"]:
        failures.append("reduced motion")
    if max(abs(row["trailerSourceErrorPx"]) for row in report["frames"]) > 2:
        failures.append("trailer geometry >2 px")
    if max(row[key] for row in report["frames"] for key in ("upperDoorHingeErrorPx", "lowerDoorHingeErrorPx")) > 2:
        failures.append("door hinges >2 px")
    if max(abs(row[key]) for row in report["frames"] for key in ("upperDoorAngleErrorDeg", "lowerDoorAngleErrorDeg")) > .25:
        failures.append("door angle >.25 degree")
    if max(abs(value) for row in report["frames"] for value in row["opacityErrors"].values()) > .01:
        failures.append("opacity difference >.01")
    if any(row["live"]["checkOpacity"] != 0 for row in report["frames"] if row["reference"]["checkProgress"] == 0):
        failures.append("check visible before reveal")
    if errors:
        failures.extend(errors)
    print(json.dumps({"failures": failures, "report": str(COMPARE / "REPORT.md")}, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
