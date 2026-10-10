#!/usr/bin/env python3
"""Capture the independent upstream animation at exact 30 fps.

The source checkout stays outside the application. See README.md for its pinned
clone command. Requires Playwright, Chromium and FFmpeg.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess

from playwright.sync_api import sync_playwright

SOURCE_URL = "https://github.com/shafiei/truck-order-animation"
SOURCE_COMMIT = "a92b4a1c17d309ea3b39135a5292d9331bb20cef"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True,
                        help="Checkout of the pinned public reference repository")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument("--chromium", default=shutil.which("chromium"))
    args = parser.parse_args()
    source, output = args.source.resolve(), args.output.resolve()
    if not args.chromium:
        parser.error("Supply --chromium /path/to/chromium")
    try:
        commit = subprocess.check_output(
            ["git", "-C", str(source), "rev-parse", "HEAD"], text=True
        ).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        parser.error("--source must be the pinned Git checkout")
    if commit != SOURCE_COMMIT:
        parser.error(f"Reference commit must be {SOURCE_COMMIT}, found {commit}")
    if not shutil.which("ffmpeg"):
        parser.error("FFmpeg is required to create source.mp4")

    html = source.joinpath("index.html").read_text()
    body_match = re.search(r"<body>(.*?)</body>", html, re.S)
    if not body_match:
        parser.error("Source HTML has no body")
    # Omit the later reset timer; preserve and seek the source CSS animations.
    body = re.sub(r"<script.*?</script>", "", body_match.group(1), flags=re.S)
    css = source.joinpath("style.css").read_text()
    capture_css = (
        "body{margin:0;min-height:0;display:block}"
        ".order{position:absolute;left:218px;top:161px;transform:scale(1.75);"
        "transform-origin:0 0}"
    )
    output.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=args.chromium, headless=True, args=["--no-sandbox"]
        )
        page = browser.new_page(viewport={"width": 880, "height": 440},
                                device_scale_factor=1)
        page.set_content("<style>" + css + capture_css + "</style>" + body)
        page.evaluate("""() => {
          const button = document.querySelector('.order');
          getComputedStyle(button.querySelector('.default')).opacity;
          button.classList.add('animate');
          getComputedStyle(button.querySelector('.success')).opacity;
          window.referenceAnimations = button.getAnimations({subtree: true});
          referenceAnimations.forEach(animation => {
            animation.pause(); animation.currentTime = 0;
          });
        }""")
        for number in range(1, 331):
            timestamp = (number - 1) * 1000 / 30
            page.evaluate("""time => referenceAnimations.forEach(animation => {
              animation.currentTime = Math.max(0, time - 1000);
            })""", timestamp)
            page.screenshot(path=str(output / f"frame_{number:04d}.png"))
        browser.close()

    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-framerate", "30",
        "-i", str(output / "frame_%04d.png"), "-c:v", "libx264",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        str(output / "source.mp4"),
    ], check=True)
    gif = source / "Order-Button-to-Top-Down-View-Delivery-Truck-on-Road-Animation.gif"
    if gif.is_file():
        shutil.copyfile(gif, output / "original.gif")
    metadata = {
        "origin": "Browser capture of original public source, not Trucknex implementation",
        "url": SOURCE_URL, "commit": SOURCE_COMMIT,
        "width": 880, "height": 440, "fps": 30, "frame_count": 330,
        "duration_ms": 11000, "trigger_ms": 1000,
        "pill": {"x": 218, "y": 161, "width": 420, "height": 110.25, "scale": 1.75},
        "published_gif": "original.gif",
    }
    (output / "capture.json").write_text(json.dumps(metadata, indent=2) + "\n")
    print(f"Captured 330 independent reference frames and source.mp4 in {output}")


if __name__ == "__main__":
    main()
