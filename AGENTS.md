# AGENTS.md — Don't Trip Grandma: routekaart voor AI-agents

Lees dit bestand vóór iedere wijziging. Het beschrijft vindplaatsen, geen vervanging voor inspectie van de actuele GitHub-code. Repository: `wanderwerkhoven-afk/dont-fall-granny`; live spel: https://wanderwerkhoven-afk.github.io/dont-fall-granny/.

## Architectuur en mapstructuur op main (22 september 2026)

```text
dont-fall-granny/
├── AGENTS.md                         # Deze AI-routekaart
├── index.html                        # V11: volledige HTML, CSS en JavaScript in één bestand
├── assets/
│   └── hanger-spritesheet.svg        # Zes houten hangerframes; 720×120, cellen 120×120
├── tests/
│   ├── store-regression.mjs          # Winkel, sprite en JS-syntax
│   ├── recovery-skill-check.mjs      # 0,9 s recovery timing + PERFECT/SAFE/MISS
│   └── recovery-risk-loop.mjs        # near-miss focus + balance + camera-settle
└── .github/workflows/
    └── deploy-wooden-hanger.yml      # CI-verificatie en GitHub Pages-publicatie
```

De oude `assets/hanger-spritesheet.png` is verwijderd. PR #9 (hanger-SVG en gesynchroniseerde voorbeeldoma) is gemerged in `main`, mergecommit `6af2b9a5a55ab0e1a44b12c3710469706e259dc1`; de Pages-workflow voor deze commit slaagde. Controleer bij elke nieuwe opdracht opnieuw de huidige toestand in plaats van deze historische status blind over te nemen. De routekaart moet worden bijgewerkt als bestanden of functies veranderen.

## Snel naar het juiste onderdeel

| Taak | Pad | Zoekankers in de code |
| --- | --- | --- |
| Algemene layout en responsive gedrag | `index.html` | `.shell`, `.game`, `@media(max-width:650px)`, `@media(min-width:651px)` |
| Spelcanvas en HUD | `index.html` | `id="canvas"`, `tierTrack`, `tierFill`, `scoreboard`, `coins`, `score`, `best` |
| Hoofdmenu / winkel / navigatie | `index.html` | `id="overlay"`, `menuTabs`, `menuContent`, `function showMenu` |
| Voorbeeldoma bovenin menu | `index.html` | `id="menuGrandma"`, `data-preview-coat`, `data-preview-hair`, `updateGrandmaOutfitPreview()` |
| Kledingassortiment, prijzen, kleuren | `index.html` | `const clothing=[`, `selectedClothes`, `ownedClothes` |
| Kopen, aantrekken, munten | `index.html` | `data-buy`, `saveInventory()`, `saveCoins()`, `menuPanel.scrollTop` |
| Kleine outfitvoorbeelden in kaarten | `index.html` | `const symbol=page==='clothes'` |
| Gameplay-oma en speler | `index.html` | `grandma`, `selectedClothes`, zoek naar tekenfunctie die deze gebruikt |
| Kledinghanger en kledingstang | `index.html` | `clothes-scroll-rail`, `clothes-pole`, `clothes-hanger`, `clothesHanger` |
| Hangerframes en scrollanimatie | `index.html` | `setHangerFrame`, `syncClothesHanger`, `refreshHangerAnimation`, `hangerReduceMotion` |
| Hangerafbeelding | `assets/hanger-spritesheet.svg` | Zes `<use href="#hanger">`-elementen; CSS `background-image`, `background-size` |
| Gadgets en voertuigmodi | `index.html` | `const gadgets=[`, `ownedGadgets`, `vehicle`, `modeObstacles`, `scooter-mode` |
| Start, pauze, reset en game-over | `index.html` | `reset()`, `returnHome()`, `GAME_OVER_SECONDS`, `tickDeathTimer`, `state` |
| Recovery skill check / balance | `index.html` | `RecoveryWindowController`, `BalanceController`, `NearMissController`, `triggerRecovery`, `finishRecovery`, `drawRecoveryMeter` |
| Near-miss risk/reward + PERFECT camera | `index.html` | `nearMissCandidate`, `nearMissController`, `recoveryCameraSettle`, `reducedRecoveryMotion` |
| Game-loop, snelheid en werelden | `index.html` | `frame`, `update`, `travel`, `score`, `TIERS`, `currentTier` |
| Obstakels en schild | `index.html` | `obstacles`, `candies`, `shield`, `spawnDistance`, `coinItems` |
| Opgeslagen voortgang | `index.html` | `localStorage`, `dont-trip-grandma-coins`, `dont-trip-grandma-best`, `grandma-clothes`, `grandma-outfit`, `grandma-gadgets` |
| Geautomatiseerde checks | `tests/*.mjs` | winkel/sprite, home-layout, recovery timing, near-miss risk/reward en JS-parser |
| Deployment | `.github/workflows/deploy-wooden-hanger.yml` | `verify`, `node tests/store-regression.mjs`, `upload-pages-artifact`, `deploy-pages` |

