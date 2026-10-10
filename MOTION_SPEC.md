# Trucknex motion reference study

## Selected reference and evidence

Reference: [Truck order animation](https://github.com/shafiei/truck-order-animation),
commit `a92b4a1c17d309ea3b39135a5292d9331bb20cef`. The repository provides an
actual published GIF and runnable HTML/CSS. Its original artist is not established;
this study credits the public repository and does not attribute it to @heydamir.
X was inaccessible from this environment.

This reference suits freight: entry, loading, doors closing, road travel, departure,
and confirmation form one causal sequence. It requires SVG and transforms, not
canvas or WebGL.

`reference/original.gif` preserves the published 880 × 440 recording: 141
variable-duration frames, 8,770 ms. All frames were inspected through contact sheets
and coordinate analysis. The GIF is roughly 0.96 times the source CSS timeline,
with mostly 60 ms samples and some 30/120 ms samples. Its first/last holds are
500/530 ms. Those sampling limits prevent an honest 50 ms timing guarantee from
that GIF alone.

**Primary comparison reference:** an independent browser capture of the upstream
HTML/CSS, not the Trucknex reconstruction. Original art/copy are retained only in
these study assets. Capture uses the GIF's measured placement and scale; animations
are sampled at exact 30 fps. `reference/source.mp4` and `frame_0001.png` onward
contain this capture. `reference/capture.json` records provenance. At frame N,
time is `(N − 1) × 1000 / 30` ms. The clip lasts 11,000 ms with 1,000 ms of idle
before the click sequence. The source's reset timer is omitted so the final pose
can be compared without an unrelated return transition.

## Geometry and every on-screen element

Reference coordinate system: 880 × 440 pixels. Scene centre is slightly left/above
viewport centre because the published capture is cropped. The pill starts at
(218, 161), is 420 × 110.25, and has rounded ends. Source-local coordinates use
240 × 63 multiplied uniformly by 1.75. All rows below use full reference pixels.

| Element | Role | Initial geometry / replacement |
| --- | --- | --- |
| Pale-blue background | Static canvas | Full 880 × 440; replace with Trucknex warm neutral |
| Graphite pill | Clips the whole sequence | (218,161), 420 × 110.25; own ink colour |
| Default label | Action / idle state | Centred at x428; source top194.25, font28; own Geist copy |
| Success label | Completion feedback | Same centred label area; own journey copy |
| Cargo trailer | Main moving carrier | Initially x680, y180.25, 105 × 71.75; own SVG with Trucknex mark |
| Cab / windows / mirrors | Identifies vehicle orientation | Cab at trailer x+105, 45.5 × 71.75; our orange SVG artwork |
| Upper loading door | Loading state | Hinge at trailer+(3.5,8.75); length35, thickness3.5 |
| Lower loading door | Loading state | Hinge at trailer+(3.5,63); length35, thickness3.5 |
| Parcel / packing seam | Cargo entering trailer | Initially (181.25,197.75), 36.75 square; own carton vector |
| Two headlights | Departure state | Trailer x+145.25, y+7/y+50.75; 5.25 × 14 |
| Two headlight beams | Motion direction | Ahead of cab; opacity + subtle scale |
| Road dashes | Relative road movement | Starts at x638, y213.5; dash10.5, pitch26.25, visible height3.675 |
| Confirmation tick | Final confirmation | 21 × 17.5 beside centred success copy; own check path |
| Cursor and pressed pill in GIF | Recording / interaction artifact | Cursor excluded; human trigger press remains ordinary feedback |

Original branding, font, blue cab, exact body detailing, and copy are not copied
into production. Geometry anchors and motion are retained; original Trucknex SVG
art, signal orange, local fonts, and journey wording replace the reference art.

## Timeline

The following times refer to the primary capture, including its initial 1,000 ms
idle. Position values refer to the trailer's left edge or parcel's left edge.
Standard CSS `ease`, cubic-bezier(0.25,0.1,0.25,1), is verified in the upstream
source and agrees with the recorded motion. It is a deliberate reference match,
not an invented spring. No blur or bounce is visible.

| Element | Property | Start ms | End ms | From → to | Curve |
| --- | --- | ---: | ---: | --- | --- |
| All elements | Idle hold | 0 | 1000 | Initial composition | Hold |
| Default label | Opacity | 1000 | 1300 | 1 → 0 | Reference ease |
| Truck | X position | 1000 | 2000 | 680 → 351 | Reference ease |
| Truck | X position | 2000 | 4000 | 351 → 351 | Hold |
| Truck | X position | 4000 | 5000 | 351 → 456 | Reference ease |
| Truck | X position | 5000 | 7000 | 456 → 246 | Reference ease |
| Truck | X position | 7000 | 8500 | 246 → 680 | Reference ease |
| Truck | X position | 8500 | 11000 | Outside clip → outside clip | Hold |
| Parcel | X position | 1000 | 1800 | 181.25 → 251.25 | Reference ease |
| Parcel | X position | 1800 | 2000 | 251.25 → 251.25 | Hold |
| Parcel | X position | 2000 | 3500 | 251.25 → 377.25 | Reference ease |
| Parcel | Opacity | 3500 | 3600 | 1 → 0; already occluded | Reference ease |
| Parcel | X position | 3600 | 3700 | 377.25 → 181.25, invisible | Reference ease |
| Upper door | Rotation | 1300 | 2020 | −90° → 32° | Reference ease |
| Upper door | Rotation | 2020 | 2500 | 32° → 32° | Hold |
| Upper door | Rotation | 2500 | 3700 | 32° → −90° | Reference ease |
| Lower door | Rotation | 1600 | 2320 | 90° → −32° | Reference ease |
| Lower door | Rotation | 2320 | 2800 | −32° → −32° | Hold |
| Lower door | Rotation | 2800 | 4000 | −32° → 90° | Reference ease |
| Headlight beams | Opacity / scaleX | 4000 | 5000 | 0/.88 → 1/.94 | Reference ease |
| Road | X position | 4000 | 11000 | 638 → −62 | Reference ease |
| Road | Opacity | 4000 | 4500 | 0 → 1 | Reference ease |
| Road | Opacity | 4500 | 7500 | 1 → 1 | Hold |
| Road | Opacity | 7500 | 8000 | 1 → 0 | Reference ease |
| Success label | Opacity | 8000 | 8300 | 0 → 1 | Reference ease |
| Tick | Path length | 8300 | 8600 | 0 → 1 | Reference ease |
| Final composition | Hold | 8600 | 11000 | Completion label and tick | Hold |

Colour is static within the reference sequence. The original cab's perspective is
static; moving/morphing artwork beyond the above sequence is not inferred.

## Trigger and loop decisions

Original UI: click starts a single sequence; source JS resets its class after
10 seconds. Published GIF repeats as media but does not show that UI reset.

Study page: click/play starts, stops at the final frame, and supports explicit
pause/restart/scrub and 0.25×/0.5×/1×. Initial idle is preserved for matching clip
timestamps. Homepage: the same sequence may run as a labelled illustrative loop,
with a visible pause control. Playback pauses offscreen and in a hidden tab.
These two modes deliberately distinguish the original trigger from live marketing
presentation. Functional booking controls remain immediate.

Reduced motion: static completed illustration by default. If the user starts the
study, jump to the final pose without spatial movement; scrubbing still permits
inspection of individual static states. Responsive adaptation is uniform SVG
scaling from 360 to 1440 px, not reflow of animated geometry.

## Open questions and assumptions

- Original artist attribution is unresolved. Credit only the verified repository.
- GIF click release time is ~1000ms±60ms; the primary source capture removes this
  ambiguity by choosing exactly 1000ms.
- Original font is Roboto or Arial fallback. Use local Geist; text glyph widths
  intentionally differ, while centred anchors/baseline are preserved.
- No mobile recording exists. Preserve aspect ratio and scale, then test 360–1440px.
- Original source reset is not part of the captured sequence; study holds its final
  pose. Homepage loop restarts during the idle phase.
- Our truck, parcel, and check use original vector artwork, so pixel-perfect colour
  and internal drawing equality are neither intended nor claimed.
- A headless browser frame trace can establish performance in this environment;
  physical-device Safari/Android results remain unmeasured.

## Build contract

Use Vite + React + TypeScript and `motion/react`. Put all motion timing, easing,
tracks, and playback presets in `src/motion.ts`. Each animated element gets a
component; one orchestrator owns a shared MotionValue clock. Transform and opacity
are primary, with an SVG path-length draw for the completion tick.

Capture at least 8 identical reference timestamps with Playwright, save side-by-side
pairs in `compare/`, measure geometry anchors, list visual differences, tune and
repeat. Report measured timing/positions rather than generic similarity claims.
