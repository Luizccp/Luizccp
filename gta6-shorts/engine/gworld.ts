// World for the GTA 6 delays short: three small sets (fan plaza, calendar wall, road works) built once, one shown per shot.
// Same look engine as the bridge short: two-tone world shading (shade.ts), camera-facing cartoon cards (toon.ts / cast.ts
// Pool + Actor + Fx), light presets (lights.ts), sky/fog from the LOOK table. Only the geometry and the cast are new.
import * as THREE from "three";
import { ctex } from "./paint";
import { Pen, bodyFront, bodySide, Outfit, Expr, FrontOpts, SideOpts, INK, fxContact } from "./toon";
import { LIGHTS, LOOK } from "./lights";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cast";
import { lam } from "./build";
import { FPS, SHOTS, camAt, GShot, V3 } from "./gstory";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const h01 = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const SKIN = ["#ffe2c2", "#f5c9a0", "#ecd0b6", "#c99067"];
const TEES = ["#e8574a", "#f2b84b", "#4a90d9", "#6cbf6a", "#b06ad8", "#f08a2c", "#2fb5b0", "#e86aa0"];
const fan = (i: number): Outfit => ({ jacket: TEES[i % 8], pants: ["#3b4a6b", "#4d4d57", "#6b4a3b", "#2f3b4a"][i % 4], boots: INK, skin: SKIN[(i * 3) % 4],
  hat: i % 3 === 0 ? "cap" : i % 3 === 1 ? "hair" : null, cap: TEES[(i + 3) % 8], hair: ["#3a2a20", "#7a4a2a", "#1c1a1f", "#c9a24a"][i % 4] });
const WORKER = (i: number): Outfit => ({ jacket: "#f2c230", pants: "#3b4a6b", boots: INK, skin: SKIN[i % 4], hat: "cap", cap: "#f28a1c" });
const RUNNER: Outfit = { jacket: "#2f7fd8", pants: "#23356b", boots: "#f4f1ea", skin: SKIN[1], hat: "hair", hair: "#3a2a20" };
const FAN_A: Outfit = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", skin: SKIN[1], hat: "cap", cap: "#e2453c" };

const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const q = (v: number, n = 120) => Math.round(v * n) / n;
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Spec = { i: number; o: Outfit; okey: string; x: number; y?: number; z: number; side?: boolean; dir?: number; scale?: number; fo?: FrontOpts; so?: SideOpts };
type Placed = { key: string; draw: (p: Pen) => void; x: number; y: number; z: number; mirror: boolean; scale: number; size: [number, number, number] };

// ---------------- painted textures ----------------
const tile = (key: string, base: string, seam: string, n = 4) => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  const s = 512 / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "0,0,0"},${0.04 + 0.05 * r()})`; g.fillRect(x * s, y * s, s, s); }
  g.strokeStyle = seam; g.lineWidth = 5;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
});
const screenTex = () => ctex("ledScreen", 1024, 576, (g) => {
  const gr = g.createLinearGradient(0, 0, 1024, 576); gr.addColorStop(0, "#2b1d6b"); gr.addColorStop(1, "#d6407c");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 576);
  g.fillStyle = "rgba(255,255,255,0.16)";
  for (let i = 0; i < 28; i++) g.fillRect(40 + i * 34, 576 - (60 + 190 * Math.abs(Math.sin(i * 1.7)) ** 1.3), 22, 400);
  g.fillStyle = "#ffffff"; g.beginPath(); g.arc(512, 270, 150, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#d6407c"; g.beginPath(); g.moveTo(462, 195); g.lineTo(462, 345); g.lineTo(600, 270); g.closePath(); g.fill();
  g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, 1014, 566);
});
const calendarTex = () => ctex("calWall", 2048, 1280, (g, r) => {
  g.fillStyle = "#f3ead6"; g.fillRect(0, 0, 2048, 1280);
  const pastel = ["#ffd9d2", "#d7ecff", "#e0f5d3", "#fff0b8", "#e8d9ff"];
  for (let cy = 0; cy < 3; cy++) for (let cx = 0; cx < 5; cx++) {
    const x0 = 30 + cx * 400, y0 = 30 + cy * 415, w = 370, h = 385;
    g.fillStyle = pastel[(cx + cy * 2) % 5]; g.fillRect(x0, y0, w, h); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(x0, y0, w, h);
    g.fillStyle = "#c0353a"; g.fillRect(x0, y0, w, 70); g.strokeRect(x0, y0, w, 70);
    g.fillStyle = INK; g.font = "bold 46px sans-serif"; g.textAlign = "center"; g.fillText(cx === 2 && cy === 1 ? "2025" : String(2023 + ((cx + cy) % 4)), x0 + w / 2, y0 + 52);
    g.font = "bold 34px sans-serif";
    for (let k = 0; k < 28; k++) g.fillText(String(k + 1), x0 + 30 + (k % 7) * 52, y0 + 130 + Math.floor(k / 7) * 62);
    g.textAlign = "start";
    if (cx === 2 && cy === 1) { g.strokeStyle = "#d02a2a"; g.lineWidth = 11; g.beginPath(); g.ellipse(x0 + 30 + 5 * 52, y0 + 118 + 2 * 62, 40, 32, 0, 0, Math.PI * 2); g.stroke(); }
    else if (r() < 0.5) { g.strokeStyle = "#d02a2a"; g.lineWidth = 7; g.beginPath(); g.ellipse(x0 + 30 + (Math.floor(r() * 7)) * 52, y0 + 120 + Math.floor(r() * 4) * 62, 28, 22, 0, 0, Math.PI * 2); g.stroke(); }
  }
});
const roadTex = () => ctex("asphalt", 256, 1024, (g, r) => {
  g.fillStyle = "#4a4a52"; g.fillRect(0, 0, 256, 1024);
  for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "0,0,0"},0.06)`; g.fillRect(r() * 256, r() * 1024, 3, 3); }
  g.fillStyle = "#f2d35a"; for (let y = 0; y < 1024; y += 256) g.fillRect(122, y + 30, 12, 130);
  g.fillStyle = "#e9e9e9"; g.fillRect(6, 0, 7, 1024); g.fillRect(243, 0, 7, 1024);
});
const checkerTex = () => ctex("checker", 512, 128, (g) => {
  for (let y = 0; y < 4; y++) for (let x = 0; x < 16; x++) { g.fillStyle = (x + y) % 2 ? "#111" : "#f4f1ea"; g.fillRect(x * 32, y * 32, 32, 32); }
});
const rep = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(x, y); c.needsUpdate = true; return c; };

