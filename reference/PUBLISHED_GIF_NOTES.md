# Selected motion reference

Verified source: https://github.com/shafiei/truck-order-animation
Verified commit: a92b4a1c17d309ea3b39135a5292d9331bb20cef
Repository Git author: Mohammad Reza Shafiei.
Direct reference GIF: https://github.com/shafiei/truck-order-animation/blob/a92b4a1c17d309ea3b39135a5292d9331bb20cef/Order-Button-to-Top-Down-View-Delivery-Truck-on-Road-Animation.gif

The repository is a public source of the reference. Original creation/artist attribution is not established by its README; do not attribute it to Aaron Iker or heydamir. Use the GIF for the internal reference study and make original Trucknex text, vector artwork, and implementation.

## Reference properties

880 x 440 pixels. 141 GIF frames with variable durations (mostly 60 ms, several 30 ms, one 120 ms); total 8770 ms. GIF loop metadata is 0 (indefinite repeat). The actual UI starts on a click, and source JS removes its active class after 10 seconds. The GIF is a partial recording; it does not show the 10-second UI reset. Cursor movement is a recording artifact.

The pill occupies x218..637 and y161..271, approximately 420 x110. Rounded ends radius55. Centre (428,216). No logo. Whole scene is a pale blue background, pill charcoal, white default/success text, white/grey top-down cargo truck with blue cab, tan parcel, white loading doors and moving road dashes, yellow headlight beams, green completion tick. Own assets should replace the blue cab/parcel artwork and own copy should replace both labels while retaining their visual roles.

Nominal source coordinate units are scaled by 1.75 in the GIF: pill 240x63; cargo 60x41; cab 26x41; parcel 21x21; top-down truck top 11px; parcel top 21px; road height 3px anddash width 6px with 15px pitch.

## Animation zero

Best normalized origin is GIF 1000 ms. Press is visible from GIF 920 ms, label and parcel start visibly changing at 1040 ms. Exact pointer up timestamp is not directly visible. Numerical fit using observed cargo x positions and inverse CSS ease gives GIF_time=1014.6+0.960287*source_time, maximum 65.8 ms residual including quantized 60 ms GIF sampling. Timing values below are normalized by subtracting 1000 ms. Durations reflect measured GIF, not a blind copy of 10-second source.

| Element/property | Approx start | Approx end | Values/observations |
| --- | ---: | ---: | --- |
| Pill press scale | -80ms | 40ms | 1→~.96→1; pointer recording only |
| Default label opacity | 15ms | 303ms | 1→0, CSS ease inferred |
| Truck enter x | 15ms | 975ms | absolute cargo x680→351; first visible at GIF 1190 ms, x595, enters from right |
| Truck loading hold x | 975ms | 2895ms | cargo x351,white body width 105 |
| Truck move right x | 2895ms | 3856ms | cargo x351→456, CSS ease |
| Truck moves left x | 3856ms | 5776ms | cargo x456→246, CSS ease |
| Truck departs right x | 5776ms | 7217ms | x246→680; fully clipped at6670ms |
| Parcel arrive x | 15ms | 783ms | nominal absolute left 181→251; clipped until it crosses pill left x218 |
| Parcel hold x | 783ms | 975ms | x251 |
| Parcel load x | 975ms | 2415ms | x251→377; occluded by cargo by~1810ms |
| Parcel opacity | 2415ms | 2511ms | 1→0,already occluded |
| Upperdoor rotate | 303ms | 2607ms | closed -90deg→open 32deg→closed -90deg; open hold~994–1455ms |
| Lowerdoor rotate | 591ms | 2895ms | closed 90deg→open -32deg→closed 90deg; open hold~1282–1743ms |
| Headlights opacity | 2895ms | 3856ms | 0→1; appear at GIF 4100 ms, faint at first; persist through drive |
| Road opacity | 2895ms | 3376ms | 0→1 |
| Road x | 2895ms | referenceend | leftward moving dashes; source x0→-400 over 10 seconds is not fully shown |
| Road opacity | 6256ms | 6737ms | 1→0 |
| Success label opacity | 6737ms | 7025ms | 0→1; first faint at GIF 7730–7790,full at GIF 7910–7970 |
| Tick path draw | 7025ms | 7313ms | hidden→full; first at GIF 8030,full at GIF 8180–8240 |

Easing candidate: cubic-bezier(.25,.1,.25,1), which agrees with source and observed cargo positions. No visible spring overshoot except the pressed pill returning to 1; use ease rather than invented springs.

## Open questions and choices

- Exact trigger release moment cannot be identified to <30 ms; chooseGIF 1000 ms as normalized zero.
- The GIF recording runs at ~0.96 relative to source CSS time; fit observed GIF landmarks and retain original GIF durations when converting to 30 fps.
- The press and cursor are not part of the truck sequence. Exclude cursor and show trigger press only when a human activates replay.
- No full reset is recorded; hold completion state and expose a replay control. Loop only in the demo if explicitly selected.
- Mobile behavior is not shown. Preserve aspect ratio on 360–1440 px, scale original vectors uniformly.
- Exact original font cannot be confirmed. Use existing Geist for own labels with the same baseline and approximately 28 px reference font size.

Contact sheets: contact-sheet.png (full scene at major observed timestamps), detail-contact-sheet.png (34 state crops with actual GIF timestamp and normalized time). observed-body.json contains all frame start timestamps, durations and detected cargo white body x bounds.
