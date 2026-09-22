# AGENTS.md — Don't Trip Grandma repository routekaart

> Lees dit bestand als eerste bij elke AI-/agentopdracht. Dit is een **routekaart**, geen beschrijving van een opgesplitste codebase die nog niet bestaat. Controleer vóór wijzigingen altijd de huidige GitHub-branch, bestanden en open PR's: documentatie kan achterlopen.

## 1. Project en uitgangspunten

- Repository: `wanderwerkhoven-afk/dont-fall-granny`.
- Speelbare GitHub Pages URL: `https://wanderwerkhoven-afk.github.io/dont-fall-granny/`.
- Product: **Don't Trip Grandma**, native web-game gebaseerd op de originele V11. **Niet** opnieuw bouwen in Phaser/Unity zonder expliciete opdracht.
- De huidige `main` bevat de volledige game in één rootbestand, `index.html` (HTML, ingebedde CSS en JS); daarnaast een `assets/` map en GitHub Actions-workflow.
- Behouw bestaand ontwerp en spelgedrag bij gerichte wijzigingen. Geen ongevraagde redesigns, grootschalige refactors of vervanging van bestaande V11-logica.
- GitHub Pages moet HTML **én alle gebruikte bestanden in `assets/`** publiceren. Een eerdere workflow kopieerde alleen HTML, waardoor afbeeldingen ontbraken.

## 2. Huidige mapstructuur op `main` (gecontroleerd bij schrijven)

```text
dont-fall-granny/
├── AGENTS.md                         ← deze routekaart
├── index.html                        ← game: HTML + CSS + JS
├── assets/
│   └── hanger-spritesheet.png        ← huidige hangerasset; defect gemeld
└── .github/
    └── workflows/
        └── deploy-wooden-hanger.yml  ← GitHub Pages deployment
```

**Belangrijk — open werk:** PR **#9** (`fix/hanger-sprite-verified-asset`) bevat een vervanging van de defecte PNG door `assets/hanger-spritesheet.svg` en past het assetpad in `index.html` aan. In dezelfde PR is de kledingkleur van de grote menu-oma gekoppeld aan de gekozen outfit. Deze wijzigingen staan **niet automatisch op `main`**: controleer actuele PR- en mergestatus voordat je een pad of functie als live beschouwt. Zie `https://github.com/wanderwerkhoven-afk/dont-fall-granny/pull/9`.

## 3. Waar moet een AI-agent naartoe? — taak → bestand → zoekanker

Omdat `index.html` groot is, zoek op exacte functienamen/IDs; vertrouw niet op vaste regelnummers.

