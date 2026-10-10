import { cubicBezier } from "motion";

/** All times are milliseconds in the independently recorded 30 fps reference. */
export const MOTION = {
  duration: 11_000,
  trigger: 1_000,
  complete: 8_600,
  frameDuration: 1_000 / 30,
  scrubStep: 1,
  speeds: [0.25, 0.5, 1] as const,
  referenceEase: [0.25, 0.1, 0.25, 1] as const,
  uiEase: [0.23, 1, 0.32, 1] as const,
  pressDuration: 0.16,
  releaseDuration: 0.1,
  panelRefresh: 100,
  clockEase: "linear" as const,
  viewport: { width: 880, height: 440 },
  pill: { x: 218, y: 161, width: 240, height: 63, scale: 1.75, radius: 32 },
  truck: { y: 11, bodyWidth: 60, bodyHeight: 41, cabWidth: 26 },
  parcel: { y: 21, size: 21 },
  road: { y: 30, dashWidth: 6, pitch: 15, height: 2.1, count: 24 },
  upperDoor: { x: 2, y: 5, width: 20, height: 2 },
  lowerDoor: { x: 2, y: 36, width: 20, height: 2 },
  label: { x: 120, y: 19, height: 24, size: 16 },
  stages: [
    { time: 0, label: "Ready to move" },
    { time: 1_000, label: "Finding the right fit" },
    { time: 2_000, label: "Loading the cargo" },
    { time: 4_000, label: "On the road" },
    { time: 7_000, label: "The final mile" },
    { time: 8_600, label: "Journey complete" },
  ],
  keyFrames: [1, 37, 46, 61, 76, 106, 151, 181, 211, 226, 245, 250, 255, 262],
} as const;

export type PlaybackSpeed = (typeof MOTION.speeds)[number];
export type Segment = {
  start: number;
  end: number;
  from: number;
  to: number;
};
export type Track = { initial: number; segments: readonly Segment[] };

export const TRACKS = {
  truckX: {
    initial: 264,
    segments: [
      { start: 1000, end: 2000, from: 264, to: 76 },
      { start: 4000, end: 5000, from: 76, to: 136 },
      { start: 5000, end: 7000, from: 136, to: 16 },
      { start: 7000, end: 8500, from: 16, to: 264 },
    ],
  },
  parcelX: {
    initial: -21,
    segments: [
      { start: 1000, end: 1800, from: -21, to: 19 },
      { start: 2000, end: 3500, from: 19, to: 91 },
      { start: 3600, end: 3700, from: 91, to: -21 },
    ],
  },
  parcelOpacity: {
    initial: 1,
    segments: [{ start: 3500, end: 3600, from: 1, to: 0 }],
  },
  upperDoor: {
    initial: -90,
    segments: [
      { start: 1300, end: 2020, from: -90, to: 32 },
      { start: 2500, end: 3700, from: 32, to: -90 },
    ],
  },
  lowerDoor: {
    initial: 90,
    segments: [
      { start: 1600, end: 2320, from: 90, to: -32 },
      { start: 2800, end: 4000, from: -32, to: 90 },
    ],
  },
  headlights: {
    initial: 0,
    segments: [{ start: 4000, end: 5000, from: 0, to: 1 }],
  },
  lightScale: {
    initial: 0.88,
    segments: [{ start: 4000, end: 5000, from: 0.88, to: 0.94 }],
  },
  roadX: {
    initial: 240,
    segments: [{ start: 4000, end: 11000, from: 240, to: -160 }],
  },
  roadOpacity: {
    initial: 0,
    segments: [
      { start: 4000, end: 4500, from: 0, to: 1 },
      { start: 7500, end: 8000, from: 1, to: 0 },
    ],
  },
  defaultOpacity: {
    initial: 1,
    segments: [{ start: 1000, end: 1300, from: 1, to: 0 }],
  },
  successOpacity: {
    initial: 0,
    segments: [{ start: 8000, end: 8300, from: 0, to: 1 }],
  },
  checkLength: {
    initial: 0,
    segments: [{ start: 8300, end: 8600, from: 0, to: 1 }],
  },
} as const satisfies Record<string, Track>;

const referenceEase = cubicBezier(...MOTION.referenceEase);

/** Gaps in a track hold the previous pose, so seeking and reversing are exact. */
export function sampleTrack(time: number, track: Track): number {
  let value = track.initial;
  for (const segment of track.segments) {
    if (time < segment.start) return value;
    if (time <= segment.end) {
      const progress = (time - segment.start) / (segment.end - segment.start);
      return (
        segment.from + (segment.to - segment.from) * referenceEase(progress)
      );
    }
    value = segment.to;
  }
  return value;
}

export function stageAt(time: number) {
  return [...MOTION.stages].reverse().find((stage) => time >= stage.time)!
    .label;
}

export function clampTime(time: number) {
  return Math.min(
    MOTION.duration,
    Math.max(0, Number.isFinite(time) ? time : 0),
  );
}
