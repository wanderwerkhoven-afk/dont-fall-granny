import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const cameraSource=readFileSync('storybook-camera.js','utf8');
const storySource=readFileSync('storybook-worlds.js','utf8');
const game=readFileSync('app.js','utf8');
new Function(cameraSource);new Function(storySource);new Function(game);
const w={};new Function('window',cameraSource)(w);
const Camera=w.GrannyStorybookCamera.StorybookCamera;
const defaults={state:'playing',width:900,reducedMotion:false,transition:0,
 airborne:false,jumpHeight:0,threatDistance:400,vehicle:null};
const a=new Camera(),b=new Camera();
for(let i=0;i<120;i++){
 const opts={...defaults,airborne:i>=15&&i<55,jumpHeight:i>=15&&i<55?80:0,transition:i>65&&i<110?2.8-(i-65)/40*2.8:0};
 const left=a.step(1/60,opts),right=b.step(1/60,opts);
 assert.deepEqual(left,right,'Camera is deterministic and reproducible by fixed timestep');
 assert.ok(Math.abs(left.y)<=5.500001&&Math.abs(left.parallaxX)<=4.500001);
 assert.ok(Math.abs(left.parallaxY)<=3.000001);
}
const base=new Camera(),calm=new Camera(),guarded=new Camera();
for(let i=0;i<50;i++){
 base.step(1/60,{...defaults,airborne:true,jumpHeight:100});
 calm.step(1/60,{...defaults,airborne:true,jumpHeight:100,width:560});
 guarded.step(1/60,{...defaults,airborne:true,jumpHeight:100,threatDistance:35});
}
assert.ok(base.frame().y<0,'A jumping Granny is framed upwards');
assert.ok(Math.abs(calm.frame().y)<=3.5,'Portrait framing remains extra subtle');
assert.ok(guarded.frame().y>base.frame().y,'Near hazards suppress the camera jump');
const stopped=base.step(1/60,{...defaults,reducedMotion:true});
assert.deepEqual(stopped,{y:0,parallaxX:0,parallaxY:0});
for(let i=0;i<45;i++)assert.deepEqual(base.step(1/60,{...defaults,reducedMotion:true}),stopped);
const special=new Camera();
for(let i=0;i<90;i++)special.step(1/60,{...defaults,vehicle:'plane'});
assert.ok(Math.abs(special.frame().y)<.001,'Vehicle HUD and flying gameplay must remain visually stable');
assert.ok(Math.abs(special.frame().parallaxX)<.001);
assert.match(game,/storybookCamera\.step\(dt/);
assert.match(game,/camera:storybookCamera\.frame\(\),reducedMotion/);
assert.match(game,/ctx\.translate\(0,cameraFrame\.y\)/);
assert.match(game,/const visibleHazard=obstacles\.reduce/);
assert.match(storySource,/cameraX\*factor\*2/);
assert.doesNotMatch(cameraSource,/Math\.random\(/);
assert.match(readFileSync('index.html','utf8'),/storybook-camera\.js\?v=51/);
console.log('PASS deterministic camera framing, hazard visibility, portrait bounds, Reduced Motion, stable vehicles and layered parallax');
