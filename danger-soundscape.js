/* Improvement 14 — Danger Soundscape.
 * Prediction operates on the same obstacle x, charge point, multiplier and
 * instantaneous scroll speed as the collision loop; no speculative timers.
 */
(()=>{'use strict';
const MIN_LEAD=.4,MAX_LEAD=.9;
function timeToContact(obstacle,granny,speed){
 if(!obstacle||!granny||!Number.isFinite(speed)||speed<=0||obstacle.hit)return Infinity;
 const contact=granny.x+7+Math.max(0,granny.w-13)-7;
 const leading=obstacle.x+3; // identical obstacle body start used by collision check
 const distance=leading-contact;
 if(distance<=0)return Infinity;
 const factor=Math.max(1,Number(obstacle.multiplier)||1);
 if(!obstacle.attacking||obstacle.charging||factor===1)return distance/(speed*(obstacle.charging?factor:1));
 const chargeX=Number(obstacle.chargeX);
 if(!Number.isFinite(chargeX))return distance/speed;
 const before=Math.max(0,obstacle.x-chargeX);
 return Math.min(distance,before)/speed+Math.max(0,distance-before)/(speed*factor);
}
function classify(obstacle){
 const id=obstacle?.type?.id||obstacle?.kind||'obstacle';
 if(id==='car')return {id:'vehicle',label:'Verkeer',frequency:210,pan:.72};
 if(id==='cat'||id==='dog')return {id:'animal',label:'Dier',frequency:650,pan:.6};
 if(id==='walker')return {id:'pedestrian',label:'Wandelaar',frequency:480,pan:.6};
 return {id:'obstacle',label:'Obstakel',frequency:360,pan:.62};
}
class DangerSoundscape{
 constructor(){this.reset();}
 reset(){this.warned=new WeakSet();this.visible=null;this.count=0;}
 update({obstacles=[],granny,speed,state,controllerState,vehicle=false,recovery=false,paused=false}={}){
  if(state!=='playing'||controllerState!=='running'||vehicle||recovery||paused){
   this.visible=null;return null;
  }
  let closest=null;
  for(const obstacle of obstacles){
   const eta=timeToContact(obstacle,granny,speed);
   if(eta>MAX_LEAD||eta<0||!Number.isFinite(eta))continue;
   if(!closest||eta<closest.eta)closest={obstacle,eta,kind:classify(obstacle)};
  }
  this.visible=closest;
  if(closest&&!this.warned.has(closest.obstacle)){
   this.warned.add(closest.obstacle);this.count++;
   return {...closest,first:true};
  }
  return closest?{...closest,first:false}:null;
 }
}
class DangerAudioDirector{
 constructor(win=window){this.win=win;this.context=null;this.step=0;this.nextBeat=0;this.enabled=false;}
 getContext(){
  if(this.context)return this.context;
  const Ctor=this.win.AudioContext||this.win.webkitAudioContext;
  if(!Ctor)return null;
  try{this.context=new Ctor();}catch(e){return null;}
  return this.context;
 }
 unlock(){const ctx=this.getContext();if(ctx?.state==='suspended')ctx.resume().catch(()=>{});}
 note(frequency,duration=.1,volume=.025,type='sine',pan=0,offset=0){
  const ctx=this.getContext();
  if(!ctx||ctx.state==='suspended')return;
  const start=ctx.currentTime+Math.max(0,offset);
  try{
   const osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type=type;osc.frequency.setValueAtTime(Math.max(60,frequency),start);
   gain.gain.setValueAtTime(.0001,start);
   gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.012);
   gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
   if(typeof ctx.createStereoPanner==='function'){
    const panner=ctx.createStereoPanner();
    panner.pan.value=Math.max(-1,Math.min(1,pan));
    osc.connect(gain);gain.connect(panner);panner.connect(ctx.destination);
   }else{osc.connect(gain);gain.connect(ctx.destination);}
   osc.start(start);osc.stop(start+duration+.015);
  }catch(e){}
 }
 warning(kind){
  const frequency=kind?.frequency||400,pan=kind?.pan||.6;
  // Short, recognisable two-tone alert; each obstacle is cued once.
  this.note(frequency,.12,.046,kind?.id==='vehicle'?'triangle':'sine',pan,0);
  this.note(frequency*1.26,.105,.035,'triangle',Math.max(.1,pan-.24),.15);
 }
 effect(kind){
  const map={coin:[680,.045],jump:[330,.035],perfect:[880,.09],safe:[520,.06],
   fail:[150,.11],tier:[760,.12],achievement:[980,.13],combo:[820,.07]};
  const [freq,duration]=map[kind]||[440,.04];
  this.note(freq,duration,.03,kind==='fail'?'sawtooth':'sine');
 }
 musicTick(playing,enabled){
  const ctx=this.context;
  if(!enabled||!playing){this.enabled=false;return;}
  if(!ctx||ctx.state!=='running')return;
  if(!this.enabled){this.enabled=true;this.step=0;this.nextBeat=ctx.currentTime;}
  const melody=[392,0,523.25,0,440,0,493.88,0,392,0,329.63,0,349.23,0,0,0];
  // Schedule only the immediate note: no stale audio during pause/rescue.
  if(ctx.currentTime>=this.nextBeat){
   const freq=melody[this.step%melody.length];
   if(freq)this.note(freq,.15,.008,'sine',-.1);
   this.step++;this.nextBeat=ctx.currentTime+.28;
  }
 }
 stop(){this.enabled=false;}
}
window.GrannyDangerSoundscape={MIN_LEAD,MAX_LEAD,timeToContact,classify,DangerSoundscape,DangerAudioDirector};
})();