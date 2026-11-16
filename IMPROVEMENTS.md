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

_Laatst bijgewerkt: 2026-11-16._