| Verzoek | Bestand | Zoek in bestand naar | Wat je daar vindt |
|---|---|---|---|
| Titel, buitenste scherm, basislayout | `index.html` | `<head>`, `<main class="shell">`, `header`, `.shell`, `.game` | HTML-structuur en algemene CSS. |
| Responsive desktop/mobiel | `index.html` | `@media(min-width:651px)`, `@media(max-width:650px)`, `.overlay`, `.panel` | Desktop- en mobile CSS; controleer overlappende mediaregels. |
| Canvas en HUD | `index.html` | `<canvas id="canvas">`, `tierTrack`, `tierFill`, `score`, `coins`, `best`, `.scoreboard` | Speelveld, afstand, munten, record en tier-voortgang. |
| Startmenu, winkel, menu-tabs | `index.html` | `id="overlay"`, `id="menuTabs"`, `id="menuContent"`, `function showMenu(page='home')` | Menustructuur en dynamisch gegenereerde winkelkaarten. |
| Kledingcatalogus en prijzen | `index.html` | `const clothing=[`, `ownedClothes`, `selectedClothes` | Outfit-ID's, naam, kosten, kledingkleur en haarkleur. |
| Kleding kopen/aantrekken | `index.html` | `data-buy`, `selectedClothes=item.id`, `saveInventory()`, `saveCoins()` | Aankoop, uitrusten, hertekenen winkel en lokale opslag. |
| Outfitpreview kleine winkelkaart | `index.html` | `const symbol=page==='clothes'` | Het SVG-kledingicoon per winkelartikel. |
| Outfitpreview grote oma bovenaan | `index.html` | `id="menuGrandma"`, `.menu-grandma` | Hero-SVG in de HTML; op `main` is de kledingkleur nog hardcoded. In PR #9: `updateGrandmaOutfitPreview()`, `data-preview-coat`, `data-preview-hair`. |
| Oma tijdens gameplay | `index.html` | `function drawGrandma`, `selectedClothes`, `grandma` | Canvas-tekenlogica en spelergegevens; kijk naar de feitelijke functienaam in de actuele branch. |
| Kledinghanger en stang | `index.html` | `clothes-scroll-rail`, `clothes-pole`, `clothes-hanger`, `clothesHanger` | HTML/CSS van de hanger en verwijzing naar spritesheet. |
| Hanger beweging/framewissel | `index.html` | `function syncClothesHanger`, `function animateClothesHanger`, `function setHangerFrame`, `refreshHangerAnimation` | Scrollpositie, inertie, animatieframes en reduced-motion gedrag. |
| Hangerafbeelding | `assets/hanger-spritesheet.png` op `main`; `assets/hanger-spritesheet.svg` in PR #9 | `background-image:url` in `index.html` | Assetpad moet overeenkomen met werkelijk gepubliceerde bestandsnaam. Oude PNG is visueel defect. |
| Gadgets/speciale modi | `index.html` | `const gadgets=[`, `ownedGadgets`, `vehicle`, `modeObstacles`, `scooter-mode` | Scootmobiel/vliegtuig en winkel. Inspecteer de actuele modusfuncties vóór aanpassing. |
| Run/reset/start/game-over | `index.html` | `function reset()`, `function start()`, `function end()`, `returnHome()`, `GAME_OVER_SECONDS`, `tickDeathTimer()` | Levenscyclus, opnieuw beginnen en rescue-countdown. |
| Frame-update en voortgang | `index.html` | `function frame(now)`, `function update(dt)`, `travel`, `score`, `TIERS` | Beweging en tierwissels; `dt` moet niet negatief worden. |
| Obstakels, snoep en schild | `index.html` | `obstacles`, `candies`, `shield`, `spawnDistance`, `coinItems` | Spelobjecten, collisions en tijdelijke bescherming. Zoek gerelateerde functies in dezelfde scriptsectie. |
| Bewaarde voortgang | `index.html` | `localStorage`, `dont-trip-grandma-best`, `dont-trip-grandma-coins`, `grandma-clothes`, `grandma-outfit`, `grandma-gadgets` | Records, munten, bezit en selectie. Bewaar bestaande storage keys. |
| Publicatie naar GitHub Pages | `.github/workflows/deploy-wooden-hanger.yml` | `upload-pages-artifact`, `deploy-pages`, `assets` | CI/CD; controleer dat alle benodigde assets worden meegenomen en dat de run geslaagd is. |

## 4. Afhankelijkheden: wat moet samen werken?

**Kledingselectie**: `clothing` → koop/equip via `data-buy` → `selectedClothes` → `saveInventory()` → winkelkaart/hero-preview → gameplay-oma. Bij aanpassing: controleer de kleur in álle weergaven, ook na herladen. De synchronisatie van de grote hero-preview is onderdeel van PR #9, niet van de bij het schrijven geïnspecteerde `main`.

**Hanger**: CSS `background-image` → `assets/hanger-spritesheet.*` → `setHangerFrame()` → `syncClothesHanger()` → `animateClothesHanger()` → scrollbare `.panel`. De asset moet daadwerkelijk op GitHub Pages aanwezig zijn. Spriteframes moeten gelijke cellen hebben en CSS `background-size`, `background-position`, desktop- en mobiele framebreedte moeten overeenkomen.

