# Motor do Short 1 (rascunho v1)

Arquivos novos em cima do motor da skill `cartoon-3d-short` (copie `templates/bridge/` para `src/videos/gta1/` e adicione estes):
- `gstory.ts` — lista de planos e câmeras (tempos de `shots_plan_1.json`).
- `gworld.ts` — mundo novo: praça com tela de LED, parede de calendários e estrada em obras, mais o elenco.
- `GtaShort.tsx` — composição (reaproveita tinta, desfoque, grade e tone map).
- `Root.tsx` — registra `GtaShort` ao lado de `BridgeShort`.
- `bridge-stills.mjs` / `clip.mjs` — renders de still e de trecho (Chromium do container, `COMP=GtaShort POST='{"lens":false}'`).
Dependências fixadas (as versões novas deixam o pós-processamento em branco): react 18.3.1, @react-three/fiber 8.17.10, @react-three/postprocessing 2.16.3, postprocessing 6.36.4, three 0.169.0.
