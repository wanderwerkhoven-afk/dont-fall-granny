/* Improvement 16: deterministic game replays and optional cosmetic ghost.
 * Replay schema v1 is deliberately strict: ruleset, seed, inputs, stage,
 * initial state and verification samples are all included.
 */
(()=>{'use strict';
const VERSION=1,RULESET='granny-rules-2026.11.19-r1',DT=1/60;
const KEY='granny-replay-last-v1',GHOST_KEY='granny-replay-ghost-enabled-v1';
function seedFromCrypto(){
 const bytes=new Uint32Array(1);
 if(globalThis.crypto?.getRandomValues)globalThis.crypto.getRandomValues(bytes);
 else bytes[0]=(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;
 return bytes[0]||1;
}
class SeededRandom{
 constructor(seed=1){this.initial=seed>>>0;this.state=this.initial||1;}
 next(){let x=this.state;x^=x<<13;x^=x>>>17;x^=x<<5;this.state=x>>>0;return this.state/4294967296;}
}
function digest(frame){
 let h=2166136261>>>0;
 for(const value of [frame.t,frame.x,frame.y,frame.score,frame.world,frame.lane,frame.mode]){
  for(const c of String(value)){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}
 }
 return h>>>0;
}
function ensureTape(value){
 const o=typeof value==='string'?JSON.parse(value):value;
 if(!o||o.format!==VERSION||o.ruleset!==RULESET)throw Error('Onbekende replayversie of ruleset. Deze opname kan niet veilig worden afgespeeld.');
 if(!Number.isInteger(o.seed)||o.seed<0||o.seed>0xffffffff||!Array.isArray(o.inputs)||!Array.isArray(o.frames)||!o.start)
  throw Error('Replay bevat ongeldige gegevens.');
 if(o.inputs.length>60000||o.frames.length>20000)throw Error('Replay is te groot.');
 if(!o.inputs.every(e=>Array.isArray(e)&&e.length===2&&Number.isInteger(e[0])&&e[0]>=0&&
   ['jump','left','right'].includes(e[1])))throw Error('Replay bevat ongeldige input.');
 return o;
}
class ReplayEngine{
 constructor(){this.mode='idle';this.tick=0;this.random=new SeededRandom();this.inputs=[];this.frames=[];this.cursor=0;this.tape=null;this.applied=false;this.ghostEnabled=false;this.ghostFrames=[];this.ghostIndex=0;this.error=null;}
 newRecording(start,seed=seedFromCrypto()){
  this.mode='record';this.tick=0;this.inputs=[];this.frames=[];this.cursor=0;this.error=null;
  this.random=new SeededRandom(seed);
  this.tape={format:VERSION,ruleset:RULESET,seed:this.random.initial,start:{...start},
   inputs:this.inputs,frames:this.frames,result:null};
  return this.tape;
 }
 load(value){
  const tape=ensureTape(value);
  this.mode='playback';this.tick=0;this.cursor=0;this.error=null;
  this.tape=tape;this.inputs=tape.inputs;this.frames=tape.frames;
  this.random=new SeededRandom(tape.seed);
  return tape;
 }
 idle(){this.mode='idle';this.tick=0;this.cursor=0;this.applied=false;}
 randomValue(){return this.mode==='idle'?Math.random():this.random.next();}
 queue(action){
  if(this.applied)return false;
  if(this.mode==='playback')return true; // user controls cannot interfere
  if(this.mode==='record'){
   this.inputs.push([this.tick,action]);
   return true;
  }
  return false;
 }
 beforeTick(apply){
  if(this.mode==='playback'){
   while(this.cursor<this.inputs.length&&this.inputs[this.cursor][0]===this.tick){
    this.applied=true;try{apply(this.inputs[this.cursor][1]);}finally{this.applied=false;}
    this.cursor++;
   }
  }else if(this.mode==='record'){
   while(this.cursor<this.inputs.length&&this.inputs[this.cursor][0]===this.tick){
    this.applied=true;try{apply(this.inputs[this.cursor][1]);}finally{this.applied=false;}
    this.cursor++;
   }
  }
 }
 afterTick(frame){
  if(this.mode==='idle')return;
  if(this.mode==='record'){
   // Keep every fifth frame for a smooth ghost without bloating localStorage.
   if(this.tick%5===0)this.frames.push(frame);
  }else if(this.mode==='playback'&&this.tick%5===0){
   const reference=this.frames[Math.floor(this.tick/5)];
   if(reference&&digest(reference)!==digest(frame)&&!this.error){
    this.error='Replay wijkt af bij simulatiestap '+this.tick+' (ruleset of toestand gewijzigd).';
   }
  }
  this.tick++;
 }
 finish(result={}){
  if(this.mode==='record'&&this.tape){
   this.tape.result={...result,ticks:this.tick};
   return this.tape;
  }
  return this.tape;
 }
 save(storage,tape=this.tape){if(!tape||tape.format!==VERSION)return false;
  try{storage.setItem(KEY,JSON.stringify(tape));return true}catch(e){return false}
 }
 restore(storage){try{const value=storage.getItem(KEY);return value?ensureTape(value):null}catch(e){return null}}
 ghostAt(tick){
  if(!this.ghostEnabled||!this.ghostFrames.length||this.mode==='playback')return null;
  const index=Math.min(this.ghostFrames.length-1,Math.floor(Math.max(0,tick)/5));
  return this.ghostFrames[index]||null;
 }
 setGhost(tape){this.ghostFrames=tape?.frames||[];}
}
window.GrannyReplay={VERSION,RULESET,DT,KEY,GHOST_KEY,SeededRandom,ReplayEngine,digest,ensureTape};
})();