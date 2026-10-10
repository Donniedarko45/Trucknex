# Trucknex

An original, responsive logistics website concept built with React, TypeScript, Vite, Base UI, and Motion (`motion/react`). The visual system combines warm neutrals, ink black, signal orange, local Geist typography, transport photography, and a live SVG dispatch sequence.

## Run locally

Requires Node.js 22.12+ (Node.js 24 was validated).

```sh
npm ci --cache /workspace/.cache/npm --no-audit --no-fund
npm run dev -- --port 5173 --strictPort
```

For machines outside the cloud workspace, omit the `--cache` argument or supply a writable local cache directory.

## Production

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Deploy `dist/` as a static site. Configure the host to serve `index.html` for unknown paths so client-side routes can load directly.

## Pages and interactions

- Home: animated transport hero, truck search, demo availability/results dialog, city swap, shipment lookup, service cards, animated network, process, and FAQ.
- Solutions: shipper/transporter switch and full truckload, part truckload, and enterprise service sections.
- Network: city search, regional filters, and selectable freight corridors.
- About: company concept, values, and logistics story.
- Contact: validated form, booking context handoff, and explicit demo submission feedback.
- Track: sample shipment `TNX12345` (also accepts `TNX-12345`), milestone timeline, and empty/not-found states. Direct links support `/track?id=TNX12345`.
- Motion studio: `/motion-study` has Play/Pause, Restart, frame scrubbing, and 0.25× / 0.5× / 1× playback. The homepage runs the same illustration with a visible pause control.
- Immediate responsive navigation, keyboard-operable Base UI dialogs and accordions, focus handling, and reduced-motion support.

This is a complete frontend concept. Truck availability, ratings, prices, coverage figures, and shipment data are illustrative. Forms do not send or persist messages. Real bookings, live tracking, subscriptions, and contact delivery require backend integrations.

## Motion reference and tuning

The selected reference is [shafiei/truck-order-animation](https://github.com/shafiei/truck-order-animation) at commit `a92b4a1c17d309ea3b39135a5292d9331bb20cef`. Its loading doors, parcel, road, and departure create a clear freight sequence. Original artist attribution is unresolved; this study credits the verified public repository. The source is not attributed to @heydamir.

[MOTION_SPEC.md](MOTION_SPEC.md) records the frame analysis, measured geometry, timeline, triggers, easing, and assumptions. `reference/original.gif` preserves the published recording. The precise 30 fps `reference/source.mp4` was captured independently from the public upstream HTML/CSS, with a one-second idle lead-in. Its original artwork stays in study assets outside the production bundle.

All dispatch durations, delays, easing, playback presets, geometry, and tracks live in [src/motion.ts](src/motion.ts):

- `TRACKS` contains each element's `start`, `end`, `from`, and `to` values in milliseconds and unscaled SVG units. Gaps hold the preceding pose.
- `MOTION.referenceEase` is the measured source curve; `clockEase` stays linear so scrubbing and speed changes share one timeline.
- `MOTION.duration`, `complete`, `stages`, and `keyFrames` control playback length, reduced-motion pose, labels, and comparison timestamps. Update related values together when changing the sequence.
- `DispatchAnimation` owns one MotionValue clock. `DispatchElements` derives element transforms and opacity from it; the scene does not rerender React on every animation frame.

The homepage pauses offscreen and in hidden tabs. Reduced motion shows a completed static illustration. The SVG scales uniformly from 360 to 1440 px; controls remain usable on touch screens. Motion is loaded separately from the main site bundle.

## Verify the animation

Start the development server, then run:

```sh
python -m pip install playwright pillow
# Install Chromium and FFmpeg using your system package manager if needed.
python scripts/verify_motion.py --url http://127.0.0.1:5173
```

The verifier uses `/usr/bin/chromium` in this cloud environment. Its `--help` lists browser overrides. It captures 14 matching reference timestamps, saves labelled side-by-side pairs to `compare/`, checks geometry, controls, responsive widths and reduced motion, and records browser frame scheduling. Missing ignored reference PNGs are extracted from the committed source clip using FFmpeg.

[compare/REPORT.md](compare/REPORT.md) documents the differences found and fixed, measured errors, and remaining limits. Trailer positions match the independent source timeline within 0.05 px; visible raster edges differ by less than 0.5 px. The tested Chromium trace scheduled at 60 Hz with no long tasks. Physical-device performance is not measured.

Deliberate visual differences are the warm background, orange cab, original Trucknex truck/carton/check artwork, and Geist journey copy. The check and headlight shapes differ slightly while following the source timing. The studio holds completion; the homepage explicitly loops. There is no source mobile recording, so mobile uses uniform scaling.

To regenerate the independent reference capture:

```sh
git clone https://github.com/shafiei/truck-order-animation /tmp/truck-order-reference
git -C /tmp/truck-order-reference checkout a92b4a1c17d309ea3b39135a5292d9331bb20cef
python reference/capture_reference.py --source /tmp/truck-order-reference
```

This captures upstream source, not the reconstruction. The published GIF has variable frame durations and cannot by itself establish sub-50 ms accuracy; the independently sampled 30 fps source capture is the primary timing reference.

## Local assets

Fonts are bundled from `@fontsource/geist` and `@fontsource/geist-mono`. Photographs are bundled locally, so the website requires no external asset requests at runtime.

Photographic sources (Unsplash):

- `public/images/truck.jpg`: https://images.unsplash.com/photo-1519003722824-194d4455a60c
- `public/images/warehouse.jpg`: https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d
- `public/images/hero-truck.jpg`: https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62
- `public/images/fleet.jpg`: https://images.unsplash.com/photo-1601584115197-04ecc0da31d7

The supplied TrucksUp website could not be read because its upstream TLS certificate failed verification in the development environment. Trucknex is an original logistics interface concept, rather than a reproduction of that site's pages or assets.

## Design engineering

The redesign follows the `emil-design-eng`, `animate`, and `mobile-native` guidance from [Emil Kowalski’s skills](https://github.com/emilkowalski/skills).

- Shared motion tokens: `--ease-out`, `--ease-in-out`, and `--ease-drawer`.
- Short CSS transitions for press feedback and state changes; no animated route navigation.
- Base UI supplies dialog focus management, dismissal, and measured accordion heights.
- Keyboard interactions bypass movement; reduced motion retains gentle opacity changes.
- Hover motion is limited to precise pointing devices. Touch inputs use at least 16px text.
- The homepage entrance plays once per application session. No scroll-hidden functional content.

Physical-device Safari and Android interaction testing remains separate from browser viewport checks.