export class GtaWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sets: Record<GShot["set"], THREE.Group> = { plaza: new THREE.Group(), calendar: new THREE.Group(), road: new THREE.Group() };
  private sunCache = new Map<number, THREE.Vector3>();
  private SUNV = new THREE.Vector3(0.5, 0.75, -0.4);

  constructor() {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6); this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);
    for (const k of ["plaza", "calendar", "road"] as const) R.add(this.sets[k]);
    this.buildPlaza(); this.buildCalendar(); this.buildRoad();
  }

  // ---- geometry helpers ----
  private box(g: THREE.Group, m: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number, ry = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); mesh.position.set(x, y, z); mesh.rotation.y = ry; mesh.castShadow = mesh.receiveShadow = true; g.add(mesh); return mesh;
  }
  private plane(g: THREE.Group, m: THREE.Material, x: number, y: number, z: number, w: number, h: number, rx = 0, ry = 0) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, 0); mesh.receiveShadow = true; g.add(mesh); return mesh;
  }
  private col(c: string) { return lam("c" + c, () => ({ color: c })); }

  private buildPlaza() {
    const g = this.sets.plaza;
    this.plane(g, lam("plazaTile", () => ({ map: rep(tile("plazaT", "#c9c2b6", "#8c8478", 4), 60, 60) })), 0, 0, 0, 240, 240, -Math.PI / 2);
    // LED screen on a steel truss, facing -x (toward the crowd)
    const steel = this.col("#5d6470"), dark = this.col("#23252c");
    this.box(g, dark, 15.2, 6.8, -4, 0.7, 10.6, 21);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(20, 10.4), new THREE.MeshBasicMaterial({ map: screenTex(), color: new THREE.Color(1.5, 1.5, 1.5), toneMapped: true }));
    scr.position.set(14.8, 6.8, -4); scr.rotation.y = -Math.PI / 2; scr.layers.set(NOINK); g.add(scr);
    for (const z of [-13, 5]) this.box(g, steel, 15.2, 1.1, z, 0.9, 2.2, 0.9);
    // lamp posts and bunting poles
    for (let i = 0; i < 6; i++) { const z = -18 + i * 7; this.box(g, steel, -12, 2.6, z, 0.18, 5.2, 0.18); this.box(g, this.col("#fff3c2"), -12, 5.3, z, 0.7, 0.3, 0.7); }
    const flags = ["#e8574a", "#f2b84b", "#4a90d9", "#6cbf6a"];
    for (let i = 0; i < 22; i++) this.box(g, this.col(flags[i % 4]), -12 + (i % 2) * 0, 4.9 - 0.2 * Math.abs(Math.sin(i * 0.5)), -17 + i * 1.6, 0.05, 0.6, 0.6);
    // far buildings
    for (let i = 0; i < 9; i++) this.box(g, lam("bld" + (i % 3), () => ({ color: ["#b9a38b", "#a9b8c8", "#c9a08a"][i % 3] })), -40 + i * 11, 9 + 4 * h01(i), -60 - 6 * h01(i, 3), 9, 18 + 8 * h01(i, 1), 8);
  }

  private buildCalendar() {
    const g = this.sets.calendar;
    this.plane(g, lam("calFloor", () => ({ map: rep(tile("calF", "#d9b98a", "#8a6a44", 6), 40, 40) })), 0, 0, 0, 160, 160, -Math.PI / 2);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 18.75), lam("calWallM", () => ({ map: calendarTex() })));
    wall.position.set(0, 9.4, -12); wall.receiveShadow = true; g.add(wall);
    // giant marker lying on the floor and a stack of paper
    const red = this.col("#d02a2a");
    this.box(g, red, 4.5, 0.5, -7, 5.2, 0.9, 0.9, 0.3); this.box(g, this.col("#f4f1ea"), 2.0, 0.5, -7.7, 0.1, 0.1, 0.1);
    for (let i = 0; i < 6; i++) this.box(g, this.col(["#ffd9d2", "#d7ecff", "#e0f5d3"][i % 3]), -6 + 0.1 * i, 0.15 + 0.3 * i, -8, 3.2, 0.28, 2.3, 0.05 * i);
  }

  private buildRoad() {
    const g = this.sets.road;
    this.plane(g, lam("dirt", () => ({ map: rep(tile("dirtT", "#d6b27a", "#d0aa72", 3), 90, 90) })), 0, -0.02, -60, 600, 600, -Math.PI / 2);
    const r = this.plane(g, lam("asphalt", () => ({ map: rep(roadTex(), 1, 70) })), 0, 0.02, -100, 13, 400, -Math.PI / 2);
    r.receiveShadow = true;
    // freshly laid darker strip ahead, finish arch, cones, roller
    const arch = this.col("#2a2a31");
    for (const x of [-7.5, 7.5]) this.box(g, arch, x, 4, -160, 0.7, 8, 0.7);
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.4), new THREE.MeshBasicMaterial({ map: checkerTex(), side: THREE.DoubleSide })); banner.position.set(0, 8.2, -160); banner.layers.set(NOINK); g.add(banner);
    for (let i = 0; i < 16; i++) this.box(g, this.col("#f2762a"), i % 2 ? 6.8 : -6.8, 0.5, -20 - i * 8, 0.55, 1.0, 0.55);
    const yel = this.col("#f2c230"), blk = this.col("#222"), grey = this.col("#8b8f96");
    this.box(g, yel, 0, 1.6, -70, 4.4, 2.2, 5.5); this.box(g, grey, 0, 3.3, -69, 2.6, 1.4, 2.4); this.box(g, blk, 0, 1.0, -74, 4.8, 2.0, 2.0); this.box(g, blk, 0, 1.0, -66, 4.8, 2.0, 2.0);
    for (let i = 0; i < 14; i++) this.box(g, lam("hill" + (i % 2), () => ({ color: ["#c99a66", "#d9ad78"][i % 2] })), -60 + i * 18, 3 + 6 * h01(i, 5), -190, 16, 6 + 12 * h01(i, 2), 16);
  }

  // ---- per-frame ----
  private shotSun(id: number, s: GShot) {
    let v = this.sunCache.get(id); if (v) return v;
    const c = camAt(id, s.a), fx = c.look[0] - c.pos[0], fz = c.look[2] - c.pos[2], n = Math.hypot(fx, fz) || 1;
    const L = LIGHTS[s.light], az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const ux = fx / n, uz = fz / n, hx = ux * Math.cos(az) - uz * Math.sin(az), hz = uz * Math.cos(az) + ux * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize(); this.sunCache.set(id, v); return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  private person(cam: THREE.PerspectiveCamera, right: THREE.Vector3, sp: Spec): Placed {
    const y = sp.y ?? 0, sc = sp.scale ?? 1, d = cam.position.distanceTo(V(sp.x, y + 1.2, sp.z)) / sc, [w, h, k] = tier(d);
    const side = !!sp.side, dir = sp.dir ?? 1, mirror = side && dir * right.x < 0;
    const sx = this.SUNV.dot(right) * (mirror ? -1 : 1), sy = -this.SUNV.y, light = Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4), seed = ((sp.i * 5 + 3) % 7) + 1;
    const fo: FrontOpts = { mode: "stand", ...sp.fo, light, seed }, so: SideOpts = { mode: "stand", ...sp.so, light, seed };
    const key = side ? `S|${sp.okey}|${fkey(so)}` : `F|${sp.okey}|${fkey(fo)}`;
    return { key, x: sp.x, y, z: sp.z, mirror, scale: sc, size: [w, h, k], draw: (p) => (side ? bodySide(p, sp.o, so) : bodyFront(p, sp.o, fo)) };
  }

  /** the cast of each shot (ids 1, 5, 12 are designed; the others reuse their set's cast as a placeholder) */
  private cast(s: GShot, f: number, cam: THREE.PerspectiveCamera, right: THREE.Vector3): Placed[] {
    const out: Placed[] = [], t = f / FPS;
    const P = (sp: Spec) => out.push(this.person(cam, right, sp));
    const blink = (i: number) => { const n = Math.floor(t * 30), c = (n + i * 11) % 71; return c < 4 ? [0.5, 1, 1, 0.5][c] : 0; };
    if (s.set === "plaza") {
      const exprs: Expr[] = ["grin", "laugh", "shock", "grin", "smile", "whistle"];
      let i = 0;
      for (let row = 0; row < 7; row++) for (let c = 0; c < 8; c++) {
        const x = -8 + c * 1.75 + (row % 2) * 0.8 + 0.5 * h01(i), z = 3 - row * 2.7 + 0.6 * h01(i, 2);
        P({ i, o: fan(i), okey: "fan" + (i % 24), x, z, side: true, dir: 1, so: { expr: exprs[(i + (c > 3 ? 1 : 0)) % 6], blink: blink(i) }, scale: 0.95 + 0.1 * h01(i, 4) });
        i++;
      }
    } else if (s.set === "calendar") {
      P({ i: 3, o: FAN_A, okey: "fanA", x: -1.6, z: -6.5, scale: 1.3, fo: { expr: "grin", blink: blink(3), wave: 0 } });
      for (let i = 0; i < 6; i++) P({ i: 20 + i, o: fan(i + 4), okey: "fan" + ((i + 4) % 24), x: 3.5 + i * 1.5, z: -8.8 + (i % 2) * 0.9, fo: { expr: i % 2 ? "grin" : "smile", blink: blink(i) }, scale: 1.1 });
    } else {
      P({ i: 30, o: RUNNER, okey: "runner", x: 0, z: -36, side: true, dir: 1, so: { mode: "march", phase: (t * 2) % 1 }, scale: 2.4 });
      for (let i = 0; i < 10; i++) P({ i: 40 + i, o: WORKER(i), okey: "worker" + (i % 4), x: (i % 2 ? 1 : -1) * 8.2, z: -40 - i * 9, fo: { expr: "neutral", blink: blink(i) }, scale: 2.0 });
    }
    return out;
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const s = SHOTS[id - 1], L = LIGHTS[s.light], K = LOOK[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); cam.layers.enable(NOINK);
    for (const k of ["plaza", "calendar", "road"] as const) this.sets[k].visible = k === s.set;
    const focus = V(...c.look), dist = cam.position.distanceTo(focus), sunDir = this.shotSun(id, s); this.SUNV.copy(sunDir);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.2 + 10, 14, 90);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = null;
    // cast
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const places = this.cast(s, f, cam, right);
    let ai = 0; const used: Actor[] = []; const fused: Fx[] = []; let fi = 0;
    const tint = s.light === "golden" ? "#ffcf9e" : "#ffffff"; void tint;
    for (const p of places) {
      const a = this.actor(ai++);
      a.r = this.pool.req(p.key, p.size[0], p.size[1], p.size[2], p.draw);
      a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0);
      a.mesh.scale.set(p.mirror ? -p.scale : p.scale, p.scale, p.scale);
      a.mesh.castShadow = L.actorShadow; used.push(a);
      const e2 = this.fx(fi++), cc = s.light === "golden" ? "#4a3f78" : "#52527a";
      e2.r = this.pool.req(`blob|contact|${cc}`, 128, 128, 1, (pen) => fxContact(pen, cc)); e2.use(false);
      e2.mesh.visible = true; e2.mesh.position.set(p.x, p.y + 0.022, p.z); e2.mesh.rotation.set(-Math.PI / 2, 0, 0); e2.mesh.scale.set(0.55 * p.scale, 0.4 * p.scale, 1); fused.push(e2);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush(); for (const a of used) a.bind(); for (const e3 of fused) e3.bind();
    return focus;
  }
}
void twoTone;
