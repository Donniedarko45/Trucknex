# Motion UI audit

Chromium browser checks cover the homepage journey and `/motion-study` at 1440, 390, and 360 px. Mobile checks emulate touch/coarse pointer input; they are not physical-device measurements.

- Axe WCAG A/AA checks found **zero violations** on the new motion controls at desktop/mobile and on the homepage. SVG/photo contrast items were marked incomplete by automation; visible scene text and controls were checked manually.
- Keyboard Space/Enter activate play, pause, restart, and playback speed. The native timeline works with arrows, Home, and End. End now reaches exactly **11000 ms** and displays `11.00 / 11.00s`.
- Pausing freezes all element transforms. Resuming advances the held pose. Scrolling the homepage scene offscreen pauses it and returning resumes it. A simulated `document.hidden` visibility change held the clock at 2300 ms, then resumed to 2700 ms without including hidden time.
- Reduced motion displays a static completed scene. The homepage motion toggle is disabled with an explanatory label; the studio timeline still permits pose inspection.
- Delaying the lazy module confirmed **0 px mobile card shift** after the fallback fix at 390 px. Desktop shift is approximately 1 px. Both 360 and 390 px layouts fit without horizontal overflow.
- Booking-to-contact route prefill and sample `TNX12345` query tracking still work.

## Production preview

The final Vite production build was checked independently of the development server. At 1440, 390, and 360 px, homepage play/pause/resume and studio play/pause/End passed. No browser errors or horizontal overflow occurred. Studio screenshots hold the deterministic 2500 ms pose. Homepage screenshots hold the loading pose using the visible pause control.

Local preview captures: `.preview/hero-1440.png`, `.preview/hero-390.png`, `.preview/motion-studio-1440.png`, and `.preview/motion-studio-390.png`. This UI audit makes no performance claim; timing and frame comparison are documented separately.
