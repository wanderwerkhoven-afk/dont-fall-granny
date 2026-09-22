import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const path = 'index.html';
let html = readFileSync(path, 'utf8');
const replaceOnce = (oldText, newText, label) => {
  assert(html.includes(oldText), `Cannot locate ${label}: upstream V11 changed`);
  assert.equal(html.split(oldText).length, 2, `${label}: expected one match`);
  html = html.replace(oldText, newText);
};

// The game prevents touch gestures by default; give the scrollable overlay priority.
replaceOnce('#overlay.clothespage .panel{\n  scrollbar-width:none;', '#overlay.clothespage .panel{\n  touch-action:pan-y;\n  scrollbar-width:none;', 'clothing touch scroll');
replaceOnce('#overlay.storepage .panel{\n    overflow-y:auto;', '#overlay.storepage .panel{\n    touch-action:pan-y;\n    overflow-y:auto;', 'desktop store touch scroll');

// Keep the original asset and spritesheet geometry. Only change how its frames are animated.
const oldAnimation = `const clothesRail=document.getElementById('clothesScrollRail'),clothesHanger=document.getElementById('clothesHanger'),menuPanel=overlay.querySelector('.panel');
let hangerTargetY=0,hangerCurrentY=0,hangerScrollImpulse=0,hangerLastScrollTop=0,hangerFrame=2,hangerAnimationStarted=false;
function hangerFrameSize(){return window.matchMedia('(max-width:650px)').matches?84:96}
function setHangerFrame(frame){
 if(!clothesHanger)return;
 const size=hangerFrameSize();
 clothesHanger.style.backgroundPosition=(-frame*size)+'px 0';
}
function syncClothesHanger(){
 if(menuPage!=='clothes'||!clothesRail||!clothesHanger||!menuPanel)return;
 const scrollMax=Math.max(0,menuPanel.scrollHeight-menuPanel.clientHeight);
 const progress=scrollMax?menuPanel.scrollTop/scrollMax:0;
 const travel=Math.max(0,clothesRail.clientHeight-clothesHanger.offsetHeight);
 hangerTargetY=travel*progress;
 const delta=menuPanel.scrollTop-hangerLastScrollTop;
 hangerLastScrollTop=menuPanel.scrollTop;
 hangerScrollImpulse=Math.max(-18,Math.min(18,hangerScrollImpulse+delta*.7));
}
function animateClothesHanger(now){
 if(menuPage==='clothes'&&clothesRail&&clothesHanger&&menuPanel){
  hangerCurrentY+=(hangerTargetY-hangerCurrentY)*.18;
  hangerScrollImpulse*=.88;
  const active=Math.abs(hangerScrollImpulse)>.35;
  const idle=Math.sin(now/420);
  const targetFrame=active
   ?Math.max(0,Math.min(5,Math.round(2.5+hangerScrollImpulse*.16)))
   :Math.max(1,Math.min(4,Math.round(2.5+idle*1.25)));
  if(targetFrame!==hangerFrame){hangerFrame=targetFrame;setHangerFrame(hangerFrame)}
  const tilt=active?Math.max(-5,Math.min(5,hangerScrollImpulse*.22)):idle*1.4;
  clothesHanger.style.transform='translateY('+hangerCurrentY+'px) rotate('+tilt+'deg)';
 }
 requestAnimationFrame(animateClothesHanger);
}
menuPanel.addEventListener('scroll',syncClothesHanger,{passive:true});
window.addEventListener('resize',()=>{syncClothesHanger();setHangerFrame(hangerFrame)});
if(!hangerAnimationStarted){hangerAnimationStarted=true;requestAnimationFrame(animateClothesHanger)}
setHangerFrame(hangerFrame);`;
const newAnimation = `const clothesRail=document.getElementById('clothesScrollRail'),clothesHanger=document.getElementById('clothesHanger'),menuPanel=overlay.querySelector('.panel');
const hangerReduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let hangerTargetY=0,hangerCurrentY=0,hangerScrollImpulse=0,hangerLastScrollTop=0,hangerFrame=2,hangerLastFrameTime=0;
let hangerRaf=0;
function hangerFrameSize(){return window.matchMedia('(max-width:650px)').matches?84:96}
function setHangerFrame(frame){
 if(!clothesHanger)return;
 const size=hangerFrameSize();
 clothesHanger.style.backgroundPosition=(-frame*size)+'px 0';
}
function syncClothesHanger(){
 if(menuPage!=='clothes'||!clothesRail||!clothesHanger||!menuPanel)return;
 const scrollMax=Math.max(0,menuPanel.scrollHeight-menuPanel.clientHeight);
 const progress=scrollMax?menuPanel.scrollTop/scrollMax:0;
 const travel=Math.max(0,clothesRail.clientHeight-clothesHanger.offsetHeight);
 hangerTargetY=travel*progress;
 const delta=menuPanel.scrollTop-hangerLastScrollTop;
 hangerLastScrollTop=menuPanel.scrollTop;
 hangerScrollImpulse=Math.max(-18,Math.min(18,hangerScrollImpulse+delta*.7));
 if(hangerReduceMotion.matches){
  hangerCurrentY=hangerTargetY;
  clothesHanger.style.transform='translateY('+hangerCurrentY+'px)';
  setHangerFrame(2);
 }
}
function animateClothesHanger(now){
 hangerRaf=0;
 if(menuPage!=='clothes'||document.hidden||hangerReduceMotion.matches)return;
 hangerCurrentY+=(hangerTargetY-hangerCurrentY)*.18;
 hangerScrollImpulse*=.88;
 const active=Math.abs(hangerScrollImpulse)>.35;
 const idle=Math.sin(now/650);
 const targetFrame=active
  ?Math.max(0,Math.min(5,Math.round(2.5+hangerScrollImpulse*.16)))
  :Math.max(1,Math.min(4,Math.round(2.5+idle*.85)));
 if(targetFrame!==hangerFrame&&now-hangerLastFrameTime>110){
  hangerFrame=targetFrame;
  hangerLastFrameTime=now;
  setHangerFrame(hangerFrame);
 }
 const tilt=active?Math.max(-5,Math.min(5,hangerScrollImpulse*.22)):idle*.9;
 clothesHanger.style.transform='translateY('+hangerCurrentY+'px) rotate('+tilt+'deg)';
 hangerRaf=requestAnimationFrame(animateClothesHanger);
}
function refreshHangerAnimation(){
 if(hangerRaf){cancelAnimationFrame(hangerRaf);hangerRaf=0}
 if(menuPage!=='clothes'||document.hidden)return;
 syncClothesHanger();
 if(hangerReduceMotion.matches)return;
 hangerRaf=requestAnimationFrame(animateClothesHanger);
}
menuPanel.addEventListener('scroll',syncClothesHanger,{passive:true});
window.addEventListener('resize',()=>{syncClothesHanger();setHangerFrame(hangerFrame)});
document.addEventListener('visibilitychange',refreshHangerAnimation);
hangerReduceMotion.addEventListener?.('change',refreshHangerAnimation);
setHangerFrame(hangerFrame);`;
replaceOnce(oldAnimation, newAnimation, 'hanger animation');
replaceOnce(' requestAnimationFrame(syncClothesHanger);\n}', ' requestAnimationFrame(()=>{syncClothesHanger();refreshHangerAnimation()});\n}', 'menu render hanger refresh');

// Restoring position after a purchase prevents a frustrating jump back to the first outfit.
replaceOnce(' saveCoins();saveInventory();showMenu(page);\n }));', ' const previousScroll=menuPanel.scrollTop;\n saveCoins();saveInventory();showMenu(page);\n if(page===\'clothes\'||page===\'gadgets\'){menuPanel.scrollTop=previousScroll;requestAnimationFrame(syncClothesHanger)}\n }));', 'store purchase scroll retention');
writeFileSync(path, html);
console.log('Applied targeted V11 hanger/scroll fixes; game mechanics unchanged.');
