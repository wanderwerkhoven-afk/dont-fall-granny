import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('world-events.js','utf8');
const main=readFileSync('app.js','utf8');
const w={};new Function('window',source)(w);
const {EVENTS,INTRO,OUTRO,ELIGIBLE_AT,PITY_AT,WorldEventDirector}=w.GrannyWorldEvents;
assert.equal(EVENTS.length,7);
assert.equal(new Set(EVENTS.map(e=>e.world)).size,7);
assert.equal(new Set(EVENTS.map(e=>e.id)).size,7);
for(const [i,ev] of EVENTS.entries()){
 assert.equal(ev.world,i);
 assert.ok(ev.duration>=8&&ev.duration<=12,'Invalid event duration '+ev.id);
 assert.ok(ev.mode==='plane'||ev.mode==='booster');
 assert.ok(ev.title&&ev.caption&&ev.accent);
}
function sim(world=0,pityStreak=0){
 const e=new WorldEventDirector();e.reset(pityStreak);
 let state='playing',controllerState='running',vehicle=null,recovery=false,paused=false,safeToEnter=true;
 const log=[];
 const callbacks={
  onStart:(event,reason)=>{if(controllerState!=='running')return false;
   vehicle=event.mode;controllerState='special_mode';log.push('start:'+event.id+':'+reason);return true;},
  onActive:event=>log.push('active:'+event.id),
  onOutro:event=>log.push('outro:'+event.id),
  onEnd:event=>{vehicle=null;controllerState='running';log.push('end:'+event.id);}
 };
 const opts=()=>({state,controllerState,vehicle,recovery,paused,safeToEnter,world,distance:0});
 return {e,log,step:(seconds)=>{for(let i=0;i<Math.ceil(seconds/.05);i++)e.tick(.05,opts(),callbacks)},
  set:(name,value)=>{switch(name){
   case 'state':state=value;break;case 'controllerState':controllerState=value;break;
   case 'vehicle':vehicle=value;break;case 'recovery':recovery=value;break;
   case 'paused':paused=value;break;case 'safeToEnter':safeToEnter=value;break;
   default:throw Error(name);
  }},
  snapshot:()=>({state,controllerState,vehicle,recovery,paused})
 };
}
for(let world=0;world<7;world++){
 const x=sim(world);
 x.step(29);
 assert.equal(x.e.used,true,'Scheduled event missing in world '+world);
 assert.equal(x.e.current.id,EVENTS[world].id);
 assert.equal(x.e.eventCount,1);
 assert.ok(x.e.inEvent||x.e.phase==='complete');
 assert.equal(x.e.reason,'scheduled');
 x.step(EVENTS[world].duration+INTRO+OUTRO+1);
 assert.equal(x.e.phase,'complete','Event did not finish '+world);
 assert.equal(x.snapshot().controllerState,'running');
 assert.equal(x.log.length,4,'Expected four ordered callbacks');
 assert.deepEqual(x.log.map(z=>z.split(':')[0]),['start','active','outro','end']);
 x.step(80);
 assert.equal(x.e.eventCount,1,'Double special event in one run');
}
// Total event time includes the intro and outro (not 12s plus transitions).
const timing=sim(0);
timing.step(18.1);
assert.equal(timing.e.eventCount,1);
timing.step(EVENTS[0].duration-.3);
assert.ok(timing.e.inEvent,'Event ended earlier than its inclusive 8–12s duration');
timing.step(.5);
assert.equal(timing.e.phase,'complete','Event exceeded its inclusive duration');
const paused=sim(1);
paused.step(10);
const before=paused.e.elapsed;
paused.set('paused',true);paused.set('state','paused');paused.step(90);
assert.equal(paused.e.elapsed,before,'Pause advanced event countdown');
paused.set('paused',false);paused.set('state','playing');
paused.set('recovery',true);paused.set('controllerState','recovery');paused.step(90);
assert.equal(paused.e.elapsed,before,'Recovery advanced event countdown');
paused.set('recovery',false);paused.set('controllerState','running');paused.step(18);
assert.equal(paused.e.eventCount,1);
const special=sim(3);
special.set('controllerState','special_mode');special.set('vehicle','plane');special.step(80);
assert.equal(special.e.eventCount,0,'Parallel special mode incorrectly started another');
const unsafely=sim(2);
unsafely.set('safeToEnter',false);unsafely.step(PITY_AT-1);
assert.equal(unsafely.e.eventCount,0,'Triggered event in an unsafe lane before pity');
unsafely.step(2);
assert.equal(unsafely.e.reason,'pity','Pity did not override a perpetually occupied lane');
assert.equal(unsafely.e.eventCount,1);
const misses=sim(6,4);
misses.step(20);
assert.equal(misses.e.eventCount,1,'Cross-run pity did not advance eligibility');
assert.equal(misses.e.noEventStreak,0);
const noEvents=sim(0);
noEvents.step(3);
assert.equal(noEvents.e.noteRunEnded(),1);
noEvents.e.reset(5);
assert.equal(noEvents.e.noEventStreak,5);
noEvents.e.reset(40);
assert.equal(noEvents.e.noEventStreak,5,'Pity must be capped');
const aborted=sim();
aborted.step(20);assert.ok(aborted.e.inEvent);
aborted.e.abort();assert.equal(aborted.e.phase,'complete');
assert.equal(aborted.e.used,true);
assert.match(main,/flowTo\(GameState\.SPECIAL_MODE\)/);
assert.match(main,/flowTo\(GameState\.RECOVERY\)/);
assert.match(main,/flowTo\(GameState\.RUNNING\)/);
assert.match(main,/saveWorldEventPity\(worldEvents\.noteRunEnded\(\)\)/);
assert.doesNotMatch(main,/else if\(ownedGadgets\.length&&state==='playing'\)/);
assert.match(main,/if\(!worldEvents\.active\)/);
new Function(main);
console.log('PASS seven unique World Events, 8-12s active phase, pause/recovery gating, one-per-run, cross-run pity, state transitions and syntax');
