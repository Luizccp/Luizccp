// GTA 6 delays short (PT-BR): shot list + cameras. Times come from gta6-shorts/shots_plan_1.json (voice_pt_faber.wav, 30 fps).
export const FPS = 30;
export const TOTAL = 2036;
export type V3 = [number, number, number];
export type Light = "day" | "golden";
export type GCam = { pos: V3; look: V3; fov: number; roll: number };
export type GShot = { id: number; a: number; b: number; light: Light; set: "plaza" | "calendar" | "road" };
const S = (id: number, a: number, b: number, light: Light, set: GShot["set"]): GShot => ({ id, a, b, light, set });
export const SHOTS: GShot[] = [
  S(1, 0, 90, "day", "plaza"), S(2, 90, 172, "day", "plaza"), S(3, 180, 290, "golden", "plaza"), S(4, 290, 404, "day", "plaza"),
  S(5, 411, 589, "day", "calendar"), S(6, 596, 790, "day", "calendar"), S(7, 798, 989, "day", "calendar"), S(8, 997, 1097, "golden", "calendar"),
  S(9, 1104, 1200, "day", "calendar"), S(10, 1200, 1302, "day", "calendar"),
  S(11, 1310, 1450, "golden", "road"), S(12, 1450, 1618, "golden", "road"), S(13, 1625, 1807, "day", "road"), S(14, 1814, 1946, "day", "road"), S(15, 1954, 2036, "golden", "road"),
];
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** slow push-in toward the look point: ~0.2 %/frame, like every hold in the reference */
const push = (pos: V3, look: V3, fov: number, t: number, rate = 0.002, roll = 0): GCam => ({ pos: lerp3(look, pos, Math.exp(-rate * t)), look, fov, roll });
export const camAt = (id: number, f: number): GCam => {
  const s = SHOTS[id - 1], t = Math.max(0, f - s.a);
  switch (s.set) {
    case "plaza": return push([-1, 3.4, 17], [6.5, 4.6, -4], 54, t, 0.002, id === 2 ? 0.05 : 0);
    case "calendar": return push([2.0, 2.2, 6.5], [0.3, 3.2, -9], 48, t, 0.002);
    default: return push([-18, 30, 20], [0, 0, -52], 44, t, 0.0012);
  }
};
export const dofAt = (id: number) => (id === 5 ? 9 : id === 2 ? 12 : 0);
