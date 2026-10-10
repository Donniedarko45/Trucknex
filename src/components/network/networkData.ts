import { INDIA_OUTLINE } from "./indiaOutline";

type LonLat = readonly [lon: number, lat: number];
export type Point = { x: number; y: number };

/** Equirectangular projection tuned for India; one source for every map coordinate. */
export const MAP = { width: 440, height: 460, scale: 15, west: 68.17, north: 37.1, padX: 14, padY: 12 };
const xScale = MAP.scale * Math.cos((22 * Math.PI) / 180);

export function project([lon, lat]: LonLat): Point {
  return {
    x: MAP.padX + (lon - MAP.west) * xScale,
    y: MAP.padY + (MAP.north - lat) * MAP.scale,
  };
}

/** Real coordinates of cities and highway waypoints (decimal degrees). */
const PLACES = {
  Delhi: [77.21, 28.61],
  Jaipur: [75.79, 26.91],
  Ajmer: [74.64, 26.45],
  Udaipur: [73.71, 24.58],
  Ahmedabad: [72.57, 23.02],
  Vadodara: [73.18, 22.31],
  Surat: [72.83, 21.17],
  Mumbai: [72.88, 19.08],
  Pune: [73.86, 18.52],
  Satara: [74.0, 17.68],
  Kolhapur: [74.24, 16.7],
  Belagavi: [74.5, 15.85],
  Hubballi: [75.12, 15.36],
  Davanagere: [75.92, 14.46],
  Tumakuru: [77.1, 13.34],
  Bengaluru: [77.59, 12.97],
  Krishnagiri: [78.21, 12.52],
  Vellore: [79.13, 12.92],
  Chennai: [80.27, 13.08],
  Nellore: [79.99, 14.44],
  Vijayawada: [80.65, 16.51],
  Rajahmundry: [81.8, 17.0],
  Visakhapatnam: [83.22, 17.69],
  Berhampur: [84.79, 19.31],
  Bhubaneswar: [85.82, 20.3],
  Balasore: [86.93, 21.49],
  Kharagpur: [87.23, 22.35],
  Kolkata: [88.36, 22.57],
  Agra: [78.01, 27.18],
  Kanpur: [80.33, 26.45],
  Prayagraj: [81.85, 25.44],
  Varanasi: [82.97, 25.32],
  Aurangabad: [84.37, 24.75],
  Dhanbad: [86.43, 23.8],
  Asansol: [86.98, 23.68],
  Durgapur: [87.31, 23.52],
  Gwalior: [78.18, 26.22],
  Jhansi: [78.57, 25.45],
  Sagar: [78.74, 23.84],
  Nagpur: [79.09, 21.15],
  Adilabad: [78.53, 19.66],
  Hyderabad: [78.49, 17.39],
  Kurnool: [78.04, 15.83],
  Anantapur: [77.6, 14.68],
} as const satisfies Record<string, LonLat>;

type Place = keyof typeof PLACES;

/** Catmull-Rom through the waypoints, so the line passes every town on the highway. */
export function smoothPath(points: readonly Point[]): string {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

const route = (...stops: Place[]) => stops.map((stop) => project(PLACES[stop]));

export const OUTLINE_PATH =
  INDIA_OUTLINE.map((coord, i) => {
    const { x, y } = project(coord);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join("") + "Z";

/** Golden Quadrilateral and the NH44 north–south spine, drawn as the quiet network. */
export const HIGHWAYS = [
  route("Delhi", "Jaipur", "Ajmer", "Udaipur", "Ahmedabad", "Vadodara", "Surat", "Mumbai"),
  route("Mumbai", "Pune", "Satara", "Kolhapur", "Belagavi", "Hubballi", "Davanagere", "Tumakuru", "Bengaluru"),
  route("Bengaluru", "Krishnagiri", "Vellore", "Chennai"),
  route("Chennai", "Nellore", "Vijayawada", "Rajahmundry", "Visakhapatnam", "Berhampur", "Bhubaneswar", "Balasore", "Kharagpur", "Kolkata"),
  route("Delhi", "Agra", "Kanpur", "Prayagraj", "Varanasi", "Aurangabad", "Dhanbad", "Asansol", "Durgapur", "Kolkata"),
  route("Delhi", "Agra", "Gwalior", "Jhansi", "Sagar", "Nagpur", "Adilabad", "Hyderabad", "Kurnool", "Anantapur", "Bengaluru"),
].map(smoothPath);

/** Labelled hubs; `side` keeps neighbouring labels (Bengaluru/Chennai) apart. */
export const HUBS = (
  [
    ["Delhi", "end"],
    ["Mumbai", "start"],
    ["Kolkata", "start"],
    ["Hyderabad", "start"],
    ["Bengaluru", "end"],
    ["Chennai", "below"],
  ] as const
).map(([name, side]) => ({ name, side, ...project(PLACES[name]) }));

/**
 * Approximate road distance on the named national highway, and typical
 * full-truckload transit. Confirm against operations data before launch.
 */
export const CORRIDORS = [
  {
    id: "del-bom",
    from: "Delhi",
    to: "Mumbai",
    highway: "NH48",
    via: ["Jaipur", "Ahmedabad", "Surat"],
    km: 1420,
    transit: "3–4 days",
    stops: route("Delhi", "Jaipur", "Ajmer", "Udaipur", "Ahmedabad", "Vadodara", "Surat", "Mumbai"),
  },
  {
    id: "bom-blr",
    from: "Mumbai",
    to: "Bengaluru",
    highway: "NH48",
    via: ["Pune", "Kolhapur", "Hubballi"],
    km: 985,
    transit: "2–3 days",
    stops: route("Mumbai", "Pune", "Satara", "Kolhapur", "Belagavi", "Hubballi", "Davanagere", "Tumakuru", "Bengaluru"),
  },
  {
    id: "del-ccu",
    from: "Delhi",
    to: "Kolkata",
    highway: "NH19",
    via: ["Agra", "Kanpur", "Varanasi"],
    km: 1530,
    transit: "4–5 days",
    stops: route("Delhi", "Agra", "Kanpur", "Prayagraj", "Varanasi", "Aurangabad", "Dhanbad", "Asansol", "Durgapur", "Kolkata"),
  },
].map((corridor) => ({ ...corridor, path: smoothPath(corridor.stops) }));

export type Corridor = (typeof CORRIDORS)[number];

/** Drive timing: longer roads take longer, on the site's --ease-in-out curve. */
export const NETWORK_MOTION = {
  msPerKm: 1.1,
  ease: [0.77, 0, 0.175, 1] as const, // matches --ease-in-out in styles.css
};
