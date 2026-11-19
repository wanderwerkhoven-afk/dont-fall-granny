# Don't Trip Grandma — Verbeteringenregister

Dit bestand is de **bron van waarheid** voor welke verbeteringsrondes de gebruiker heeft aangeleverd en wat er daadwerkelijk is uitgevoerd. Werk dit bestand bij bij elke nieuwe verbeteringsopdracht en na implementatie, tests en publicatie.

**Statussen**
- **Ontvangen** — omschrijving ontvangen, implementatie nog niet gestart.
- **In uitvoering** — concrete werkzaamheden gestart, nog niet gereed.
- **Geïmplementeerd** — code is naar `main` gepusht, maar tests/deployment zijn nog niet bevestigd.
- **Afgerond** — relevante tests en GitHub Pages-deployment geslaagd.
- **Geblokkeerd** — er is een concrete blokkade.

## Genummerde verbeteringsrondes

| Nummer | Onderwerp | Ontvangen | Status | Opmerkingen |
| --- | --- | --- | --- | --- |
| **8** | Technische polish — centrale `GameStateController` met legale transities, state-aware input, debug-HUD (`?debug=1`) en regressietests | 2026-11-16 | **In uitvoering** | `game-state.js` is aangemaakt op `main`. Integratie met `app.js`, debug-HUD, testen en deployment zijn **nog niet** voltooid. Niet als afgerond presenteren. |
| **9** | Gameplay — Granny Combo Routes: vaardigheid en vrijwillig risico belonen via een centrale `ComboController` | 2026-11-16 | **Ontvangen** | Near Miss verhoogt combo; succesvolle Granny Situation verhoogt combo; SAFE/PERFECT Recovery behoudt of verhoogt combo; vallen of mislukte Recovery beëindigt combo. Veilige route blijft altijd beschikbaar zonder straf. Combo-events alleen in toegestane toestanden van `GameStateController` (#8). Eerste gameplayverbetering na technische polish. Nog niet als geïmplementeerd of getest bevestigd. |
| **10** | Graphics / Art Direction — Expressieve Granny-animaties: gezichtsuitdrukkingen en houdingen bij gevaar, near miss, recovery, SAFE/PERFECT, springen en voertuigen | 2026-11-16 | **Afgerond** | `granny-expressions.js` is gekoppeld aan de bestaande canvas-illustratie met eigen regressietests, Reduced Motion en complete offline/deployment-bundel. Geen dubbele sprite/physics-implementatie. Verified CI/deployment commit `82c88f54`; extra browser-testworkflow toegevoegd. |
| **11** | UX/UI — `Fall → Rescue → Result → Retry`: Granny blijft zichtbaar in dezelfde wereld, rescue-paneel transformeert in contextafhankelijk resultaat en directe retry | 2026-11-16 | **Afgerond — UX-correctie** | Nieuwe `run-results.js` met `RunSummaryBuilder` (maximaal 3 geprioriteerde highlights, compact/standard/celebration, maximaal één daadwerkelijke unlock) en `RunResultOverlay`: bevroren spelwereld met Granny op de grond en countdown-ring, rescue-keuze → resultaat, geanimeerde afstand, `NOG EEN KEER`/kleine Home, tik-om-opnieuw na 700 ms. Retry zonder reload via bestaande `game-state.js` uitgebreid met `GAME_OVER → RUN_RESET → RUNNING`, zonder te claimen dat de volledige refactor van #8 voltooid is. UX-correctie: gedeelde, compacte onderbalk voor Rescue en Result, subtielere dimming, Granny zichtbaar in linker speelbaan; browsertest controleert veilige ondermarge en stabiele positie in desktop, staand en liggend mobiel. |
| **12** | Levels / Content — zeven wereldspecifieke World Events (8–12 sec incl. intro/outro), o.a. Scootmobiel Chaos, Eendenexpress, Zandstormvlucht en Sterrenvlucht | 2026-11-19 | **Afgerond** | `world-events.js` is de enige regisseur voor speciale scènes (één event per run), met deterministische timing, in-run pity en over meerdere runs opgeslagen pity-streak. Bestaande vliegtuig-/scootmobielbesturing hergebruikt, wereldspecifieke kleuren/intros/outros en responsieve HUD. Normale obstakels en Recovery onderdrukt tijdens SPECIAL_MODE; veilige intro/outro, 1,6s entreebescherming, gadgets leveren een beschermschild. `app.js` koppelt transities RUNNING → SPECIAL_MODE → RUNNING aan bestaande `GameStateController`, pauze hervat dezelfde modus en een val gaat naar FALLING/RESCUE. Tests: `tests/world-events-regression.mjs`, `tests/world-events-browser.cjs`, plus eerdere smoke- en recoverytests. Pages/deploy geverifieerd op commit `526f4cb0`; browser-suites geverifieerd op eerder commit `fa593f27`. |
| **13** | Progression — World Mastery met drie permanente sterren per wereld (21 totaal), cosmetische Adventure Book-stickers en voortgangsoverzicht | 2026-11-19 | **Afgerond** | De bestaande cumulatieve wereldstatistieken (`distance`, `perfects`, `nearMisses`) voeden `world-mastery.js`, zonder een tweede munt-, XP- of achievement-systeem. De 21 unieke sterren en stickers ontgrendelen bij specifieke prestatiedrempels en worden onmiddellijk in `grandma-meta-v1` opgeslagen; behaalde sterren worden nooit afgenomen. Bij het openen van oude savegames worden behaalde eerdere prestaties eenmalig gereconcilieerd. Zeven gestileerde Adventure Book-pagina’s staan bovenaan Progressie, mobiel en desktop. De stickers zijn uitsluitend visueel en geven geen gameplayvoordeel. Tests: `tests/world-mastery-regression.mjs` en `tests/world-mastery-browser.cjs`, naast de bestaande progressie- en gameplaytests. |
| **14** | Audio/VFX — Danger Soundscape: directionele waarschuwingen 400–900 ms vóór botsing met alternatieve visuele randindicatoren; muziek, geluidseffecten en waarschuwingen onafhankelijk instelbaar | 2026-11-19 | **Afgerond** | `danger-soundscape.js` voorspelt tijd tot contact uit dezelfde posities, snelheden en versnellingsdrempels als de collision loop. Contextafhankelijke tweeklanks-cues met rechtsgericht stereo-panorama voor verkeer, dieren en wandelaars, plus vliegmuren en scootmobiel-obstakels per juiste rijbaan. Eenmaal per obstakel; geen late audiocues onder 400 ms. Subtiele rechtsgeankerde visuele indicator is afzonderlijk uit te zetten en werkt zonder audio. Optionele zachte in-game muziek, geluidseffecten en visuele waarschuwingen zijn los instelbaar en blijven opgeslagen in `grandma-meta-v1`, inclusief migratie van de oude audio-instelling. Waarschuwingen stoppen bij Recovery, pauze, game-over, intro/outro en menu. Landscape Spelinstellingen toegankelijk gemaakt. Tests: `tests/danger-soundscape-regression.mjs` en `tests/danger-soundscape-browser.cjs`, plus eerdere smoke- en recoverytests; offline-bestanden via PWA-cache v23. |

> Van verbeteringen 1 t/m 7 worden de exacte oorspronkelijke genummerde omschrijvingen nog niet als bevestigd beschouwd. Vul deze pas in als het nummer ondubbelzinnig is herleid tot de oorspronkelijke opdracht. Zo voorkomen we verkeerde dubbele registraties.

## Reeds besproken en uitgevoerde projectonderdelen (niet noodzakelijk gelijk aan verbeteringsnummers)

| Onderdeel | Bekende implementatie | Volgende controle |
| --- | --- | --- |
| Gameplay | Recovery Skill Check en basis-run | Behouden bij state-machine-refactor |
| Graphics | Storybook Worlds/parallax, rustiger bewegende scenery | Regressietests en visuele beoordeling |
| UI/UX | Startmenu links, Granny rechts; winkels en mobiele layout | Responsieve weergave behouden |
| Levels | 7 werelden × 7 levels (49) | Ontgrendeling en ononderbroken run behouden |
| Progressie | Munten, uitdagingen en records | Eventgestuurd maken zonder dubbele beloning |
| Audio/VFX | Bestaande feedbackfuncties | Stoppen/aanpassen bij state-transities |
| Positionering | Bestaande game-presentatie | Geen nieuwe wijziging in ronde 8 |

## Werkafspraak voor volgende rondes

1. Controleer vóór de implementatie eerst dit bestand én relevante bestaande code en tests.
2. Is een verbetering al ontvangen of uitgevoerd? Meld dat expliciet; maak geen dubbele implementatie.
3. Voeg nieuwe verbeternummers toe bij ontvangst, vermeld wat precies binnen scope valt.
4. Zet pas op **Afgerond** wanneer tests én publicatie bevestigd zijn; vermeld zo nodig de commit.
5. Wijzig bij een uitbreiding van een eerdere verbetering de bestaande rij en beschrijf wat er nieuw is.

_Laatst bijgewerkt: 2026-11-19._
