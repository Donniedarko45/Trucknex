import { useId } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { MOTION, TRACKS, sampleTrack } from "../../motion";

type ElementProps = { clock: MotionValue<number> };

const svgOrigin = {
  transformBox: "view-box" as const,
  transformOrigin: "0px 0px",
  originX: 0,
  originY: 0,
};

/** These elements share one clock: scrubbing cannot leave a child behind. */
export function Road({ clock }: ElementProps) {
  const transform = useTransform(
    clock,
    (time) =>
      `translate(${sampleTrack(time, TRACKS.roadX)}px, ${MOTION.road.y}px)`,
  );
  const opacity = useTransform(clock, (time) =>
    sampleTrack(time, TRACKS.roadOpacity),
  );

  return (
    <motion.g
      aria-hidden="true"
      data-testid="dispatch-road"
      data-motion-element="road"
      style={{ ...svgOrigin, transform, opacity }}
      fill="#fff"
    >
      {Array.from({ length: MOTION.road.count }, (_, index) => (
        <rect
          key={index}
          x={index * MOTION.road.pitch}
          y={0}
          width={MOTION.road.dashWidth}
          height={MOTION.road.height}
          rx={1}
        />
      ))}
    </motion.g>
  );
}

export function Parcel({ clock }: ElementProps) {
  const gradient = useId();
  const transform = useTransform(
    clock,
    (time) =>
      `translate(${sampleTrack(time, TRACKS.parcelX)}px, ${MOTION.parcel.y}px)`,
  );
  const opacity = useTransform(clock, (time) =>
    sampleTrack(time, TRACKS.parcelOpacity),
  );

  return (
    <motion.g
      aria-hidden="true"
      data-testid="dispatch-parcel"
      data-motion-element="parcel"
      style={{ ...svgOrigin, transform, opacity }}
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2d3a5" />
          <stop offset="1" stopColor="#c99760" />
        </linearGradient>
      </defs>
      <rect
        width={MOTION.parcel.size}
        height={MOTION.parcel.size}
        rx={2}
        fill={`url(#${gradient})`}
      />
      <path d="M0 10.5H21" stroke="#8e603d" strokeOpacity=".44" />
      <path d="M9 0H12V9.5H9Z" fill="#f9e6c8" />
      <path d="M3 15H7M3 17H6" stroke="#79573c" strokeWidth=".8" />
      <path
        d="m15 16 2-2 2 2m-2-2v4"
        fill="none"
        stroke="#79573c"
        strokeWidth=".8"
      />
    </motion.g>
  );
}

export function Door({
  clock,
  side,
}: ElementProps & { side: "upper" | "lower" }) {
  const geometry = side === "upper" ? MOTION.upperDoor : MOTION.lowerDoor;
  const track = side === "upper" ? TRACKS.upperDoor : TRACKS.lowerDoor;
  const transform = useTransform(
    clock,
    (time) =>
      `translate(${geometry.x}px, ${geometry.y}px) rotate(${sampleTrack(time, track)}deg)`,
  );

  return (
    <motion.g
      data-testid={`dispatch-${side}-door`}
      data-motion-element={`${side}-door`}
      style={{ ...svgOrigin, transform }}
    >
      <rect
        x={-geometry.width}
        y={-geometry.height / 2}
        width={geometry.width}
        height={geometry.height}
        rx={1}
        fill="#faf8f3"
      />
      <rect x={-3} y={-1} width={2} height={2} fill="#a5aaa8" />
    </motion.g>
  );
}

/** Original Trucknex top-down trailer artwork; its outline is the measured anchor. */
function Trailer() {
  const gradient = useId();
  return (
    <g data-motion-element="trailer">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffefb" />
          <stop offset="1" stopColor="#d9ded9" />
        </linearGradient>
      </defs>
      <rect
        width={MOTION.truck.bodyWidth}
        height={MOTION.truck.bodyHeight}
        data-testid="dispatch-trailer"
        rx={2}
        fill={`url(#${gradient})`}
      />
      <path
        d="M3 3H56M3 38H56"
        stroke="#b7bdb8"
        strokeOpacity=".65"
        strokeWidth=".65"
      />
      <path d="M6 5V36M54 5V36" stroke="#c6cbc6" strokeWidth=".65" />
      <rect x="10" y="16" width="5" height="9" rx="1" fill="#f15a24" />
      <path d="m11.5 22 2-2-2-2" fill="none" stroke="#fff" strokeWidth=".9" />
      <text
        x="18"
        y="23.1"
        fontFamily="Geist, sans-serif"
        fontSize="7.7"
        fontWeight="650"
        fill="#242824"
        letterSpacing="-.3"
      >
        trucknex
      </text>
      <path d="M2 5V36" stroke="#b5bbb6" strokeWidth="1" />
    </g>
  );
}

