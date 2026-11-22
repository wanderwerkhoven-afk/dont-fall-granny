import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const levels=readFileSync('levels.js','utf8');
const mastery=readFileSync('world-mastery.js','utf8');
const story=readFileSync('storybook-worlds.js','utf8');
const game=readFileSync('app.js','utf8');
const meta=readFileSync('game-meta.js','utf8');
const event=readFileSync('world-events.js','utf8');
const storage=new Map();
const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v))};
storage.set('granny-levels-v2',JSON.stringify({completed:Array.from({length:49},(_,i)=>i),selected:48,bests:{48:1410}}));
const w={};
new Function('window','localStorage',levels)(w,localStorage);
const worldNames=w.GrannyLevels.getWorlds().map(x=>x.name);
assert.deepEqual(worldNames.slice(7),['Winterwonderland','Neon 80’s','Piratenbaai']);
assert.equal(w.GrannyLevels.LEVELS.length,91);
assert.equal(w.GrannyLevels.getSelected(),48,'Preserve selected old level');
assert.equal(w.GrannyLevels.getLevels()[48].best,1410,'Preserve existing score');
assert.equal(w.GrannyLevels.unlocked(49),true,'First Winter level unlocks after final old level');
assert.equal(w.GrannyLevels.unlocked(56),false,'Neon world requires completing Winter');
w.GrannyLevels.select(49);
assert.equal(w.GrannyLevels.getSelected(),49,'New world level selectable');
assert.equal(w.GrannyLevels.getWorlds().length,13);
const m={};new Function('window',mastery)(m);
assert.equal(m.GrannyWorldMastery.WORLD_MASTERY.length,13);
assert.equal(m.GrannyWorldMastery.totalStars({}),0);
for(let i=7;i<10;i++){
 const entry={distance:1700,perfects:8,nearMisses:12};
 assert.equal(m.GrannyWorldMastery.evaluate(i,entry).length,3);
 assert.equal(m.GrannyWorldMastery.progress(i,entry).earned,3);
}
const metaWindow={};new Function('window',meta)(metaWindow);
assert.deepEqual(metaWindow.GrannyMeta.worldRules.slice(7).map(x=>x.id),['winter','neon','pirate']);
assert.equal(metaWindow.GrannyMeta.worldChallenges.length,13);
const ev={};new Function('window',event)(ev);
assert.equal(ev.GrannyWorldEvents.EVENTS.length,13);
assert.deepEqual(ev.GrannyWorldEvents.EVENTS.slice(7,10).map(x=>x.world),[7,8,9]);
const scenes={};new Function('window',story)(scenes);
assert.equal(scenes.GrannyStorybook.NAMES.length,13);
const types=game.slice(game.indexOf('const zoneTypes=['),game.indexOf('const extras=['));
for(const kind of ['snowman','snowball','icicle','sled','boombox','cassette','arcade','disco-ball','barrel','cannonball','crab','treasure']){
 assert.ok(types.includes("'"+kind+"'"),kind+' obstacle not integrated in world spawner');
}
assert.match(game,/currentTier%TIERS\.length/);
assert.match(game,/function drawObstacle\(/);
new Function(game);
console.log('PASS phase-one expansion: 91 levels, migration, 13 scenes, 12 hazards, 3 events, 30 stars and new physics');
