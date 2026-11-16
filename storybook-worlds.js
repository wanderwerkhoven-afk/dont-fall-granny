/* Storybook Worlds for the live HTML Canvas game. No Phaser/runtime dependency. */
(()=>{'use strict';
const NAMES=['De rustige buurt','Het stadspark','De grote stad','De woestijn','De nacht','De snoepwereld','De ruimte'];
const SIGNATURE=['Wandelaars langs de hekjes','Eenden en vallende bladeren','Neonwinkels en verkeer','Stofwolken en hittegolven','Vuurvliegjes en verlichte ramen','Zwevende snoepdeeltjes','Een grote planeet en sterrenvelden'];
const COLORS=['#c8e9df','#9ad7a3','#92a8cf','#f1bf87','#454268','#f1b5d9','#4c427b'];
const PI=Math.PI;
const wrap=(n,length)=>((n%length)+length)%length;
function draw(ctx,options){
 const {tier,travel,W,ground,elapsed,reducedMotion}=options;
 const zone=wrap(tier,7),animated=!reducedMotion,t=animated?elapsed:0;
 const pos=(step,factor,i,offset=0)=>i*step-wrap(travel*factor,step)+offset;
 function stroke(fill='#fff1d8',weight=3){ctx.fillStyle=fill;ctx.strokeStyle='#352b49';ctx.lineWidth=weight;ctx.lineJoin='round';}
 function box(x,y,w,h,r,c){stroke(c);ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();ctx.stroke();}
 function circle(x,y,r,c){stroke(c);ctx.beginPath();ctx.arc(x,y,r,0,2*PI);ctx.fill();ctx.stroke();}
 function path(points,c){stroke(c);ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();}
 ctx.save();ctx.beginPath();ctx.rect(0,0,W,ground);ctx.clip();
 const far=(fn,step=165)=>{for(let i=-2;i<Math.ceil(W/step)+3;i++)fn(pos(step,.05,i),i)};
 const mid=(fn,step=190)=>{for(let i=-2;i<Math.ceil(W/step)+3;i++)fn(pos(step,.12,i),i)};
 const near=(fn,step=145)=>{for(let i=-2;i<Math.ceil(W/step)+3;i++)fn(pos(step,.28,i),i)};
 const front=(fn,step=118)=>{for(let i=-2;i<Math.ceil(W/step)+3;i++)fn(pos(step,.65,i),i)};
 if(zone===0){
  far((x,i)=>box(x,ground-112-(i%3)*24,115,110+(i%3)*24,8,'#bad2cd'));
  mid((x,i)=>{box(x+8,ground-136,142,132,12,i%2?'#f5d1bd':'#fff0cf');path([[x,ground-133],[x+80,ground-190],[x+161,ground-133]],'#ad7793');box(x+31,ground-99,31,40,5,'#a8dce0');box(x+93,ground-99,31,40,5,'#a8dce0');});
  near((x,i)=>{circle(x+61,ground-77,32,i%2?'#80ae84':'#abc895');box(x+54,ground-50,12,55,6,'#a7786c');});
  front((x,i)=>{for(let p=0;p<2;p++)box(x+p*58,ground-46,12,48,4,'#fff2d2');box(x-6,ground-37,112,11,3,'#fff2d2');
   if(i%4===0){circle(x+43,ground-69,11,'#efbfa9');box(x+34,ground-58,19,22,6,'#d49fbe');}
   if(i%3===0){circle(x+94,ground-11,8,'#f6bb88');}});
 }
 if(zone===1){
  far((x,i)=>circle(x+75,ground-160,78,i%2?'#accd9a':'#8abc9e'));
  mid((x)=>{ctx.fillStyle='#80cbd0';ctx.beginPath();ctx.ellipse(x+70,ground-31,90,22,0,0,2*PI);ctx.fill();});
  near((x,i)=>{box(x+54,ground-84,12,88,6,'#956d67');circle(x+61,ground-99,42,i%2?'#4d9876':'#74b386');});
  front((x,i)=>{if(i%3===0){ctx.fillStyle='#ffe9c4';ctx.beginPath();ctx.ellipse(x+49,ground-15,22,12,0,0,2*PI);ctx.fill();circle(x+65,ground-25,9,'#ffe9c4');}
    const drift=animated?Math.sin(t*1.7+i)*8:0;circle(x+83+drift,ground-85-(i%3)*26,5,i%2?'#efbc6a':'#dfa17c');});
 }
 if(zone===2){
  far((x,i)=>box(x,ground-210-(i%3)*38,138,220+(i%3)*38,3,i%2?'#8493af':'#6c7d9d'));
  mid((x,i)=>{box(x,ground-112,155,111,8,i%2?'#e6a6b6':'#e6bd95');box(x+12,ground-105,131,28,6,'#f4d9ed');box(x+37,ground-98,79,15,3,'#b65c93');});
  near((x,i)=>{box(x,ground-40,96,32,12,i%2?'#ffd37b':'#7ab9d6');circle(x+21,ground-8,8,'#3b344b');circle(x+78,ground-8,8,'#3b344b');});
  front((x,i)=>{box(x+50,ground-97,7,99,3,'#68556d');circle(x+53,ground-104,14,'#ffecad');if(i%2===0)box(x+8,ground-25,31,24,5,'#848d9b');});
 }
 if(zone===3){
  far((x,i)=>{ctx.fillStyle=i%2?'#e8b179':'#e5a573';ctx.beginPath();ctx.ellipse(x+115,ground+35,150,115,0,PI,2*PI);ctx.fill();});
  mid((x,i)=>path([[x,ground],[x+95,ground-155-(i%2)*20],[x+185,ground]],'#ce9365'));
  near((x)=>{box(x+50,ground-79,19,81,9,'#7eac85');box(x+32,ground-61,20,15,7,'#7eac85');box(x+78,ground-55,19,15,7,'#7eac85');});
  front((x,i)=>{ctx.globalAlpha=.38;ctx.fillStyle='#f4d8a8';ctx.beginPath();ctx.ellipse(x+40+(animated?t*18%25:0),ground-17,54,13,0,0,2*PI);ctx.fill();ctx.globalAlpha=1;if(i%2===0)circle(x+80,ground-12,11,'#c68d6f');});
  // Heat-haze: faint drifting ribbons, disabled with reduced motion.
  if(animated){ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle='#fff5c5';for(let i=0;i<7;i++){const x=wrap(i*149+travel*.09,W);ctx.beginPath();ctx.moveTo(x,ground-130);ctx.bezierCurveTo(x+11,ground-153,x-12,ground-170,x+9,ground-190);ctx.stroke();}ctx.restore();}
 }
 if(zone===4){
  far((x,i)=>{ctx.fillStyle='#fcead6';ctx.fillRect(x+47,ground-178-(i%3)*36,3,3);});
  mid((x,i)=>{box(x+5,ground-116,149,113,9,i%2?'#5d547b':'#4f5276');for(let k=0;k<3;k++)box(x+21+k*37,ground-87,21,26,4,'#ffe5a0');});
  near((x)=>{box(x+59,ground-89,12,93,5,'#373956');circle(x+65,ground-96,35,'#595576');});
  front((x,i)=>{const y=ground-63-(i%4)*27+(animated?Math.sin(t*1.7+i)*7:0);ctx.fillStyle='#ffe487';ctx.beginPath();ctx.arc(x+55,y,3.5,0,2*PI);ctx.fill();});
 }
 if(zone===5){
  far((x,i)=>circle(x+76,ground-153,70,i%2?'#fce3ee':'#f2c9ee'));
  mid((x,i)=>{box(x+20,ground-133,118,133,18,i%2?'#e6add7':'#f1b3c7');box(x+24,ground-109,110,22,8,'#fff4dd');});
  near((x,i)=>{box(x+56,ground-93,12,91,5,'#fff2d8');circle(x+62,ground-105,31,i%2?'#ffc4ba':'#b2dacc');});
  front((x,i)=>{const y=ground-65-(i%4)*28+(animated?Math.sin(t+i)*9:0);circle(x+35,y,9,i%2?'#ffe0a1':'#e6a5d8');});
 }
 if(zone===6){
  far((x,i)=>{ctx.fillStyle='#fff1eb';ctx.fillRect(x+27,ground-213-(i%3)*32,3,3);});
  // Signature giant planet stays behind near scenery.
  circle(W*.76,ground*.32,Math.min(ground*.27,83),'#b5a1d9');
  ctx.save();ctx.strokeStyle='#f7dbb2';ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(W*.76,ground*.32,Math.min(ground*.32,105),27,-.3,0,2*PI);ctx.stroke();ctx.restore();
  mid((x,i)=>{if(i%3===0)circle(x+46,ground-180,26,'#888bbd');});
  near((x,i)=>path([[x+24,ground-45],[x+88,ground-91],[x+116,ground-19]],i%2?'#8b88b2':'#a6a0c5'));
  front((x,i)=>{const y=ground-80-(i%4)*25+(animated?Math.sin(t+i)*5:0);circle(x+51,y,6,'#d8c4ea');});
 }
 ctx.restore();
}
function installMap(getProgress,pause){
 const button=document.getElementById('worldMapButton');
 const modal=document.getElementById('worldMapModal');
 const close=document.getElementById('worldMapClose');
 const list=document.getElementById('worldMapRoute');
 const summary=document.getElementById('worldMapSummary');
 const bar=document.getElementById('worldMapProgress');
 if(!button||!modal||!close||!list)return;
 let previousFocus=null;
 function refresh(){
  const {score,best,currentTier,startTierOffset}=getProgress();
  const index=Math.min(6,Math.max(0,currentTier%7));
  const furthest=Math.min(6,Math.max(index,Math.floor(best/500),startTierOffset));
  const completed=Math.max(0,Math.min(3000,Math.max(best,score)));
  bar.style.width=(completed/3000*100).toFixed(2)+'%';
  summary.textContent='Deze run: '+Math.floor(score)+' m · Record: '+Math.floor(best)+' m';
  list.innerHTML=NAMES.map((name,i)=>{
    const unlocked=i<=furthest,active=i===index;
    return '<li class="world-map-stop'+(active?' is-current':'')+(unlocked?' is-unlocked':' is-locked')+'"><span class="world-map-marker">'+(active?'●':unlocked?'✓':'○')+'</span><div class="world-map-stop-copy"><strong>'+name+'</strong><span>'+SIGNATURE[i]+'</span></div><span class="world-map-distance">'+(i*500)+' m'+(active?' · HIER':'')+'</span></li>';
  }).join('');
 }
 function open(){
  if(modal.hidden===false)return;
  previousFocus=document.activeElement;
  if(getProgress().state==='playing')pause();
  refresh();modal.hidden=false;button.setAttribute('aria-expanded','true');close.focus();
 }
 function hide(){
  modal.hidden=true;button.setAttribute('aria-expanded','false');
  if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus();
 }
 button.addEventListener('click',open);close.addEventListener('click',hide);
 modal.addEventListener('click',event=>{if(event.target===modal)hide();});
 document.addEventListener('keydown',event=>{
  if(modal.hidden)return;
  if(event.key==='Escape'){event.preventDefault();hide();}
  if(event.key==='Tab'){
   const focusables=[close,...modal.querySelectorAll('button:not([disabled])')].filter((el,i,arr)=>arr.indexOf(el)===i);
   if(event.shiftKey&&document.activeElement===focusables[0]){event.preventDefault();focusables.at(-1).focus();}
   else if(!event.shiftKey&&document.activeElement===focusables.at(-1)){event.preventDefault();focusables[0].focus();}
  }
 },true);
}
window.GrannyStorybook={draw,installMap,NAMES,SIGNATURE,COLORS};
})();
