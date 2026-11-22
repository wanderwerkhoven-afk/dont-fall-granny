import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync('storybook-worlds.js','utf8');
const app=readFileSync('app.js','utf8');
assert.doesNotMatch(app,/const scroll=\(factor,spacing,offset=0\)/,'Legacy world modulo renderer must not return');
assert.match(app,/window\.GrannyStorybook\.draw\(ctx/,'Game must call one storybook renderer');
assert.match(code,/const first=Math\.floor\(displacement\/spacing\)-2/,'Strip uses absolute world coordinates');
assert.doesNotMatch(code,/const pos=\(step,factor/,'No per-object modulo position wrapping');
const window={};new Function('window',code)(window);
const drawer=window.GrannyStorybook.draw;
function scene(tier,travel,elapsed=3,reducedMotion=false){
 const rects=[],circles=[];
 const g={
  beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},clip(){},
  save(){},restore(){},arc(x,y,r){circles.push([x,y,r])},
  ellipse(){},rect(){},
  roundRect(x,y,w,h){rects.push([x,y,w,h])}
 };
 drawer(g,{tier,travel,W:900,ground:290,elapsed,reducedMotion});
 return {rects,circles};
}
// Match the same houses between frames: 40 world units = 4.8 px shift.
const before=scene(0,0),after=scene(0,40);
const houses=rows=>rows.rects.filter(v=>v[2]===146&&v[3]===128).map(v=>v[0]);
const a=houses(before),b=houses(after);
assert.ok(a.length>=2&&b.length>=2);
for(const x of a.filter(x=>x>0&&x<650)){
 assert.ok(b.some(y=>Math.abs(y-(x-40*.12))<.001),'House jumped instead of scrolling smoothly at '+x);
}
// All worlds render safely, including Reduced Motion, and never use Math.random.
for(let i=0;i<10;i++)for(const motion of [true,false]){
 const result=scene(i,1000,5,motion);
 assert.ok(result.rects.length+result.circles.length>0,'World '+i+' is empty');
}
assert.doesNotMatch(code,/Math\.random\(/);
console.log('PASS ten calm deterministic storybook worlds, stable house scrolling and Reduced Motion');
