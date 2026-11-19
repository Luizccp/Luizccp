# Plano de cenas — Short 1 (PT-BR): "O jogo que mudou a própria linha de chegada"

Base de tempo: `voice_pt_faber.wav` (67,9 s, 2036 frames a 30 fps) e `sentences_pt.json` (início/fim real de cada frase).
Formato 1080x1920. Sem legendas. Só personagens e cenários originais (sem logos, nomes ou trechos da Rockstar). Números como "2025" aparecem só em adereços (faixa, calendário).
Regra da skill: cada reação visual cai 0–3 frames **antes** da palavra.

## Cenários e elenco (tudo novo, estilo "bean-head" da skill)
- **Praça dos fãs**: tela gigante de LED, multidão de ~40 fãs (camisetas de cores variadas, celulares). Luz dia.
- **Palco do estúdio**: pódio simples, faixa "2025", 2 desenvolvedores (óculos, crachá genérico). Luz dourada.
- **Parede de calendários**: parede enorme de papel quadriculado, canetas gigantes, borracha. Luz dia.
- **Estrada em obras**: estrada reta, operários com capacete, rolo compressor, linha de chegada em faixa quadriculada que é carregada. Luz dourada → dia.
- **Elenco**: Fã A (protagonista, camiseta laranja, boné), multidão de fãs, Dev 1 e Dev 2, Corredor (camiseta azul), Operários (colete amarelo).

## Plano (frames = voz)
| # | Frames | Texto (resumo) | Imagem | Luz | Câmera / DOF | Efeitos e som |
|---|--------|----------------|--------|-----|--------------|---------------|
| 1 | 0–90 | "Noventa milhões de pessoas assistiram a um único trailer em um dia." | Multidão olha a tela gigante; contador de views gira (número só como adereço) | dia | Corte seco, plano geral, push-in lento; DOF 0 | Murmúrio de multidão, tique do contador |
| 2 | 90–172 | "Depois o jogo perdeu a data. Duas vezes." | Close do Fã A; a data na tela cai e se parte; dois "X" aparecem nas palavras "duas vezes" | dia | Corte para close, kick de impacto em "perdeu", DOF 14 px | Pancada, whoosh |
| — | 172–176 | flash branco de 4 frames após o gancho | | | | |
| 3 | 180–290 | "Dezembro de dois mil e vinte e três. Um estúdio mostra um trailer e promete dois mil e vinte e cinco." | Dev no pódio abre faixa "2025"; luzes de palco | dourada | Plano médio, glide 24 f, roll 4° | Fanfarra curta, palmas |
| 4 | 290–404 | "A internet faz o que a internet sempre faz." | Fãs com celulares gritando, emojis de coração/fogo saindo das telas | dia | Plano geral → push; foreground com celulares; DOF 7 | Ruído de notificações |
| 5 | 411–589 | "Maio de 2024: tudo bem, outono de 2025. Todo mundo marca a data." | Parede de calendários; Fã A desenha círculo vermelho em "2025" | dia | Plano médio, glide lateral, push-in constante | Caneta riscando |
| 6 | 596–790 | "Maio de 2025: na verdade, maio de 2026. Apaga o círculo e desenha outro." | Círculo apagado com borracha; novo círculo mais à frente, a parede "estica" | dia | Corte para close da mão; DOF 12; depois glide 30 f | Borracha, "pop" |
| 7 | 798–989 | "Novembro de 2025: na verdade, novembro de 2026. Todo mundo compra uma borracha maior." | Todos os fãs carregam uma borracha enorme; gag visual | dia | Plano geral, kick em "borracha maior" | Risada curta, "boing" |
| 8 | 997–1097 | "A folha do calendário agora tem mais pó de borracha do que papel." | Folha do calendário vira pó; sopro de poeira | dourada | Close lento; DOF 14; foreground com pó | Papel rasgando, vento |
| 9 | 1104–1200 | "Felizmente, a data foi confirmada várias e várias vezes." | Fã A sorri; carimbos "OK" batem na parede | dia | Plano médio, painel dividido em duas metades | Carimbo repetido |
| 10 | 1200–1302 | "Infelizmente, várias e várias vezes é meio suspeito." | O mesmo Fã A semicerra os olhos (expressão "stern") | dia | Dolly lento até o olho; DOF 14 | Nota grave, silêncio breve |
| 11 | 1310–1450 | "Pense numa maratona em que a linha de chegada não para de mudar de lugar. O corredor não ficou mais lento." | Corredor na estrada; operários carregam a faixa de chegada para longe | dourada | Corte; plano lateral, glide; DOF 0 | Passos, apito |
| 12 | 1450–1618 | "A linha é que ficou mais longe, porque a pista estava sendo construída enquanto todo mundo corria nela." | Vista aérea: estrada sendo asfaltada à frente do corredor; rolo compressor | dourada | Aérea ampla, sem DOF, push suave | Máquinas, trilha sobe |
| 13 | 1625–1807 | "Um jogo desse tamanho é igual. Cada rua, cada multidão e cada detalhe é mais estrada para pavimentar." | Ruas, prédios e multidão surgindo um a um; cada um adiciona um trecho de estrada | dia | Glide longo, foreground com cones | Pops de construção |
| 14 | 1814–1946 | "E é por isso que um estúdio prefere mudar a linha a te entregar uma estrada cheia de buracos." | Operário tapa um buraco e faz "joinha"; o corredor passa liso | dia | Plano médio, kick no joinha | Concreto, "tchan" |
| 15 | 1954–2036 | "Os fãs esperaram tanto que o calendário desistiu primeiro." | Parede de calendários desaba em pilha; fãs dormindo ao lado, Fã A acorda e olha | dourada | Plano aberto, rolo de 4°, hold final | Desabamento, silêncio |

## Dados para o `story.ts`
`shots_plan_1.json` traz esses planos em formato máquina (id, a, b, luz, texto) para virarem `SHOTS`, `XFADE`, `FLASH_AT` e `CAMS`. Crossfades de 6–8 frames nas mudanças de lugar (3, 8, 11, 15). `FLASH_AT = 172`.

## Como será implementado (e o que pesa)
O motor da skill (tinta, desfoque, grade, personagens) é reaproveitável. A **cidade e a ponte** não são: o `build.ts`, o `world.ts`, o `cast.ts` e o `story.ts` do exemplo são específicos da ponte. Para este short é preciso um mundo novo (praça, palco, parede de calendários, estrada) com pelo menos:
1. um `world` novo com chão, céu, luzes (day/golden já existem);
2. novos adereços pintados (tela de LED, calendário, borracha, rolo compressor, faixa de chegada);
3. novas poses/expressões no `cast.ts` (borracha, carimbo, corrida);
4. o `story.ts` com as câmeras acima.
Por isso o próximo passo é por etapas: primeiro 3 planos-chave em still (1, 5 e 12) para validar o visual, e só depois o resto.