**Game loop**: `start()` / `reset()` → `frame(now)` → `update(dt)` / rendering → HUD/tier/obstacles. Wijzig nooit alleen score- of tijdlogica zonder het eerste frame, pauze, restart en game-over te controleren.

**Deploy**: gewijzigde `index.html` of asset → commit op juiste branch → eventuele PR/merge → Actions Pages-workflow → gepubliceerde HTML plus assets → echte browsercheck. `commit gelukt` is niet hetzelfde als `live getest`.

## 5. Werkprocedure voor AI-agents

1. **Inspecteer eerst:** huidige `main` tree, relevante bestanden, open PR's en laatste Pages-run. Gebruik nooit een veronderstelde status uit oude chats als bron van waarheid.
2. **Zoek het anker** uit tabel §3 en lees omliggende CSS, markup en JS. Controleer of dezelfde selectors elders opnieuw gedefinieerd worden.
3. **Bepaal de kleinste wijziging** en de bijbehorende afhankelijkheden (§4). Verander geen ontwerp of andere gameplay als de opdracht daar niet om vraagt.
4. **Maak een aparte branch/PR** voor bouwopdrachten tenzij de gebruiker expliciet direct naar `main` vraagt. Werk niet ongemerkt over open PR #9 heen; kies en documenteer een merge-/branchstrategie.
5. **Controleer code en assets:** JS-syntax, correcte paden, bestaande opslagkeys, 6 spriteframes indien van toepassing, desktop + mobiel, interactie met scrollen en aankopen.
6. **Valideer browsergedrag** indien een echte browser beschikbaar is. Als dat niet kan, meld expliciet dat alleen statische/CI-controles zijn uitgevoerd; claim geen visueel succes.
7. **Rapporteer concreet:** branch, commit, PR, wijzigingen, testresultaten, merge-status én Pages-status afzonderlijk.
8. **Update dit bestand** zodra bestanden worden opgesplitst/hernoemd, nieuwe assets verschijnen of functies worden verplaatst; anders verliest de routekaart zijn waarde.

## 6. Regels voor de game en assets

- Behoud V11 als broncode; ga niet zonder toestemming terug naar oude Unity/Phaser implementaties.
- Geen willekeurige wijziging van kleuren, afmetingen, gameplay of interfaces bij een kleine bugfix.
- Nieuwe spritesheets: inspecteer de zichtbare frames, controleer transparantie, geometrie en juiste file-encoding; alleen een geldig PNG-header of een succesvolle upload bewijst geen goede afbeelding.
- Houd bewegingsreductie (`prefers-reduced-motion`) in stand en behoud winkel-scrollen op touchscreens.
- De UI mag geen informatie dubbel of overlappend tonen; schild rondom oma is de gekozen indicator, geen extra overlappende tekstbadge.
- Houd de repo-navigatie accuraat: onderscheid **live op main**, **alleen in een PR**, en **gepland maar nog niet gebouwd**.

## 7. Snelle links

- [Repository](https://github.com/wanderwerkhoven-afk/dont-fall-granny)
- [Huidige gamebron op main](https://github.com/wanderwerkhoven-afk/dont-fall-granny/blob/main/index.html)
- [Assets op main](https://github.com/wanderwerkhoven-afk/dont-fall-granny/tree/main/assets)
- [Pages-workflow](https://github.com/wanderwerkhoven-afk/dont-fall-granny/blob/main/.github/workflows/deploy-wooden-hanger.yml)
- [Open hanger + kledingpreview werk, PR #9](https://github.com/wanderwerkhoven-afk/dont-fall-granny/pull/9)
- [Game](https://wanderwerkhoven-afk.github.io/dont-fall-granny/)

**Onderhoudsregel:** update `AGENTS.md` in dezelfde PR wanneer code wordt verplaatst. Dit bestand beschrijft vindplaatsen, geen garantie dat open werk al is gemerged of gedeployed.
