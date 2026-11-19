import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('danger-soundscape.js','utf8');
const app=readFileSync('app.js','utf8');
const scope={};new Function('window',source)(scope);
const {timeToContact,timeToModeContact,MIN_LEAD,MAX_LEAD,classify,DangerSoundscape,DangerAudioDirector}=scope.GrannyDangerSoundscape;
assert.equal(MIN_LEAD,.4);assert.equal(MAX_LEAD,.9);
const granny={x:100,w:46,h:70};
const contact=granny.x+granny.w-13;
const obstacle=(gap,options={})=>({
 type:{id:'cat'},x:contact+gap-3,y:200,w:35,h:30,
 attacking:false,charging:false,multiplier:1,hit:false,...options
});
for(const speed of [180,260,420,620]){
 for(const lead of [.4,.6,.9]){
  const o=obstacle(speed*lead);
  assert.ok(Math.abs(timeToContact(o,granny,speed)-lead)<1e-9,'time-to-contact mismatch');
 }
}
const charging=obstacle(300,{attacking:true,multiplier:2,chargeX:contact+150-3});
const expected=150/300+150/(300*2);
assert.ok(Math.abs(timeToContact(charging,granny,300)-expected)<1e-9,
 'Charging cat/car must account for acceleration at the real charge point');
charging.charging=true;
assert.ok(Math.abs(timeToContact(charging,granny,300)-.5)<1e-9);
assert.equal(timeToContact(obstacle(-1),granny,250),Infinity);
assert.equal(timeToContact(obstacle(250,{hit:true}),granny,250),Infinity);
assert.equal(classify({type:{id:'car'}}).id,'vehicle');
assert.equal(classify({type:{id:'cat'}}).id,'animal');
assert.equal(classify({type:{id:'walker'}}).id,'pedestrian');
const scooterSpeed=.43+10*.0015;
const scooterHazard={lane:1,z:.1+scooterSpeed*.7,kind:'car'};
assert.ok(Math.abs(timeToModeContact(scooterHazard,{vehicle:'booster',granny,speed:300,lane:1,elapsed:10})-.7)<1e-9);
assert.equal(timeToModeContact(scooterHazard,{vehicle:'booster',granny,speed:300,lane:0,elapsed:10}),Infinity);
const planeClosing=Math.max(260,300*.86);
const planeObstacle={x:granny.x+granny.w-7+planeClosing*.65,top:30,gap:100,w:60};
assert.ok(Math.abs(timeToModeContact(planeObstacle,{vehicle:'plane',granny:{...granny,y:110},speed:300,lane:1,velocity:0})-.65)<1e-8);
const specialDirector=new DangerSoundscape();
const specialOptions={state:'playing',controllerState:'special_mode',vehicle:'booster',
 worldEventActive:true,modeObstacles:[scooterHazard],granny,speed:300,vehicleLane:1,elapsed:10};
assert.equal(specialDirector.update(specialOptions).first,true);
assert.equal(specialDirector.update({...specialOptions,vehicleLane:0}),null,'No scooter warning for safe lane');
assert.equal(specialDirector.update({...specialOptions,worldEventActive:false}),null,'No danger during event intro/outro');
const director=new DangerSoundscape();
const obj=obstacle(200);
const opts={obstacles:[obj],granny,speed:250,state:'playing',controllerState:'running'};
const first=director.update(opts);
assert.equal(first.first,true);
assert.ok(first.eta>=MIN_LEAD&&first.eta<=MAX_LEAD);
assert.equal(director.update(opts).first,false,'Hazard must not emit repeated sounds');
assert.equal(director.count,1);
for(const invalid of [
 {controllerState:'recovery'},
 {controllerState:'special_mode',vehicle:'plane'},
 {controllerState:'paused',paused:true},
 {state:'over'},
 {recovery:true}
]){
 assert.equal(director.update({...opts,...invalid}),null,'Warnings must stop in non-running state');
 assert.equal(director.visible,null);
}
assert.equal(director.update(opts).first,false,'A resume must not replay same hazard');
const second=obstacle(175);
assert.equal(director.update({...opts,obstacles:[second]}).first,true);
assert.equal(director.count,2);
director.reset();
assert.equal(director.count,0);
assert.equal(director.update(opts).first,true);
const audio=new DangerAudioDirector({});
assert.doesNotThrow(()=>audio.warning(classify(obj)));
assert.doesNotThrow(()=>audio.effect('coin'));
audio.stop();
assert.match(app,/function updateDangerWarnings\(/);
assert.match(app,/updateDangerWarnings\(\);\s*for\(const c of candies\)/);
assert.match(app,/audioDirector\.musicTick\(/);
assert.match(app,/function clearDangerWarnings\(/);
assert.match(app,/data-toggle-setting="music"/);
assert.match(app,/data-toggle-setting="sfx"/);
assert.match(app,/data-toggle-setting="visualWarnings"/);
assert.match(app,/grandma-meta-v1/);
new Function(app);
console.log('PASS Danger Soundscape: 400–900 ms moving hazards, charging acceleration, no duplicate cues, state gating and independent preferences');
