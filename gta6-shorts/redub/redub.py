#!/usr/bin/env python3
"""Redub a short with a neural voice (PT: Piper Faber, EN: Kokoro bm_george), re-time it to the original and burn new word captions.
usage: redub.py <src.mp4> <out_dir> <pt|en>   (run from a dir with kokoro-v1.0.onnx, voices-v1.0.bin and vits-piper-pt_BR-faber-medium/)"""
import sys, os, re, json, subprocess, numpy as np, soundfile as sf
src, out, lang = sys.argv[1:4]; os.makedirs(out, exist_ok=True)
# (start, end, text) per group, timed from the original narration (Whisper small, reviewed by hand)
G = {
 "pt": [
  (0.0, 9.06, "Esse é um dos primeiros eventos aleatórios que você não pode deixar passar no GTA 6. Na região de Leonida Keys você pode simplesmente ver um avião caindo do céu,"),
  (9.06, 18.94, "e se isso acontecer você segue ele, porque depois de um tempo, se você seguir ele, você vai encontrar o avião completamente destruído no meio do pântano. E o piloto ainda tá lá, agonizando perto dos destroços,"),
  (18.94, 26.46, "só que a parte mais interessante vem agora. Se você procurar perto do avião, dá pra encontrar cocaína caída no chão."),
  (26.46, 35.6, "Então, obviamente, tu tem que pegar tudo, só que nesse avião também tinha mais gente de olho, e tu tem que eliminar esses caras."),
  (35.6, 52.0, "Depois de acabar com eles, é só pegar a droga e levar até o armazém do Brian, mas tem que ser rápido, porque a polícia também está de olho. E tu acabou de transformar esse acidente aleatório em dinheiro fácil."),
 ],
 "en": [
  (0.0, 9.06, "This is one of the first random events you can't miss in GTA 6. In the Leonida Keys, you can just see a plane falling out of the sky,"),
  (9.06, 18.94, "and if that happens, follow it. After a while you'll find the plane completely wrecked in the middle of the swamp, and the pilot is still there, dying near the wreckage,"),
  (18.94, 26.46, "but the most interesting part comes now. Look near the plane and you can find cocaine lying on the ground."),
  (26.46, 35.6, "So obviously, grab everything. But that plane also had more people watching it, and you have to take those guys out."),
  (35.6, 52.0, "Once they're gone, just grab the drugs and take them to Brian's warehouse. But be quick, because the police are watching too. And you just turned a random accident into easy money."),
 ]}[lang]
SR = 24000 if lang == "en" else 22050
if lang == "en":
    from kokoro_onnx import Kokoro
    k = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
    def tts(t, sp): a, sr = k.create(t, voice="bm_george", speed=sp, lang="en-us"); return np.asarray(a, np.float32), sr
else:
    import sherpa_onnx
    d = "vits-piper-pt_BR-faber-medium"
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
        model=f"{d}/pt_BR-faber-medium.onnx", tokens=f"{d}/tokens.txt", data_dir=f"{d}/espeak-ng-data"), num_threads=4))
    t_ = sherpa_onnx.OfflineTts(cfg)
    def tts(t, sp): g = t_.generate(t, sid=0, speed=sp); return np.array(g.samples, np.float32), g.sample_rate
total = 52.24; pieces = []; words = []
for a, b, txt in G:
    win = b - a - 0.15
    x, sr = tts(txt, 1.0); sp = min(1.4, max(0.85, (len(x) / sr) / win))
    x, sr = tts(txt, sp); dur = len(x) / sr
    if dur > win:  # still too long: speed it up with ffmpeg-free resample trick (rare)
        idx = np.linspace(0, len(x) - 1, int(win * sr)).astype(int); x = x[idx]; dur = len(x) / sr
    pieces.append((a, x)); toks = txt.split(); w = np.array([len(re.sub(r"\W", "", z)) + 2 for z in toks], float); w /= w.sum(); c = a
    for z, f in zip(toks, w): words.append((c, c + f * dur, z)); c += f * dur
buf = np.zeros(int(total * sr) + sr, np.float32)
for a, x in pieces: buf[int(a * sr): int(a * sr) + len(x)] += x
sf.write(f"{out}/voice_{lang}.wav", buf[: int(total * sr)], sr)
def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f"{h}:{m:02d}:{s:05.2f}"
ass = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 720", "PlayResY: 1280", "[V4+ Styles]",
       "Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding",
       "Style: W,DejaVu Sans,36,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,3,0,5,10,10,10,1", "[Events]",
       "Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text"]
for i, (s, e, z) in enumerate(words):
    e = words[i + 1][0] if i + 1 < len(words) and words[i + 1][0] - e < 0.4 else e
    ass.append(f"Dialogue: 0,{ts(s)},{ts(e)},W,,0,0,0,,{{\\pos(360,607)}}{z}")
open(f"{out}/caps_{lang}.ass", "w").write("\n".join(ass))
json.dump([{"start": round(s, 2), "end": round(e, 2), "word": z} for s, e, z in words], open(f"{out}/words_{lang}.json", "w"), ensure_ascii=False, indent=1)
vf = ("split[s1][s2];[s2]crop=440:52:140:582,boxblur=12:3[bl];[s1][bl]overlay=140:582," f"ass={out}/caps_{lang}.ass")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-i", f"{out}/voice_{lang}.wav", "-filter_complex", f"[0:v]{vf}[v];[1:a]loudnorm=I=-16[a]",
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "160k", "-t", str(total), f"{out}/redub_{lang}.mp4"], check=True)
print("ok", f"{out}/redub_{lang}.mp4")
