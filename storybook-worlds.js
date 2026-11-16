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
function installMap(getProgress,pause,onSelect){
 const hudButton=document.getElementById('worldMapHudButton');
 const triggers=[hudButton].filter(Boolean);
 const allTriggers=()=>[document.getElementById('worldMapButton'),hudButton].filter(Boolean);
 const modal=document.getElementById('worldMapModal');
 const close=document.getElementById('worldMapClose');
 const list=document.getElementById('worldMapRoute');
 const summary=document.getElementById('worldMapSummary');
 const bar=document.getElementById('worldMapProgress');
 if(!hudButton||!modal||!close||!list)return;
 let previousFocus=null;
 function refresh(){
  const {score,best,currentTier,startTierOffset}=getProgress();
  const index=Math.min(6,Math.max(0,currentTier%7));
  const campaign=window.GrannyLevels?.getLevels()||[];
  const worlds=window.GrannyLevels?.getWorlds()||[];
  bar.style.width=(campaign.filter(l=>l.completed).length/49*100).toFixed(2)+'%';
  summary.textContent=campaign.filter(l=>l.completed).length+'/49 levels behaald · Deze run: '+Math.floor(score)+' m';
  const artwork=[
   '<rect x="7" y="57" width="126" height="44" rx="9" fill="#8ac58e"/><path d="M15 62V39L37 22L59 39V62Z" fill="#fbd2b4" stroke="#352b49" stroke-width="4"/><path d="M7 40L37 17L67 40" fill="none" stroke="#352b49" stroke-width="5" stroke-linejoin="round"/><rect x="28" y="43" width="16" height="19" rx="3" fill="#97cee0"/><path d="M77 62V33L103 16L126 33V62" fill="#ffe7c6" stroke="#352b49" stroke-width="4"/><path d="M70 35L103 12L133 35" fill="none" stroke="#352b49" stroke-width="5"/><path d="M8 78H134M20 70V92M53 70V92M86 70V92M119 70V92" stroke="#fff0da" stroke-width="6"/>',
   '<path d="M0 80Q35 51 75 77T150 74V103H0Z" fill="#7ebd95"/><path d="M19 85V43M113 83V40" stroke="#4b7354" stroke-width="8"/><circle cx="19" cy="33" r="25" fill="#6cae78" stroke="#352b49" stroke-width="4"/><circle cx="113" cy="34" r="28" fill="#94ca86" stroke="#352b49" stroke-width="4"/><ellipse cx="76" cy="90" rx="40" ry="11" fill="#88cbd4"/><ellipse cx="71" cy="84" rx="15" ry="9" fill="#fff6ce" stroke="#352b49" stroke-width="3"/><circle cx="83" cy="77" r="7" fill="#fff6ce"/><path d="M88 77L97 80L88 83" fill="#f8be66"/>',
   '<rect x="9" y="23" width="38" height="76" rx="4" fill="#8190b4" stroke="#352b49" stroke-width="4"/><rect x="51" y="9" width="40" height="91" rx="4" fill="#626f99" stroke="#352b49" stroke-width="4"/><rect x="95" y="33" width="40" height="66" rx="4" fill="#c28fae" stroke="#352b49" stroke-width="4"/><path d="M21 39H33M21 53H33M63 24H76M63 39H76M107 52H124" stroke="#ffe5a8" stroke-width="6"/><rect x="35" y="78" width="84" height="24" rx="9" fill="#f3bf73" stroke="#352b49" stroke-width="4"/><circle cx="51" cy="99" r="7" fill="#352b49"/><circle cx="101" cy="99" r="7" fill="#352b49"/>',
   '<circle cx="119" cy="24" r="17" fill="#ffedaa"/><path d="M0 80Q29 43 65 78Q105 28 150 78V103H0Z" fill="#d89c66"/><path d="M0 92Q48 63 85 93T150 88V104H0Z" fill="#e7ba7d"/><path d="M64 94V42M64 68H43V54M64 58H84V42" fill="none" stroke="#518668" stroke-width="10" stroke-linecap="round"/><path d="M15 98L29 84L42 98" fill="#c58e6c" stroke="#352b49" stroke-width="3"/>',
   '<rect x="0" y="67" width="150" height="37" fill="#3e3a63"/><circle cx="119" cy="25" r="19" fill="#fff1b9"/><path d="M12 69V45L36 27L60 45V69M75 69V38L105 20L136 38V69" fill="#595477" stroke="#2b274a" stroke-width="4"/><rect x="24" y="47" width="15" height="16" rx="3" fill="#ffd68e"/><rect x="96" y="43" width="14" height="18" rx="3" fill="#ffd68e"/><circle cx="16" cy="17" r="3" fill="#ffe28c"/><circle cx="72" cy="22" r="3" fill="#ffe28c"/><circle cx="128" cy="68" r="4" fill="#ffe28c"/>',
   '<path d="M0 84Q31 48 73 83T150 70V105H0Z" fill="#e8a4d0"/><rect x="17" y="47" width="47" height="56" rx="13" fill="#f4b0c1" stroke="#352b49" stroke-width="4"/><path d="M18 58H63M18 73H63" stroke="#fff0e2" stroke-width="8"/><path d="M107 97V54" stroke="#fff2da" stroke-width="8"/><circle cx="107" cy="39" r="23" fill="#ffb6d0" stroke="#352b49" stroke-width="4"/><path d="M96 31Q110 46 122 29" fill="none" stroke="#fff2da" stroke-width="6"/><circle cx="72" cy="20" r="7" fill="#ffdf9c"/>',
   '<circle cx="110" cy="42" r="37" fill="#a99acf" stroke="#352b49" stroke-width="4"/><ellipse cx="110" cy="42" rx="51" ry="14" transform="rotate(-22 110 42)" fill="none" stroke="#ffe6ba" stroke-width="6"/><circle cx="42" cy="27" r="9" fill="#fff5d7"/><path d="M23 90L42 58L62 90Z" fill="#78799f" stroke="#352b49" stroke-width="4"/><circle cx="22" cy="20" r="3" fill="#fff"/><circle cx="68" cy="12" r="3" fill="#fff"/><circle cx="132" cy="91" r="3" fill="#fff"/>'
  ];
  list.className='world-map-route world-map-illustrated';
  list.innerHTML='<svg class="world-map-winding-road" viewBox="0 0 100 1140" preserveAspectRatio="none" aria-hidden="true"><path d="M25 76 C82 126 81 185 56 230 S9 344 45 400 S87 509 56 563 S8 673 48 735 S86 858 51 919 S17 1039 70 1095" fill="none" stroke="#352b49" stroke-width="18" stroke-linecap="round"/><path d="M25 76 C82 126 81 185 56 230 S9 344 45 400 S87 509 56 563 S8 673 48 735 S86 858 51 919 S17 1039 70 1095" fill="none" stroke="#fff1cb" stroke-width="12" stroke-linecap="round" stroke-dasharray="3 3"/></svg>'+
  NAMES.map((name,i)=>{
    const world=worlds[i]||{levels:[],unlocked:i===0,completed:false,completedCount:0};
    const unlocked=world.unlocked,active=i===index,visited=world.completed;
    const art='<svg class="world-map-scene" viewBox="0 0 150 105" role="img" aria-label="'+name+' illustratie">'+artwork[i]+'</svg>';
    const status=active?'HIER BEN JE':visited?'WERELD BEHAALD':unlocked?'SPEELBAAR':'VERGRENDELD';
    const stages='<div class="world-map-level-grid" aria-label="Levels '+name+'">'+world.levels.map(l=>
      '<button type="button" class="world-map-level'+(l.completed?' is-done':'')+(l.index===window.GrannyLevels.getSelected()?' is-selected':'')+'" data-level="'+l.index+'" '+(!l.unlocked?'disabled aria-disabled="true"':'')+
      ' aria-label="'+name+', level '+l.number+', doel '+l.goal+' meter">'+
      '<b>'+(l.completed?'✓':l.number)+'</b><small>'+l.goal+' m</small></button>'
    ).join('')+'</div>';
    return '<li class="world-map-island world-map-zone-'+i+(active?' is-current':'')+(unlocked?' is-unlocked':' is-locked')+'"><div class="world-map-landscape">'+art+'<span class="world-map-step-number">'+(i+1)+'</span></div><div class="world-map-island-copy"><div class="world-map-island-status">'+status+'</div><strong>'+name+'</strong><small>'+SIGNATURE[i]+'</small><span class="world-map-meters">'+world.completedCount+' / 7 LEVELS</span></div>'+stages+(active?'<div class="world-map-granny-marker" aria-label="Granny is hier">OMA <span>●</span></div>':'')+'</li>';
  }).join('');
  list.querySelectorAll('[data-level]:not([disabled])').forEach(el=>el.addEventListener('click',()=>{
   const target=Number(el.dataset.level);
   if(onSelect?.(target)!==false)hide();
  }));
 }
 function open(){
  if(modal.hidden===false)return;
  previousFocus=document.activeElement;
  if(getProgress().state==='playing')pause();
  refresh();modal.hidden=false;allTriggers().forEach(el=>el.setAttribute('aria-expanded','true'));close.focus();
 }
 function hide(){
  modal.hidden=true;allTriggers().forEach(el=>el.setAttribute('aria-expanded','false'));
  if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus();
 }
 triggers.forEach(el=>el.addEventListener('click',open));
 const menuMapButton=document.getElementById('worldMapButton');
 menuMapButton?.addEventListener('click',open);
 document.getElementById('menuContent')?.addEventListener('click',event=>{
  if(event.target.closest('#worldMapButton'))open();
 });
 close.addEventListener('click',hide);
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
