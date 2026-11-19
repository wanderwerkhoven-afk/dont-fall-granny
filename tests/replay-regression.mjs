import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync('replay-engine.js','utf8');
const app=readFileSync('app.js','utf8');
const win={};new Function('window',js)(win);
const {RULESET,DT,ReplayEngine,SeededRandom,ensureTape,KEY}=win.GrannyReplay;
assert.equal(DT,1/60);assert.ok(RULESET.includes('rules'));
const a=new SeededRandom(123456),b=new SeededRandom(123456),c=new SeededRandom(654321);
const series=Array.from({length:50},()=>a.next());
assert.deepEqual(series,Array.from({length:50},()=>b.next()));
assert.notDeepEqual(series,Array.from({length:50},()=>c.next()));
const engine=new ReplayEngine();
const tape=engine.newRecording({activeLevel:0,world:0,difficulty:'normal',
 worldWidth:900,worldHeight:390,ground:313,grandmaX:105,
 outfit:'classic',ownedGadgets:[],pity:0,completedLevels:[]},123456);
assert.equal(tape.ruleset,RULESET);
assert.equal(tape.seed,123456);
const game={x:105,y:243,score:0};
const apply=action=>{if(action==='jump')game.y-=4;if(action==='left')game.x-=5;if(action==='right')game.x+=5;};
for(let i=0;i<120;i++){
 if(i===10||i===25||i===76)assert.equal(engine.queue('jump'),true);
 if(i===40)assert.equal(engine.queue('left'),true);
 if(i===78)assert.equal(engine.queue('right'),true);
 engine.beforeTick(apply);
 game.score+=2;
 engine.afterTick({t:engine.tick,x:game.x,y:game.y,score:game.score,world:0,lane:1,mode:'run'});
}
assert.equal(engine.tick,120);
assert.equal(engine.inputs.length,5);
assert.equal(engine.frames.length,24);
assert.equal(engine.inputs[0][0],10);
engine.finish({score:game.score});
assert.equal(engine.tape.result.score,240);
const mem=new Map(),storage={getItem:key=>mem.get(key)||null,setItem:(key,val)=>mem.set(key,val)};
assert.equal(engine.save(storage),true);assert.ok(storage.getItem(KEY));
const loaded=engine.restore(storage);assert.deepEqual(loaded,tape);
const playback=new ReplayEngine();playback.load(JSON.stringify(tape));
const copy={x:105,y:243,score:0};
for(let i=0;i<120;i++){
 playback.beforeTick(action=>{if(action==='jump')copy.y-=4;if(action==='left')copy.x-=5;if(action==='right')copy.x+=5;});
 copy.score+=2;
 playback.afterTick({t:playback.tick,x:copy.x,y:copy.y,score:copy.score,world:0,lane:1,mode:'run'});
}
assert.equal(playback.error,null,'Same ruleset/seed/tick input must reproduce snapshots');
assert.deepEqual(copy,game);
playback.load(tape);playback.afterTick({t:0,x:999,y:243,score:2,world:0,lane:1,mode:'run'});
assert.match(playback.error,/simulatiestap 0/,'State divergence should report first mismatching tick');
const ghost=new ReplayEngine();ghost.ghostEnabled=true;ghost.setGhost(tape);
assert.deepEqual(ghost.ghostAt(25),tape.frames[5]);
ghost.ghostEnabled=false;assert.equal(ghost.ghostAt(25),null);
assert.throws(()=>ensureTape({...tape,ruleset:'old-rules'}),/ruleset/);
assert.throws(()=>ensureTape({...tape,format:99}),/ruleset/);
assert.throws(()=>ensureTape({...tape,inputs:[[0,'cheat']]}),/input/);
assert.match(app,/replay\.beforeTick\(applyReplayInput\)/);
assert.match(app,/replay\.afterTick\(replayFrame\(\)\)/);
assert.match(app,/replay\.queue\('jump'\)/);
assert.match(app,/replay\.queue\(direction<0\?'left':'right'\)/);
assert.match(app,/function drawReplayGhost\(/);
assert.match(app,/function forceReplayDimensions\(/);
assert.match(app,/COPY REPLAY/);
assert.match(app,/LOAD REPLAY/);
assert.match(app,/function finishReplayRecording\(/);
assert.match(app,/window\.GrannyReplay\.DT/);
new Function(app);
console.log('PASS replay: fixed 60Hz, seeded randomness, deterministic tick inputs, snapshot validation, ghost, debug and persistence');
