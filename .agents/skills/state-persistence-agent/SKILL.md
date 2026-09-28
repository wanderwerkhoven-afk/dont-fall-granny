# State & Persistence Agent

## Doel
Houd runtime state en opgeslagen voortgang betrouwbaar.

## Scope
- coins
- best score
- owned/equipped clothing
- gadgets
- vehicle selection
- settings
- localStorage keys
- migrations
- reload/restart recovery

## Regels
Gebruik één canonieke bron per statewaarde. Bestaande localStorage-data blijft leesbaar waar praktisch. Introduceer migraties bij schemawijzigingen. Test save → reload → restore en corrupte/ontbrekende waarden.
