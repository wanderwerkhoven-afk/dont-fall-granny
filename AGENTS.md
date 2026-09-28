# Team GO — Don't Fall Granny

Team GO is het standaard implementatieteam voor productwerk in deze repository.

Repository: `wanderwerkhoven-afk/dont-fall-granny`  
Live game: https://wanderwerkhoven-afk.github.io/dont-fall-granny/

## Missie
Zet een gevraagde game-, UI- of productverbetering direct om in werkende productiecode. Team GO stopt niet bij advies: agents inspecteren de actuele implementatie, voeren wijzigingen uit, organiseren bestanden en assets, testen de relevante flows en controleren regressies.

## Agents
- **UI/UX Agent** — menu’s, HUD, shop, responsive layout, toegankelijkheid, visuele hiërarchie en consistentie.
- **Gameplay Agent** — core loop, difficulty, obstacles, recovery, near-miss, rewards, coins, progression en balancing.
- **Animation Agent** — character motion, feedback, transitions, camera response, sprites en reduced-motion gedrag.
- **State & Persistence Agent** — game state, inventory, equipped items, best score, coins, localStorage, migraties en reload-herstel.
- **Folder Manager Agent** — repositorystructuur, assets, naamgeving, veilige verplaatsingen en referentie-integriteit.
- **QA Agent** — start/pause/restart/game-over, collisions, recovery, shop, reloads, mobile flows en edge cases.
- **Review Agent** — regressiecontrole, duplicatie, integratiekwaliteit, performance en maintainability.
- **Verbeter Agent** — productaudit, nieuwe gameplaykansen, UX-verbeteringen en briefs voor nieuwe assets.

Agent-instructies:
- `.agents/skills/ui-ux-agent/SKILL.md`
- `.agents/skills/gameplay-agent/SKILL.md`
- `.agents/skills/animation-agent/SKILL.md`
- `.agents/skills/state-persistence-agent/SKILL.md`
- `.agents/skills/folder-manager-agent/SKILL.md`
- `.agents/skills/qa-agent/SKILL.md`
- `.agents/skills/review-agent/SKILL.md`
- `.agents/skills/verbeter-agent/SKILL.md`

## Operating mode: GO
Wanneer de gebruiker **Team GO**, **team go**, **agents go** zegt of Team GO opdracht geeft:

1. Inspecteer eerst de actuele relevante bestanden op `main`.
2. UI/UX, Gameplay, Animation en State & Persistence beoordelen de opdracht vanuit hun eigen scope en implementeren wat van toepassing is.
3. Folder Manager controleert alle geraakte en nieuwe bestanden/assets en ruimt structuur of naamgeving op wanneer dat veilig en logisch is.
4. Agents wijzigen de repository direct; ze stoppen niet bij aanbevelingen als de gevraagde verandering duidelijk implementeerbaar is.
5. QA test systematisch de complete geraakte flow, inclusief herhaalde interactie, reload/state recovery, mobiel en relevante edge cases.
6. Review controleert daarna de gecombineerde implementatie en repareert duidelijke regressies, dubbele logica of integratieproblemen.
7. Als QA of Review een betekenisvolle fix uitvoert, wordt die flow opnieuw gecontroleerd.
8. Verbeter Agent-voorstellen blijven voorstellen totdat de gebruiker ze expliciet laat uitvoeren.
9. Bestaand werkend gedrag blijft behouden tenzij de opdracht het expliciet vervangt.
10. Geef de voorkeur aan één coherente oplossing boven extra overrides, dubbele CSS, dubbele game-state of tijdelijke hacks.
11. Hergebruik bestaande stijlen, assets, gameplay-systemen en persisted state voordat nieuwe systemen worden toegevoegd.
12. Mobile is first-class. Controleer smalle schermen en korte viewporthoogtes.
13. Bestaande localStorage-sleutels blijven backwards compatible waar praktisch.
14. Nieuwe assets krijgen beschrijvende lowercase kebab-case namen en een logische map.
15. Motion mag essentiële acties niet blokkeren en moet `prefers-reduced-motion` respecteren.
16. Werk direct op `main`, tenzij de gebruiker expliciet anders vraagt.
17. Controleer vlak vóór iedere schrijfactie de actuele blob-SHA van het bestand.
18. Sluit af met een korte samenvatting van implementatie, QA/review-fixes en eventuele echte onzekerheden.

## Execution flow

```text
UI/UX ─────────┐
Gameplay ──────┤
Animation ─────┼─> geïntegreerde implementatie
State ─────────┘
       │
Folder Manager ─> bestands- en assetcontrole
       │
QA ─────────────> flowtests + fixes
       │
Review ─────────> integratie- en regressiecheck
       │
Targeted re-check
```

## Ownership
- UI/UX beheert visuele hiërarchie en interactielayout, niet gameplay-balancing.
- Gameplay beheert mechanics en progression, niet opslagarchitectuur.
- Animation beheert motion en feedback, niet de onderliggende mechanic.
- State & Persistence beheert opgeslagen data en state-integriteit.
- Folder Manager beheert structuur en referenties.
- QA beheert reproduceerbare gedragsverificatie.
- Review bewaakt totale integratiekwaliteit en mag duidelijke cross-scope defects repareren.
- Verbeter Agent ontdekt verbeterkansen maar implementeert ze niet automatisch.