/** The cab is built from simple vector surfaces, with no source artwork. */
function Cab() {
  return (
    <g
      transform={`translate(${MOTION.truck.bodyWidth} 0)`}
      data-motion-element="cab"
    >
      <rect x="0" y="14" width="3" height="13" rx=".6" fill="#737a75" />
      <path d="M2 0H17Q26 0 26 9V32Q26 41 17 41H2Z" fill="#f15a24" />
      <path d="M3 3H17Q23 3 23 9V32Q23 38 17 38H3Z" fill="#f99a5b" />
      <path d="M12 3H17Q23 3 23 9V32Q23 38 17 38H12Z" fill="#262e2c" />
      <path
        d="m14 7 7 2v2l-7-2Zm0 6 7 2v2l-7-2Z"
        fill="#708882"
        fillOpacity=".65"
      />
      <path d="M4 7H10V34H4Z" fill="#ef7840" />
      <path d="M3 5H8M3 36H8" stroke="#fff0e4" strokeWidth="1" />
      <rect x="2" y="1.5" width="4" height="2" rx=".7" fill="#202724" />
      <rect x="2" y="37.5" width="4" height="2" rx=".7" fill="#202724" />
      <path d="M24 14V27" stroke="#dc471a" strokeWidth="1.4" />
    </g>
  );
}

export function Headlights({ clock }: ElementProps) {
  const gradient = useId();
  const opacity = useTransform(clock, (time) =>
    sampleTrack(time, TRACKS.headlights),
  );
  const transform = useTransform(
    clock,
    (time) => `scaleX(${sampleTrack(time, TRACKS.lightScale)})`,
  );

  const { length, root, outer, inner } = MOTION.beam;
  return (
    <g data-motion-element="headlights">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f5dc77" stopOpacity=".8" />
          <stop offset=".55" stopColor="#f5dc77" stopOpacity=".22" />
          <stop offset="1" stopColor="#f5dc77" stopOpacity=".05" />
        </linearGradient>
      </defs>
      {[4, 29].map((y, index) => (
        <g key={y} transform={`translate(83 ${y})`}>
          <rect x=".6" width="2.4" height="8" rx="1" fill="#f5dc77" />
          {/* The lower beam mirrors the upper one so both flare outward. */}
          <g transform={`translate(3 4) scale(1 ${index ? -1 : 1})`}>
            <motion.path
              d={`M0 ${-root} ${length} ${-outer}V${inner}L0 ${root}Z`}
              fill={`url(#${gradient})`}
              style={{ ...svgOrigin, opacity, transform }}
            />
          </g>
        </g>
      ))}
    </g>
  );
}

export function Truck({ clock }: ElementProps) {
  const transform = useTransform(
    clock,
    (time) =>
      `translate(${sampleTrack(time, TRACKS.truckX)}px, ${MOTION.truck.y}px)`,
  );

  return (
    <motion.g
      aria-hidden="true"
      data-testid="dispatch-truck"
      data-motion-element="truck"
      style={{ ...svgOrigin, transform }}
    >
      <Door clock={clock} side="upper" />
      <Door clock={clock} side="lower" />
      <Trailer />
      <Cab />
      <Headlights clock={clock} />
    </motion.g>
  );
}

function IdleLabel({ clock }: ElementProps) {
  const opacity = useTransform(clock, (time) =>
    sampleTrack(time, TRACKS.defaultOpacity),
  );
  return (
    <motion.foreignObject
      x="0"
      y={MOTION.label.y}
      width={MOTION.pill.width}
      height={MOTION.label.height}
      style={{ opacity }}
      data-motion-element="idle-label"
    >
      <div style={labelStyle}>Make a move</div>
    </motion.foreignObject>
  );
}

function ConfirmationCheck({ clock }: ElementProps) {
  const pathLength = useTransform(clock, (time) =>
    sampleTrack(time, TRACKS.checkLength),
  );
  const opacity = useTransform(pathLength, (length) => (length > 0 ? 1 : 0));
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" style={{ flexShrink: 0 }}>
      <motion.path
        d="M1 5.5 4.8 9 11 1"
        fill="none"
        stroke="#9dc59c"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pathLength, opacity }}
        data-motion-element="confirmation-check"
      />
    </svg>
  );
}

function CompleteLabel({ clock }: ElementProps) {
  const opacity = useTransform(clock, (time) =>
    sampleTrack(time, TRACKS.successOpacity),
  );
  return (
    <motion.foreignObject
      x="0"
      y={MOTION.label.y}
      width={MOTION.pill.width}
      height={MOTION.label.height}
      style={{ opacity }}
      data-motion-element="complete-label"
    >
      <div style={labelStyle}>
        Journey complete
        <ConfirmationCheck clock={clock} />
      </div>
    </motion.foreignObject>
  );
}

const labelStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  height: MOTION.label.height,
  fontFamily: "Geist, sans-serif",
  fontSize: MOTION.label.size,
  fontWeight: 500,
  lineHeight: `${MOTION.label.height}px`,
  color: "#faf8f3",
  whiteSpace: "nowrap" as const,
};

export function Labels({ clock }: ElementProps) {
  return (
    <g aria-hidden="true" data-testid="dispatch-labels">
      <IdleLabel clock={clock} />
      <CompleteLabel clock={clock} />
    </g>
  );
}
