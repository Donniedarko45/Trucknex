# Motion verification

Reference: independent 30 fps browser recording of the public upstream HTML/CSS. `reference/capture.json` records provenance. The published GIF is separately retained; it is not falsely presented as the 30 fps primary capture.

## Matching timestamps and geometry

Each pair is captured from `/motion-study?capture=1&time=MS` at 880 × 440, device scale 1. Reference time is `(frame − 1) × 1000 / 30` ms. The capture route freezes the shared live animation clock.

The verifier uses existing independently captured PNG frames. If those reproducible files are absent, it extracts them from `reference/source.mp4` with FFmpeg; H.264/YUV conversion may create tiny colour/raster differences. The origin of every used frame is recorded in `metrics.json`.

| Frame | Time ms | Reference trailer x (CSS) | Live trailer x | Source error px | Painted edge error px | Pair |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 0.00 | 680.000 | 680.000 | 0.000 | occluded/offscreen | [pair](pair_0001.png) |
| 37 | 1200.00 | 582.865 | 582.892 | 0.027 | -0.108 | [pair](pair_0037.png) |
| 46 | 1500.00 | 416.009 | 416.051 | 0.042 | 0.051 | [pair](pair_0046.png) |
| 61 | 2000.00 | 351.000 | 351.000 | 0.000 | 0.000 | [pair](pair_0061.png) |
| 76 | 2500.00 | 351.000 | 351.000 | 0.000 | 0.000 | [pair](pair_0076.png) |
| 106 | 3500.00 | 351.000 | 351.000 | 0.000 | 0.000 | [pair](pair_0106.png) |
| 151 | 5000.00 | 456.000 | 456.000 | 0.000 | 0.000 | [pair](pair_0151.png) |
| 181 | 6000.00 | 287.495 | 287.522 | 0.027 | -0.478 | [pair](pair_0181.png) |
| 211 | 7000.00 | 246.000 | 246.000 | 0.000 | 0.000 | [pair](pair_0211.png) |
| 226 | 7500.00 | 495.924 | 495.972 | 0.048 | -0.028 | [pair](pair_0226.png) |
| 245 | 8133.33 | 663.663 | 663.695 | 0.032 | occluded/offscreen | [pair](pair_0245.png) |
| 250 | 8300.00 | 675.515 | 675.501 | -0.014 | occluded/offscreen | [pair](pair_0250.png) |
| 255 | 8466.67 | 679.884 | 679.883 | -0.001 | occluded/offscreen | [pair](pair_0255.png) |
| 262 | 8700.00 | 680.000 | 680.000 | 0.000 | occluded/offscreen | [pair](pair_0262.png) |

Maximum continuous trailer anchor difference: **0.0480 px** against the verified upstream CSS timeline. Maximum visible painted-edge difference: **0.478 px**. The painted reference is rasterized, so an edge can fall on the next whole pixel. Occluded/outside anchors are explicitly excluded from paint measurements, but continuous DOM/source geometry is still measured.

The exact-time clock removes screenshot scheduling uncertainty; shared segment boundaries use the reference times. This establishes geometric timing against the independently captured source timeline, rather than guessing subframe timing from the lower-frequency published GIF. It does not claim the original GIF has more sampling precision than it does.

Across the 14 poses, maximum parcel-anchor difference is 0.0139 px; maximum door-hinge difference is 0.0480 px; maximum door-angle difference is 0.0254°. Maximum opacity difference is 0.00007. Normalized check reveal progress differs by at most 0.00021 from the source timing curve.

## Visual comparison and correction

The first capture pass showed the truck and parcel aligned, but both loading doors were missing. Motion's SVG renderer had written a 50% transform origin, placing the hinges outside the clipping region. The element origin was made explicitly (0,0), then all 14 reference pairs were captured again and hinge/angle checks added. The paused dev-panel readout was also synchronized to the shared clock; playback rates are measured within the browser to exclude test-driver command delays. An extra completion frame exposed a round-cap dot from a zero-length check path before its start time; the check is now hidden until its reveal begins, and all final pairs were recaptured.

## Controls and responsive checks

- PASS — Scrub applies exact static pose. x=351.000
- PASS — Pause holds pose.
- PASS — Timeline End reaches exact final endpoint. time=11000 ms; completion opacity=1.000
- PASS — Timeline Home reaches exact initial endpoint. time=0 ms; initial label opacity=1.000
- PASS — Playback speed 0.25×. advanced 125.0 ms in 500.4 ms browser time; drift 0.1 ms (1 ms range step; quantization ±0.5 ms)
- PASS — Playback speed 0.5×. advanced 250.0 ms in 500.3 ms browser time; drift 0.1 ms (1 ms range step; quantization ±0.5 ms)
- PASS — Playback speed 1×. advanced 500.0 ms in 500.3 ms browser time; drift 0.3 ms (1 ms range step; quantization ±0.5 ms)
- PASS — Restart returns to initial phase. time=51 ms
- PASS — Play advances shared clock.
- PASS — Homepage illustrative sequence auto-plays when visible. Visible data-playing=true
- PASS — Homepage visible Pause control stops playback.
- PASS — Homepage playback suspends offscreen. IntersectionObserver state after scrolling to footer
- PASS — Homepage playback resumes on return.
- 360 px viewport: horizontal overflow 0 px; SVG aspect ratio 2.000.
- 390 px viewport: horizontal overflow 0 px; SVG aspect ratio 2.000.
- 768 px viewport: horizontal overflow 0 px; SVG aspect ratio 2.000.
- 1440 px viewport: horizontal overflow 0 px; SVG aspect ratio 2.000.
- PASS — reduced motion starts completed; Play holds the final illustration. Measured spatial drift 0.0000 px.

## Browser performance

Headless Chromium observed 541 rAF intervals over 9016.3 ms. Median 16.70 ms; p95 16.80 ms; average scheduling rate 60.00 Hz; 0 intervals exceeded 25 ms. Main-thread long tasks: 0.

Headless Chromium on this machine; rAF scheduling and main-thread long tasks, not a physical-device GPU benchmark.

## Deliberate differences and remaining limits

- Warm-neutral background, ink pill, signal-orange cab, original Trucknex trailer/carton/check, and local Geist text replace the reference's original palette, text and artwork. Pixel-level colour/glyph differences are intentional.
- Headlight beam artwork is our own vector trapezoid rather than the source's perspective CSS surface; its timing, opacity and position follow the source.
- The original check uses a fixed 16-pixel dash offset; our original check path uses normalized path length. Both follow the same 300 ms easing and trigger, with a slightly different initial stroke reveal because the paths differ.
- The app holds completion and offers explicit controls; the upstream JavaScript's later class reset is excluded from the captured primary sequence and documented in the spec.
- Mobile adaptation preserves the SVG aspect ratio. There is no original mobile recording to compare against.
- No physical iOS/Android/GPU profiling was performed. Browser rAF scheduling is evidence for this environment, not a universal 60 fps guarantee.

Full values, parcel anchors, opacity samples and control/performance measurements are in [metrics.json](metrics.json).