## Conflictvolgorde
1. Correctheid en state/data-integriteit.
2. Expliciet gevraagd gedrag.
3. Gameplayduidelijkheid en fairness.
4. Visuele consistentie.
5. File/reference integrity.
6. Performance en motion clarity.
7. Minimale complexiteit.

## Huidige architectuur

Huidige release: **V.1.1.0.0**.

```text
dont-fall-granny/
├── .agents/skills/                  # Team GO agent skills
├── .github/workflows/               # CI + GitHub Pages
├── AGENTS.md                        # centrale Team GO instructie + routekaart
├── index.html                       # compacte HTML shell / semantische UI
├── style.css                        # alle layout, responsive en game-UI styling
├── game-meta.js                     # progression, achievements, missions, cosmetics en wereldregels
├── app.js                           # runtime gameplay, rendering, state en interactielogica
├── assets/
│   └── hanger-spritesheet.svg
└── tests/
    ├── structure-regression.mjs
    ├── progression-regression.mjs
    ├── store-regression.mjs
    ├── ui-ux-regression.mjs
    ├── shop-ux.mjs
    ├── wardrobe-scroll-outfits.mjs
    ├── boutique-regression.mjs
    ├── home-screen-regression.mjs
    ├── home-desktop-layout.mjs
    ├── recovery-skill-check.mjs
    └── recovery-risk-loop.mjs
```

### Releaseversies
Net als bij DONE is de zichtbare versie onderdeel van de werkflow. De canonieke versie staat in `game-meta.js`; `app.js` leest deze via `META.version` en mount hem in het hoofdmenu via `#appVersion`. Verhoog die bij een afgeronde, betekenisvolle Team GO-wijziging en neem dezelfde versie op in de commitboodschap van de releasewijziging. Refactors zonder functionele wijziging mogen binnen dezelfde releasebundel vallen.

## Code-routekaart

| Onderdeel | Pad | Zoekankers |
| --- | --- | --- |
| HTML shell / semantiek | `index.html` | `canvas`, `overlay`, `menuContent`, `appVersion`, `combo`, `runSummary`, `onboarding` |
| Meta progression | `game-meta.js` | `achievements`, `missionPool`, `weeklyPool`, `unlocks`, `cosmetics`, `worldRules` |
| Layout / responsive | `style.css` | `.shell`, `.game`, media queries |
| Canvas / HUD styling | `style.css` | `.scoreboard`, `.tier-track`, `.controls` |
| Menu / winkel styling | `style.css` | `#overlay`, `.menu-tabs`, `.store-grid` |
| Menu / winkel logica | `app.js` | `showMenu`, `data-buy`, `saveInventory`, `saveCoins` |
| Grandma preview | `app.js` | `updateGrandmaOutfitPreview` |
| Clothing | `app.js` | `const clothing`, `selectedClothes`, `ownedClothes` |
| Gadgets / vehicles | `app.js` | `const gadgets`, `ownedGadgets`, `vehicle`, `modeObstacles` |
| Start / pause / reset | `app.js` | `reset()`, `returnHome()`, `state` |
| Recovery | `app.js` | `RecoveryWindowController`, `triggerRecovery`, `finishRecovery` |
| Near miss / balance | `app.js` | `NearMissController`, `BalanceController`, `nearMissCandidate` |
| Game loop | `app.js` | `frame`, `update`, `travel`, `TIERS`, `currentTier` |
| Obstacles / pickups | `app.js` | `obstacles`, `candies`, `shield`, `coinItems` |
| Persistence | `app.js` | `localStorage`, `dont-trip-grandma-`, `grandma-`, `grandma-meta-v1` |
| Progression runtime | `app.js` | `evaluateAchievements`, `incrementMission`, `registerCombo`, `showMenu('progress')`, `showMenu('collection')` |
| Tests | `tests/*.mjs` | structure, store, UI, shop, recovery, risk/reward, syntax |
| Deployment | `.github/workflows/` | Pages + test steps |

## Kritieke afhankelijkheden
**Shop/outfits:** data → aankoop → ownership → equipped state → save → menu preview → gameplay rendering. Test aankoop, onvoldoende coins, equip, reload en terugkeer naar menu.

**Recovery:** collision → recovery window → PERFECT/SAFE/MISS → balance/near-miss/camera → vervolg gameplay of rescue/game-over. Test timing, pauze, repeat collisions en restart.

**Persistence:** wijzigingen aan coins, highscore, outfits of gadgets mogen bestaande opgeslagen data niet stil verliezen. Nieuwe progression-data gebruikt `grandma-meta-v1`; bestaande keys blijven backwards compatible. Voeg migraties toe als een schema echt verandert.

**Publicatie:** een commit is niet hetzelfde als een visueel bewezen fix. Rapporteer commit, teststatus en browsercontrole afzonderlijk wanneer die beschikbaar zijn.

## Productkarakter
Don't Fall Granny is een compacte, humoristische arcadegame. Verbeteringen mogen speels, expressief en belonend zijn, maar gameplay moet leesbaar blijven en feedback mag het spel niet visueel verstoppen.
