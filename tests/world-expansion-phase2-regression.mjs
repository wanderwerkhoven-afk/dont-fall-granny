import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const levelSource=readFileSync('levels.js','utf8');
const worldSource=readFileSync('world-mastery.js','utf8');
const metaSource=readFileSync('game-meta.js','utf8');
const eventsSource=readFileSync('world-events.js','utf8');
const sceneSource=readFileSync('storybook-worlds.js','utf8');
const app=readFileSync('app.js','utf8');
const storage=new Map([['granny-levels-v2',JSON.stringify({
 completed:Array.from({length:70},(_,i)=>i),selected:69,bests:{'69':2150,'48':1400}
})]]);
const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))};
const w={};new Function('window','localStorage',levelSource)(w,localStorage);
assert.equal(w.GrannyLevels.LEVELS.length,91);
assert.deepEqual(w.GrannyLevels.getWorlds().slice(10).map(x=>x.id),['halloween','jungle','carnival']);
assert.equal(w.GrannyLevels.getSelected(),69);
assert.equal(w.GrannyLevels.getLevels()[69].best,2150);
assert.equal(w.GrannyLevels.getLevels()[48].best,1400);
assert.equal(w.GrannyLevels.unlocked(70),true);
assert.equal(w.GrannyLevels.unlocked(77),false);
assert.ok(w.GrannyLevels.select(70));
const m={};new Function('window',worldSource)(m);
assert.equal(m.GrannyWorldMastery.WORLD_MASTERY.length,13);
for(let world=10;world<13;world++){
 const stats={distance:2000,perfects:9,nearMisses:14};
 assert.equal(m.GrannyWorldMastery.evaluate(world,stats).length,3);
 assert.deepEqual(m.GrannyWorldMastery.normalizeStars(stats),[true,true,true]);
}
const meta={};new Function('window',metaSource)(meta);
assert.deepEqual(meta.GrannyMeta.worldRules.slice(10).map(x=>x.id),['halloween','jungle','carnival']);
assert.equal(meta.GrannyMeta.worldChallenges.length,13);
const prizes=meta.GrannyMeta.cosmetics.filter(x=>x.masteryUnlock&&x.masteryUnlock.world>=10);
assert.equal(prizes.length,9);
assert.equal(new Set(prizes.map(x=>x.masteryUnlock.world+':'+x.masteryUnlock.star)).size,9);
const ev={};new Function('window',eventsSource)(ev);
assert.deepEqual(ev.GrannyWorldEvents.EVENTS.slice(10).map(x=>x.id),['halloween_plane','jungle_scooter','carnival_plane']);
const scenery={};new Function('window',sceneSource)(scenery);
assert.deepEqual(scenery.GrannyStorybook.NAMES.slice(10),['Halloweenland','De jungle','Het carnaval']);
for(const id of ['haunted-pumpkin','tombstone','ghost-lantern','witch-hat','jungle-log','snake','monkey-banana','temple-stone','clown-shoe','popcorn','balloon-cart','carnival-drum']){
 assert.match(app,new RegExp("id:'"+id+"'"),'Missing obstacle '+id);
 assert.match(app,new RegExp("t==='"+id+"'"),'Missing custom illustration '+id);
}
new Function(app);
console.log('PASS phase two: 91 levels, saved progress, three scenes, twelve rendered hazards, nine exclusive collectibles, 39 mastery stars');
