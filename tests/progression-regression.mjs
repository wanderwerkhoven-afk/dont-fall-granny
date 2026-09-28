import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync('index.html','utf8');
const css=readFileSync('style.css','utf8');
const app=readFileSync('app.js','utf8');
const meta=readFileSync('game-meta.js','utf8');

new Function(meta);
new Function(app);

for(const id of ['combo','onboarding','runSummary'])assert.ok(html.includes('id="'+id+'"'),id+' surface missing');
assert.match(meta,/const achievements=\[/);
assert.match(meta,/const missionPool=\[/);
assert.match(meta,/const weeklyPool=\[/);
assert.match(meta,/const unlocks=\[/);
assert.match(meta,/const cosmetics=\[/);
assert.match(meta,/const worldRules=\[/);
assert.match(app,/grandma-meta-v1/,'Backwards-compatible meta storage key missing');
assert.match(app,/function evaluateAchievements\(/);
assert.match(app,/function incrementMission\(/);
assert.match(app,/event==='tier'\?Math\.max/,'Tier missions must track highest reached tier');
assert.match(app,/function finalizeRun\(/,'Runs need one-shot finalization');
assert.match(app,/if\(state==='over'\)finalizeRun\(\)/,'Only completed non-revived runs finalize on return home');
assert.match(app,/runFinalized=false/,'Run finalization guard missing');
assert.match(app,/function comboMultiplier\(/);
assert.match(app,/function currentWorldRule\(/);
assert.match(app,/function updateTutorial\(/);
assert.match(app,/data-open-page="progress"/);
assert.match(app,/data-open-page="collection"/);
assert.match(app,/data-accessory=/);
assert.match(app,/metaState\.stats\.perfects\+\+/);
assert.match(app,/metaState\.stats\.nearMisses\+\+/);
assert.match(app,/metaState\.stats\.coinsCollected\+=gain/);
assert.match(app,/runSummaryEl\.innerHTML/);
assert.match(app,/currentWorldRule\(\)\.jump/);
assert.match(app,/currentWorldRule\(\)\.gravity/);
assert.match(app,/worldRule\.wind/);
assert.match(app,/comboMultiplier\(\)/);
assert.match(css,/\.mission-card/);
assert.match(css,/\.achievement-grid/);
assert.match(css,/\.unlock-roadmap/);
assert.match(css,/\.onboarding-toast/);
assert.match(css,/#overlay\.gameover \.run-summary/);

console.log('PASS achievements, missions, combo, run summary, unlock roadmap, cosmetics, world mechanics and onboarding wiring');
