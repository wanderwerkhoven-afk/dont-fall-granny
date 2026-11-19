/* World Events — one world-specific set-piece per run.
 * Owns timing and phase; gameplay owns the already existing vehicle physics.
 * No DOM, random respawn timers or parallel special-mode state flags.
 */
(()=>{'use strict';
const EVENTS=Object.freeze([
 {id:'buurt_scooter',world:0,title:'De buurt · Scootmobiel Chaos',mode:'booster',duration:9.5,icon:'🛵',accent:'#b7e0d0',caption:'Slalom langs de straat'},
 {id:'park_scooter',world:1,title:'Het park · Eendenexpress',mode:'booster',duration:10,icon:'🦆',accent:'#bad7a3',caption:'Slinger tussen de parkbankjes'},
 {id:'stad_scooter',world:2,title:'De stad · Scootmobiel Chaos',mode:'booster',duration:11,icon:'🛵',accent:'#bed1e4',caption:'Weef door het stadsverkeer'},
 {id:'woestijn_plane',world:3,title:'De woestijn · Zandstormvlucht',mode:'plane',duration:10,icon:'✈️',accent:'#f4c790',caption:'Fladder boven de zandstorm'},
 {id:'nacht_plane',world:4,title:'De nacht · Maanvlucht',mode:'plane',duration:9,icon:'🌙',accent:'#b2acd5',caption:'Vlieg langs de maan'},
 {id:'snoep_scooter',world:5,title:'De snoepwereld · Suiker-Slalom',mode:'booster',duration:11,icon:'🍬',accent:'#f4c3de',caption:'Ontwijk de snoepkraampjes'},
 {id:'ruimte_plane',world:6,title:'De ruimte · Sterrenvlucht',mode:'plane',duration:12,icon:'🚀',accent:'#c3bae9',caption:'Zweef tussen ruimterotsen'}
]);
const INTRO=.85,OUTRO=.75;
const ELIGIBLE_AT=18, PITY_AT=35, PITY_DISTANCE=680;
class WorldEventDirector{
 constructor(){this.reset();}
 reset(){
  this.phase='idle';this.current=null;this.used=false;this.elapsed=0;this.distance=0;
  this.phaseTime=0;this.startedAt=0;this.eventCount=0;this.reason=null;
 }
 get active(){return this.phase==='active'}
 get inEvent(){return ['intro','active','outro'].includes(this.phase)}
 get opacity(){
  if(this.phase==='intro')return Math.min(1,this.phaseTime/INTRO);
  if(this.phase==='outro')return Math.max(0,1-this.phaseTime/OUTRO);
  return this.phase==='active'?1:0;
 }
 get remaining(){return this.phase==='active'?Math.max(0,this.current.duration-this.phaseTime):
 this.phase==='intro'?this.current.duration:0;}
 eventFor(world){return EVENTS[((world%EVENTS.length)+EVENTS.length)%EVENTS.length];}
 canStart({state,controllerState,vehicle,recovery,paused}={}){
  return !this.used&&this.phase==='idle'&&state==='playing'&&controllerState==='running'&&
   !vehicle&&!recovery&&!paused;
 }
 tick(dt,options={},handlers={}){
  // The game calls this only for running frames. Recovery, pause and GAME_OVER
  // are explicitly excluded and cannot consume pity-time.
  if(options.state!=='playing'||options.recovery||options.paused||options.controllerState==='recovery')return;
  const step=Math.max(0,Math.min(.05,Number(dt)||0));
  if(this.inEvent){
   if(options.controllerState!=='special_mode')return;
   this.phaseTime+=step;
   if(this.phase==='intro'&&this.phaseTime>=INTRO){
    this.phase='active';this.phaseTime=0;handlers.onActive?.(this.current);
   }else if(this.phase==='active'&&this.phaseTime>=this.current.duration){
    this.phase='outro';this.phaseTime=0;handlers.onOutro?.(this.current);
   }else if(this.phase==='outro'&&this.phaseTime>=OUTRO){
    const finished=this.current;
    this.phase='complete';this.phaseTime=0;handlers.onEnd?.(finished);
   }
   return;
  }
  if(this.used||!this.canStart(options))return;
  this.elapsed+=step;
  this.distance=Math.max(this.distance,options.distance||0);
  const pity=this.elapsed>=PITY_AT||this.distance>=PITY_DISTANCE;
  // Deterministic scheduled start at 22–28s, varying by world, never RNG.
  const scheduled=ELIGIBLE_AT+((options.world||0)%7)*1.6;
  if((this.elapsed>=scheduled||pity)&&
     // Give the player a clean, predictable entrance without a collision.
     (options.safeToEnter||pity)){
   const next=this.eventFor(options.world||0);
   // The owner must authorize the transition before the director consumes the run.
   if(handlers.onStart?.(next,pity?'pity':'scheduled')===false)return;
   this.current=next;this.used=true;this.eventCount++;
   this.phase='intro';this.phaseTime=0;
   this.startedAt=this.elapsed;this.reason=pity?'pity':'scheduled';
  }
 }
 abort(){
  const wasActive=this.inEvent;
  this.phase=this.used?'complete':'idle';this.phaseTime=0;
  return wasActive;
 }
}
window.GrannyWorldEvents={EVENTS,INTRO,OUTRO,ELIGIBLE_AT,PITY_AT,PITY_DISTANCE,WorldEventDirector};
})();