import { useEffect, useRef, useState, useId } from "react";
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { MOTION, clampTime, stageAt, type PlaybackSpeed } from "../../motion";
import { Labels, Parcel, Road, Truck } from "./DispatchElements";
import "./dispatch.css";

type Playback = {
  clock: MotionValue<number>;
  playing: boolean;
  speed: PlaybackSpeed;
  reduced: boolean;
  play: () => void;
  pause: () => void;
  restart: () => void;
  seek: (time: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
};

function DevPanel({ playback }: { playback: Playback }) {
  const { clock, playing, speed, play, pause, restart, seek, setSpeed } =
    playback;
  const [time, setTime] = useState(clock.get());
  const lastBucket = useRef(-1);
  useEffect(() => {
    if (!playing) setTime(clock.get());
  }, [playing, clock]);
  useMotionValueEvent(clock, "change", (next) => {
    const bucket = Math.floor(next / MOTION.panelRefresh);
    if (!playing || bucket !== lastBucket.current || next === MOTION.duration) {
      lastBucket.current = bucket;
      setTime(next);
    }
  });
  const id = useId();
  return (
    <section className="dispatch-dev-panel" aria-label="Animation controls">
      <div className="dispatch-panel-top">
        <div className="dispatch-play-buttons">
          <button onClick={playing ? pause : play} type="button">
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? "Pause" : "Play"}
          </button>
          <button onClick={restart} type="button">
            <RotateCcw size={15} /> Restart
          </button>
        </div>
        <div
          className="dispatch-speed"
          role="group"
          aria-label="Playback speed"
        >
          {MOTION.speeds.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={speed === value}
              onClick={() => setSpeed(value)}
            >
              {value}×
            </button>
          ))}
        </div>
      </div>
      <div className="dispatch-scrub-label">
        <label htmlFor={id}>Timeline</label>
        <output htmlFor={id}>
          {(time / 1000).toFixed(2)} / {(MOTION.duration / 1000).toFixed(2)}s
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={MOTION.duration}
        step={MOTION.scrubStep}
        value={time}
        aria-label="Timeline"
        aria-valuetext={`${Math.round(time)} milliseconds, ${stageAt(time)}`}
        onChange={(event) => seek(Number(event.target.value))}
      />
      <div className="dispatch-panel-status">
        <span>{stageAt(time)}</span>
        <span>
          Frame {Math.min(330, Math.round(time / MOTION.frameDuration) + 1)} /
          330
        </span>
      </div>
      {playback.reduced && (
        <p className="dispatch-reduced-note">
          Reduced motion is on. Play shows the completed scene; the timeline
          still lets you inspect each pose.
        </p>
      )}
    </section>
  );
}

export function DispatchScene({
  clock,
  compact = false,
}: {
  clock: MotionValue<number>;
  compact?: boolean;
}) {
  const clipId = `dispatch-${useId().replace(/:/g, "")}`;
  const { pill, viewport } = MOTION;
  return (
    <svg
      className={`dispatch-scene${compact ? " dispatch-scene-compact" : ""}`}
      viewBox={
        compact
          ? `${pill.x} ${pill.y} ${pill.width * pill.scale} ${pill.height * pill.scale}`
          : `0 0 ${viewport.width} ${viewport.height}`
      }
      role="img"
      aria-label="Illustrative Trucknex freight journey: loading a parcel, closing the truck doors, travelling, and arriving."
      data-testid="dispatch-scene"
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={pill.width} height={pill.height} rx={pill.radius} />
        </clipPath>
      </defs>
      <g transform={`translate(${pill.x} ${pill.y}) scale(${pill.scale})`}>
        <rect
          width={pill.width}
          height={pill.height}
          rx={pill.radius}
          fill="#191919"
          data-testid="dispatch-pill"
        />
        <g clipPath={`url(#${clipId})`}>
          <Road clock={clock} />
          <Parcel clock={clock} />
          <Truck clock={clock} />
          <Labels clock={clock} />
        </g>
      </g>
    </svg>
  );
}

export default function DispatchAnimation({
  autoPlay = false,
  loop = false,
  controls = false,
  compact = false,
  initialTime = 0,
  frozen = false,
  showToggle = false,
}: {
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  compact?: boolean;
  initialTime?: number;
  frozen?: boolean;
  showToggle?: boolean;
}) {
  const reduced = !!useReducedMotion();
  const clock = useMotionValue(
    clampTime(reduced && !frozen ? MOTION.duration : initialTime),
  );
  const root = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(autoPlay && !reduced && !frozen);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(node);
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (!playing || !inView || !pageVisible || reduced || frozen) return;
    const controller = animate(clock, MOTION.duration, {
      duration: (MOTION.duration - clock.get()) / (1000 * speed),
      ease: MOTION.clockEase,
      onComplete: () => {
        if (loop) {
          clock.set(0);
          setCycle((value) => value + 1);
        } else setPlaying(false);
      },
    });
    return () => controller.stop();
  }, [
    clock,
    playing,
    speed,
    inView,
    pageVisible,
    reduced,
    frozen,
    loop,
    cycle,
  ]);

  useEffect(() => {
    if (reduced && !frozen) {
      setPlaying(false);
      clock.set(MOTION.duration);
    }
  }, [reduced, frozen, clock]);

  const playback: Playback = {
    clock,
    playing,
    speed,
    reduced,
    play: () => {
      if (reduced) {
        clock.set(MOTION.duration);
        return;
      }
      if (clock.get() >= MOTION.duration) clock.set(0);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    restart: () => {
      clock.set(reduced ? MOTION.duration : 0);
      setPlaying(!reduced);
      setCycle((value) => value + 1);
    },
    seek: (time) => {
      setPlaying(false);
      clock.set(clampTime(time));
    },
    setSpeed,
  };

  return (
    <div
      ref={root}
      className="dispatch-animation"
      data-playing={playing && inView && pageVisible && !reduced && !frozen}
      data-reduced-motion={reduced}
      data-testid="dispatch-animation"
    >
      <DispatchScene clock={clock} compact={compact} />
      {controls && <DevPanel playback={playback} />}
      {showToggle && (
        <div className="dispatch-animation-footer">
          <span>Illustrative journey</span>
          <button
            className="dispatch-motion-toggle"
            type="button"
            onClick={playing ? playback.pause : playback.play}
            disabled={reduced}
            aria-label={
              reduced
                ? "Motion reduced"
                : playing
                  ? "Pause animation"
                  : "Play animation"
            }
          >
            {playing ? <Pause size={12} /> : <Play size={12} />}
            {reduced ? "Motion reduced" : playing ? "Pause" : "Play"}
          </button>
        </div>
      )}
    </div>
  );
}