Zoek op bovenstaande ankers in plaats van vaste regelnummers: één bestand bevat veel code en CSS-selectors kunnen meermaals voorkomen. Lees voor een wijziging de omliggende HTML, CSS én JavaScript.

## Afhankelijkheden en controle

**Outfits:** `clothing` → `data-buy` → `selectedClothes` → `saveInventory()` → `showMenu()` → `updateGrandmaOutfitPreview()` → gameplay-oma. Controleer geselecteerde kleuren, haar, actieve knop, munten, terugkeer naar menu en pagina herladen. De grote preview wordt momenteel bij `showMenu()` bijgewerkt; wijzig niet slechts de vaste SVG-kleur.

**Hanger:** `assets/hanger-spritesheet.svg` → CSS `background-image` en `background-size:576px 96px` (desktop) / `504px 84px` (mobiel) → `setHangerFrame()` → `syncClothesHanger()` → animatie. De zes cellen zijn elk 120×120 in het bronbestand; zorg dat de afbeelding en de positie per frame overeenkomen en dat `prefers-reduced-motion` gerespecteerd blijft. Controleer daadwerkelijke zichtbaarheid op mobiel en desktop, niet alleen of het bestand bestaat.

**Spel:** start/reset → frame/update/render → HUD en opslag. Gewone onbeschermde botsingen lopen nu via `RecoveryWindowController` (0,9 s) naar PERFECT/SAFE/MISS; MISS valt door naar de bestaande rescue/game-over-flow. `NearMissController` bouwt maximaal 0,03 focus op en verruimt de eerstvolgende SAFE-zone; PERFECT gebruikt `BalanceController` en een subtiele `recoveryCameraSettle`, uitgeschakeld bij `prefers-reduced-motion`. Bij timingwijzigingen ook eerste frame, pauze, restart, botsing, near-miss, recovery en game-over testen. Behoud bestaande localStorage-sleutels zodat voortgang niet verloren gaat.

**Publicatie:** bij wijzigingen aan `main` hoort de Pages-workflow HTML en de volledige gebruikte `assets/`-inhoud te publiceren. Een commit of een groene syntaxcheck is geen visuele browsercontrole. Geef commit, CI-status en eventuele browsercheck afzonderlijk door.

## Agent-werkwijze

1. Lees deze kaart, daarna de actuele repositoryboom, relevante bestanden en GitHub Actions-status.
2. Kies het kleinste bewezen probleem; geen ongevraagde redesign of overstap naar Unity/Phaser. V11 blijft de bron.
3. De gebruiker wil wijzigingen **direct op `main`**. Controleer de huidige blob-SHA vlak voor elke schrijfactie; gebruik geen force-push. Stop bij conflicten en verifieer opnieuw.
4. Controleer code en assets vóór het pushen; voer `node tests/store-regression.mjs` uit wanneer de bestanden lokaal beschikbaar zijn. Test game-interacties in een browser als die beschikbaar is. Rapporteer eerlijk wat niet getest is.
5. Houd deze routekaart synchroon met de actuele mapstructuur, de bestandsnamen en de functies.

**Snelle links:** [repository](https://github.com/wanderwerkhoven-afk/dont-fall-granny) · [index.html](https://github.com/wanderwerkhoven-afk/dont-fall-granny/blob/main/index.html) · [spritesheet](https://github.com/wanderwerkhoven-afk/dont-fall-granny/blob/main/assets/hanger-spritesheet.svg) · [tests](https://github.com/wanderwerkhoven-afk/dont-fall-granny/blob/main/tests/store-regression.mjs) · [Actions](https://github.com/wanderwerkhoven-afk/dont-fall-granny/actions).