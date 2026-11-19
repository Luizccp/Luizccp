import fs from "node:fs"; import path from "node:path";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
const [out, a, b, scale = "0.5"] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium";
const chromiumOptions = { gl: "swangle", headless: true };
const inputProps = { post: { lens: false } };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "BridgeShort", inputProps, browserExecutable, chromiumOptions });
const t0 = Date.now();
await renderMedia({ composition, serveUrl, inputProps, codec: "h264", outputLocation: out, frameRange: [Number(a), Number(b)], scale: Number(scale),
  browserExecutable, chromiumOptions, concurrency: 3, timeoutInMilliseconds: 180000,
  onProgress: (p) => { if (p.renderedFrames % 15 === 0) console.log("frames", p.renderedFrames); } });
console.log("done", ((Date.now() - t0) / 1000).toFixed(0) + "s");
