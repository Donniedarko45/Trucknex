import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, Clock3, Route } from "lucide-react";
import {
  CORRIDORS,
  HIGHWAYS,
  HUBS,
  MAP,
  NETWORK_MOTION,
  OUTLINE_PATH,
} from "./networkData";

/** x(t) → y(t) for a CSS cubic-bezier; one solve per frame is negligible. */
function cubicBezier([x1, y1, x2, y2]: readonly number[]) {
  const axis = (a: number, b: number, t: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  return (x: number) => {
    let low = 0;
    let high = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (axis(x1, x2, mid) < x) low = mid;
      else high = mid;
    }
    return axis(y1, y2, (low + high) / 2);
  };
}

const ease = cubicBezier(NETWORK_MOTION.ease);
const formatKm = (km: number) => Math.round(km).toLocaleString("en-IN");

export default function FreightMap({ selected }: { selected: number }) {
  const corridor = CORRIDORS[selected];
  const maskId = `route-reveal-${useId().replace(/:/g, "")}`;
  const root = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const reveal = useRef<SVGPathElement>(null);
  const truck = useRef<SVGGElement>(null);
  const odometer = useRef<HTMLSpanElement>(null);
  const viaDots = useRef<(SVGCircleElement | null)[]>([]);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Layout effect: the new route must be hidden before the browser paints it.
  useLayoutEffect(() => {
    const path = route.current;
    if (!path) return;
    const length = path.getTotalLength();

    // Where along the road each intermediate town sits, as a 0–1 fraction.
    const samples = Array.from({ length: 241 }, (_, i) => {
      const at = (i / 240) * length;
      return { at, point: path.getPointAtLength(at) };
    });
    const viaAt = corridor.stops.slice(1, -1).map((stop) => {
      const nearest = samples.reduce((best, sample) =>
        Math.hypot(sample.point.x - stop.x, sample.point.y - stop.y) <
        Math.hypot(best.point.x - stop.x, best.point.y - stop.y)
          ? sample
          : best,
      );
      return nearest.at / length;
    });

    const draw = (progress: number) => {
      const at = progress * length;
      const point = path.getPointAtLength(at);
      const ahead = path.getPointAtLength(Math.min(length, at + 1));
      const behind = path.getPointAtLength(Math.max(0, at - 1));
      const angle =
        (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
      reveal.current?.style.setProperty("stroke-dashoffset", `${1 - progress}`);
      truck.current?.setAttribute(
        "transform",
        `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(1)})`,
      );
      if (odometer.current)
        odometer.current.textContent = formatKm(progress * corridor.km);
      viaDots.current.forEach((dot, i) => {
        const lit = String(progress >= viaAt[i]);
        if (dot && dot.dataset.lit !== lit) dot.dataset.lit = lit;
      });
      if (root.current) root.current.dataset.arrived = String(progress >= 1);
    };

    // Reserve the final number's width so "km" stays put while the count runs.
    const counter = odometer.current;
    if (counter) {
      counter.style.minWidth = "";
      counter.textContent = formatKm(corridor.km);
      counter.style.minWidth = `${counter.getBoundingClientRect().width}px`;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      draw(1);
      return;
    }
    draw(0);
    if (!inView) return;

    const duration = corridor.km * NETWORK_MOTION.msPerKm;
    let frame = 0;
    let start: number | undefined;
    const tick = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / duration);
      draw(ease(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [corridor, inView]);

  const origin = corridor.stops[0];
  const destination = corridor.stops[corridor.stops.length - 1];

  return (
    <div className="freight-map" ref={root} data-arrived="false">
      <div className="map-utility">
        <span className="status-dot" /> CONNECTED ACROSS INDIA{" "}
        <span>TNX / NETWORK</span>
      </div>
      <svg
        viewBox={`0 0 ${MAP.width} ${MAP.height}`}
        preserveAspectRatio="xMinYMid meet"
        role="img"
        aria-label={`Map of India showing the ${corridor.from} to ${corridor.to} corridor along ${corridor.highway}`}
      >
        <defs>
          <pattern
            id="tnx-map-pattern"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.1" fill="#5d5d56" />
          </pattern>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={MAP.width}
            height={MAP.height}
          >
            <path
              key={corridor.id}
              ref={reveal}
              d={corridor.path}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth="10"
              strokeDasharray="1 1"
              strokeDashoffset="1"
            />
          </mask>
        </defs>
        <path
          d={OUTLINE_PATH}
          fill="url(#tnx-map-pattern)"
          stroke="#6b6a62"
          strokeWidth=".7"
          strokeLinejoin="round"
        />
        <g className="map-highways" fill="none">
          {HIGHWAYS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <path
          key={corridor.id}
          ref={route}
          className="corridor-route"
          d={corridor.path}
          mask={`url(#${maskId})`}
        />
        <g key={`${corridor.id}-via`}>
          {corridor.stops.slice(1, -1).map((stop, i) => (
            <circle
              key={i}
              ref={(dot) => {
                viaDots.current[i] = dot;
              }}
              className="corridor-via-dot"
              cx={stop.x}
              cy={stop.y}
              r="2.4"
              data-lit="false"
            />
          ))}
        </g>
        <circle
          key={`${corridor.id}-origin`}
          className="corridor-halo corridor-halo-origin"
          cx={origin.x}
          cy={origin.y}
          r="11"
        />
        <circle
          key={`${corridor.id}-destination`}
          className="corridor-halo corridor-halo-destination"
          cx={destination.x}
          cy={destination.y}
          r="11"
        />
        {HUBS.map((hub) => {
          const active = hub.name === corridor.from || hub.name === corridor.to;
          const below = hub.side === "below";
          const anchor = hub.side === "below" ? "middle" : hub.side;
          return (
            <g key={hub.name} className="map-hub" data-active={active}>
              <circle cx={hub.x} cy={hub.y} r="3.6" />
              <text
                x={below ? hub.x : hub.x + (hub.side === "start" ? 8 : -8)}
                y={below ? hub.y + 16 : hub.y + 4}
                textAnchor={anchor}
              >
                {hub.name}
              </text>
            </g>
          );
        })}
        <g ref={truck} className="corridor-truck" aria-hidden="true">
          <g transform="translate(-8 -4)">
            <rect width="10" height="8" rx="1.2" fill="#faf8f3" />
            <rect x="11" width="5" height="8" rx="1.6" fill="#f15a24" />
          </g>
        </g>
      </svg>
      <div className="network-map-card" aria-live="polite">
        <div className="corridor-label">
          <Route size={16} aria-hidden="true" />
          <span>EXPLORE A CORRIDOR</span>
          <span className="corridor-highway">{corridor.highway}</span>
        </div>
        <div className="corridor-swap" key={corridor.id}>
          <strong>
            {corridor.from} <ArrowRight size={18} aria-hidden="true" />
            <span className="sr-only"> to </span>
            {corridor.to}
          </strong>
          <p className="corridor-via">via {corridor.via.join(" · ")}</p>
        </div>
        <dl className="corridor-stats">
          <div>
            <dt>Road distance</dt>
            <dd>
              <span
                ref={odometer}
                className="corridor-odometer"
                aria-hidden="true"
              >
                {formatKm(corridor.km)}
              </span>
              <span className="sr-only">{formatKm(corridor.km)}</span> km
            </dd>
          </div>
          <div>
            <dt>Typical transit</dt>
            <dd className="corridor-swap" key={`${corridor.id}-transit`}>
              <Clock3 size={14} aria-hidden="true" />
              {corridor.transit}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
