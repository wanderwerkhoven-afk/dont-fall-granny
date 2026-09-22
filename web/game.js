(()=>{'use strict';
const canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d'),overlay=document.getElementById('overlay'),title=document.getElementById('overlayTitle'),text=document.getElementById('overlayText'),startBtn=document.getElementById('startBtn'),pauseBtn=document.getElementById('pauseBtn'),scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),statusEl=document.getElementById('status'),coinsEl=document.getElementById('coins'),shop=document.getElementById('shop'),reviveBtn=document.getElementById('reviveBtn'),boostBtn=document.getElementById('boostBtn');
const TIERS=[
 {name:'De rustige buurt',sky:['#c7e9ed','#e0f5e9','#eaf5dc'],hill:'#b7d8c6',near:'#c5ddc4',road:['#f6d7ae','#f7dfbd','#e8c69d'],building:'#c9dbcb',tree:'#a6cdb0',sun:'#ffe5a2',icon:'🏡'},
 {name:'Het stadspark',sky:['#9edbc8','#d6f4bb','#f3efc5'],hill:'#80ba8a',near:'#a3d293',road:['#d8bd9c','#f0d9b1','#c9a981'],building:'#a5c3a1',tree:'#4eaa75',sun:'#ffdb80',icon:'🌳'},
 {name:'De grote stad',sky:['#91b6df','#d1d6ec','#f4e2d7'],hill:'#a7b7cb',near:'#b7c3d4',road:['#b7afbd','#d6c9ce','#a99ea9'],building:'#7189ac',tree:'#668f96',sun:'#fff0b7',icon:'🏙️'},
 {name:'De woestijn',sky:['#f8ad77','#ffd2a0','#ffe8b5'],hill:'#dcaa72',near:'#efc88b',road:['#dca16d','#f3ca8c','#cb8b62'],building:'#c98d69',tree:'#aaaf70',sun:'#fff0a0',icon:'🌵'},
 {name:'De nacht',sky:['#20274f','#4e4479','#a37b99'],hill:'#575477',near:'#696287',road:['#756a85','#9c849b','#554e70'],building:'#424569',tree:'#4a6374',sun:'#fff5cb',icon:'🌙'},
 {name:'De snoepwereld',sky:['#e7b6e9','#ffd3e8','#fff0d0'],hill:'#d7a5cc',near:'#eac1d7',road:['#e5afbc','#f8d5c9','#ce98bd'],building:'#d5a7d8',tree:'#f2a5c5',sun:'#fff1b8',icon:'🍬'},
 {name:'De ruimte',sky:['#10152f','#26224d','#4b376e'],hill:'#443c73',near:'#62518b',road:['#71618c','#9b83ac','#50456e'],building:'#3e3c71',tree:'#7771b0',sun:'#f1e4ff',icon:'🚀'}
];
let currentTier=0,tierFlash=0,transition=0,previousTier=0,coins=0,coinsRun=0,coinItems=[],coinDistance=420,boostTime=0,revives=0;
let W=900,H=390,ground=313;const grandma={x:105,y:0,vy:0,w:43,h:70};let state='ready',score=0,best=0,shield=0,speed=270,obstacles=[],candies=[],particles=[],clouds=[{x:80,y:67,s:1},{x:410,y:110,s:.7},{x:740,y:52,s:1.15}],last=0,spawnDistance=0,nextDistance=450,candyDistance=1200,elapsed=0,invulnerable=0,walk=0,flash=0,travel=0,lastGap=0;
try{best=Number(localStorage.getItem('dont-trip-grandma-best'))||0;coins=Number(localStorage.getItem('dont-trip-grandma-coins'))||0}catch(e){}bestEl.textContent=best+' m';coinsEl.textContent='🪙 '+coins;
function resizeGame(){
 const oldW=W,oldGround=ground,wasGrounded=grandma.y>=oldGround-grandma.h-2;
 const mobile=window.matchMedia('(max-width:650px)').matches;
 W=mobile?560:900;
 const box=canvas.getBoundingClientRect();
 H=mobile?Math.max(390,Math.round(W*box.height/Math.max(1,box.width))):390;
 ground=mobile?Math.round(H*.53):313;
 canvas.width=W;canvas.height=H;
 grandma.x=mobile?67:105;
 if(wasGrounded)grandma.y=ground-grandma.h;
 else grandma.y+=ground-oldGround;
 for(const o of obstacles){o.x+=W-oldW;o.y=ground-o.h;o.chargeX=W-105}
 for(const c of candies){c.x+=W-oldW;c.y=ground-115}for(const c of coinItems){c.x+=W-oldW;c.y=ground-c.height}
 for(const c of clouds)c.x=c.x/oldW*W;
 render();
}
window.addEventListener('resize',resizeGame);

const types=[{id:'cat',name:'kat',w:54,h:38},{id:'dog',name:'hondje',w:57,h:39},{id:'plant',name:'geranium',w:43,h:55},{id:'sock',name:'sok',w:42,h:22},{id:'walker',name:'rollator',w:65,h:62},{id:'slipper',name:'pantoffel',w:47,h:25},{id:'basket',name:'breimand',w:48,h:40}];
const zoneTypes=[
 ['cat','dog','plant','sock','walker','slipper','basket'],
 ['dog','plant','basket','cat','log','mushroom'],
 ['car','cone','bike','pigeon','cat','dog','bin'],
 ['cactus','scorpion','rock','tumble'],
 ['bat','ghost','pumpkin','cat'],
 ['candybox','lollipop','donut','gum'],
 ['asteroid','alien','satellite','moonrock']
];
const extras=[
 {id:'log',w:57,h:35,emoji:'🪵'},{id:'mushroom',w:43,h:44,emoji:'🍄'},
 {id:'car',w:91,h:49},{id:'cone',w:42,h:52,emoji:'🚧'},{id:'bike',w:62,h:58,emoji:'🚲'},{id:'pigeon',w:43,h:34,emoji:'🐦'},{id:'bin',w:43,h:52,emoji:'🗑️'},
 {id:'cactus',w:46,h:58,emoji:'🌵'},{id:'scorpion',w:46,h:30,emoji:'🦂'},{id:'rock',w:48,h:34,emoji:'🪨'},{id:'tumble',w:46,h:39,emoji:'🌾'},
 {id:'bat',w:46,h:35,emoji:'🦇'},{id:'ghost',w:45,h:52,emoji:'👻'},{id:'pumpkin',w:48,h:44,emoji:'🎃'},
 {id:'candybox',w:45,h:42,emoji:'🍫'},{id:'lollipop',w:42,h:57,emoji:'🍭'},{id:'donut',w:46,h:42,emoji:'🍩'},{id:'gum',w:44,h:36,emoji:'🧁'},
 {id:'asteroid',w:47,h:44,emoji:'☄️'},{id:'alien',w:47,h:48,emoji:'👾'},{id:'satellite',w:54,h:52,emoji:'🛰️'},{id:'moonrock',w:49,h:37,emoji:'🪨'}
];
const allTypes=[...types,...extras];
function saveCoins(){if(typeof menuWallet!=='undefined')menuWallet.textContent='🪙 '+coins+' munten';coinsEl.textContent='🪙 '+coins;try{localStorage.setItem('dont-trip-grandma-coins',coins)}catch(e){}}
const clothing=[
 {id:'classic',name:'Klassieke oma',cost:0,color:'#ad78a4',hair:'#e6e4e3'},
 {id:'red',name:'Rode jas',cost:12,color:'#e35d67',hair:'#e6e4e3'},
 {id:'sport',name:'Sportieve oma',cost:20,color:'#3e8db7',hair:'#f0e9d5'},
 {id:'gold',name:'Gouden outfit',cost:40,color:'#edb74c',hair:'#fff3d0'},
 {id:'night',name:'Nachtloper',cost:55,color:'#6250a5',hair:'#b4c4ec'},
 {id:'mint',name:'Mintgroen',cost:28,color:'#4eb79b',hair:'#f3e9e1'}
];
const gadgets=[
 {id:'plane',name:'Vliegtuig',cost:45,description:'Zeldzame vlucht · tik om te fladderen · 9 sec.'},
 {id:'booster',name:'Raketbooster',cost:35,description:'Zeldzame turbo-run · ontwijk met ↑ en ↓ · 8 sec.'}
];
let ownedClothes=['classic'],selectedClothes='classic',ownedGadgets=[],vehicle=null,vehicleTime=0,vehicleCooldown=24,vehicleLane=1,vehicleVelocity=0,vehicleSpawnWait=25,menuPage='home';
try{ownedClothes=JSON.parse(localStorage.getItem('grandma-clothes'))||['classic'];selectedClothes=localStorage.getItem('grandma-outfit')||'classic';ownedGadgets=JSON.parse(localStorage.getItem('grandma-gadgets'))||[]}catch(e){}
function saveInventory(){try{localStorage.setItem('grandma-clothes',JSON.stringify(ownedClothes));localStorage.setItem('grandma-outfit',selectedClothes);localStorage.setItem('grandma-gadgets',JSON.stringify(ownedGadgets))}catch(e){}}
const menuContent=document.getElementById('menuContent'),menuWallet=document.getElementById('menuWallet'),menuTabs=document.getElementById('menuTabs'),countdown=document.getElementById('countdown');
const GAME_OVER_SECONDS=10;let deathDeadline=0,deathTimerFrame=0;
function stopDeathTimer(){deathDeadline=0;if(deathTimerFrame)cancelAnimationFrame(deathTimerFrame);deathTimerFrame=0;overlay.classList.remove('gameover');overlay.style.removeProperty('--timer-angle')}
function tickDeathTimer(){if(state!=='over'||!deathDeadline)return;const remaining=Math.max(0,(deathDeadline-performance.now())/1000);overlay.style.setProperty('--timer-angle',(remaining/GAME_OVER_SECONDS*360)+'deg');countdown.textContent='⏳ Nog '+Math.ceil(remaining)+' seconden om verder te gaan';if(remaining<=0){returnHome();return}deathTimerFrame=requestAnimationFrame(tickDeathTimer)}
function returnHome(){stopDeathTimer();state='ready';reset();showMenu('home');title.textContent='Oma gaat wandelen!';text.textContent='Spring over hindernissen, verzamel munten en ontdek nieuwe gebieden.';startBtn.textContent='Start het spel →';overlay.classList.remove('hidden');render()}

function showMenu(page='home'){
 menuPage=page;overlay.classList.toggle('storepage',page!=='home');
 menuWallet.textContent='🪙 '+coins+' munten';
 menuTabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
 if(page==='home'){menuContent.innerHTML='<p style="font-weight:800;margin:7px 0">Ren, verzamel munten en ontgrendel oma’s outfits en zeldzame voertuigen.</p>';return}
 const items=page==='clothes'?clothing:gadgets;
 menuContent.innerHTML='<div class="store-grid">'+items.map(item=>{
 const owned=page==='clothes'?ownedClothes.includes(item.id):ownedGadgets.includes(item.id);
 const selected=page==='clothes'&&selectedClothes===item.id;
 const symbol=page==='clothes'?`<svg viewBox="0 0 64 64" width="58" height="58"><circle cx="32" cy="18" r="13" fill="#f1c8aa" stroke="#392d44" stroke-width="2"/><path d="M15 33 Q32 24 49 33 L53 58 L11 58Z" fill="${item.color}" stroke="#392d44" stroke-width="3"/><path d="M19 15 Q30 0 46 15" stroke="${item.hair}" stroke-width="9" fill="none"/></svg>`:(item.id==='plane'?'✈️':'🚀');
 return `<div class="store-item"><div class="preview">${symbol}</div><b>${item.name}</b><small>${item.description||'Een nieuwe look voor oma'}</small><button data-buy="${item.id}" ${selected||(!owned&&coins<item.cost)?'disabled':''}>${selected?'✓ Aangetrokken':owned?(page==='clothes'?'Aantrekken':'✓ Gekocht'):'🪙 '+item.cost}</button></div>`
 }).join('')+'</div>';
 menuContent.querySelectorAll('[data-buy]').forEach(btn=>btn.addEventListener('click',()=>{
 const item=items.find(x=>x.id===btn.dataset.buy);if(!item)return;
 if(page==='clothes'){if(!ownedClothes.includes(item.id)){if(coins<item.cost)return;coins-=item.cost;ownedClothes.push(item.id)}selectedClothes=item.id}
 else if(!ownedGadgets.includes(item.id)){if(coins<item.cost)return;coins-=item.cost;ownedGadgets.push(item.id)}
 saveCoins();saveInventory();showMenu(page);
 }));
}
menuTabs.addEventListener('click',e=>{const btn=e.target.closest('[data-page]');if(btn)showMenu(btn.dataset.page)});
function random(a,b){return a+Math.random()*(b-a)}function reset(){vehicle=null;vehicleTime=0;vehicleSpawnWait=25;vehicleCooldown=25;vehicleLane=1;vehicleVelocity=0;currentTier=0;previousTier=0;transition=0;tierFlash=0;score=0;coinsRun=0;revives=0;boostTime=0;coinItems=[];coinDistance=420;shop.style.display='none';shield=0;speed=245;travel=0;lastGap=0;obstacles=[];candies=[];particles=[];grandma.y=ground-grandma.h;grandma.vy=0;spawnDistance=0;nextDistance=520;candyDistance=1100;elapsed=0;invulnerable=0;flash=0;scoreEl.textContent='0 m';statusEl.textContent='Pak snoepjes om een beschermschild te verdienen.';pauseBtn.textContent='⏸ Pauze'}
function start(){stopDeathTimer();showMenu('home');reset();state='playing';overlay.classList.add('hidden');last=performance.now();requestAnimationFrame(frame)}function end(){
 state='over';showMenu('home');overlay.classList.add('gameover');deathDeadline=performance.now()+GAME_OVER_SECONDS*1000;deathTimerFrame=requestAnimationFrame(tickDeathTimer);if(score>best){best=score;bestEl.textContent=best+' m';try{localStorage.setItem('dont-trip-grandma-best',best)}catch(e){}}
 title.textContent='Oei, oma struikelt!';
 text.textContent=`${score} meter afgelegd · ${coinsRun} munten verzameld. Je hebt 10 seconden om een extra leven of boost te kiezen.`;
 reviveBtn.disabled=coins<10;boostBtn.disabled=coins<6;
 shop.style.display='flex';startBtn.textContent='← Terug naar beginscherm';overlay.classList.remove('hidden');pauseBtn.textContent='⏸ Pauze'
}
function revive(boost=false){
 const cost=boost?6:10;if(state!=='over'||coins<cost||performance.now()>=deathDeadline){if(state==='over'&&performance.now()>=deathDeadline)returnHome();return;}stopDeathTimer();
 coins-=cost;saveCoins();revives++;
 obstacles=obstacles.filter(o=>o.x<grandma.x-100||o.x>grandma.x+260);
 grandma.y=ground-grandma.h;grandma.vy=0;
 invulnerable=boost?6:3.5;boostTime=boost?6:0;
 state='playing';shop.style.display='none';overlay.classList.add('hidden');
 statusEl.textContent=boost?'⚡ Turbo: 6 seconden bescherming en extra meters!':'❤️ Extra leven: 3,5 seconden bescherming!';
 last=performance.now();requestAnimationFrame(frame);
}
reviveBtn.addEventListener('click',()=>revive(false));
boostBtn.addEventListener('click',()=>revive(true));
function pause(){if(state==='playing'){showMenu('home');state='paused';title.textContent='Even uitrusten ☕';text.textContent='Oma neemt een korte pauze.';startBtn.textContent='Verder wandelen →';overlay.classList.remove('hidden');pauseBtn.textContent='▶ Hervat'}else if(state==='paused'){state='playing';overlay.classList.add('hidden');pauseBtn.textContent='⏸ Pauze';last=performance.now();requestAnimationFrame(frame)}}function jump(){if(vehicle==='plane'){vehicleVelocity=-420;return}if(vehicle==='booster'){vehicleLane=Math.max(0,vehicleLane-1);return}if(state==='over')return;if(state==='ready'){start();return}if(state==='paused'){pause();return}if(grandma.y>=ground-grandma.h-1){grandma.vy=-690;grandma.y-=1}}function activate(){if(state==='over')returnHome();else if(state==='paused')pause();else start()}
startBtn.addEventListener('click',activate);pauseBtn.addEventListener('click',pause);canvas.addEventListener('pointerdown',e=>{e.preventDefault();jump()});document.getElementById('jumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();jump()});document.addEventListener('keydown',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!e.repeat)jump()}else if(['ArrowDown','KeyS'].includes(e.code)&&vehicle==='booster'){e.preventDefault();vehicleLane=Math.min(2,vehicleLane+1)}else if(e.code==='KeyP'){e.preventDefault();pause()}});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});
function rectHit(a,b,pad=5){return a.x+pad<b.x+b.w-pad&&a.x+a.w-pad>b.x+pad&&a.y+pad<b.y+b.h-pad&&a.y+a.h-pad>b.y+pad}
function puff(x,y,color){for(let i=0;i<Math.ceil(W/100)+5;i++)particles.push({x,y,vx:random(-120,120),vy:random(-170,-30),life:random(.35,.75),color})}
function update(dt){elapsed+=dt;walk+=dt*11;speed=245+elapsed*2.15+Math.max(0,elapsed-35)*.65;travel+=speed*dt;score=Math.floor(travel/14);scoreEl.textContent=score+' m';boostTime=Math.max(0,boostTime-dt);
 if(vehicle){vehicleTime-=dt;
  if(vehicle==='plane'){vehicleVelocity+=1050*dt;grandma.y=Math.max(ground-260,Math.min(ground-grandma.h,grandma.y+vehicleVelocity*dt))}
  else{grandma.y=ground-grandma.h-(2-vehicleLane)*38}
  if(vehicleTime<=0){vehicle=null;grandma.y=ground-grandma.h;grandma.vy=0;invulnerable=2;vehicleSpawnWait=random(38,68);statusEl.textContent='Oma is weer te voet!'}
 }else if(ownedGadgets.length&&state==='playing'){
  vehicleSpawnWait-=dt;
  if(vehicleSpawnWait<=0){vehicle=ownedGadgets[Math.floor(Math.random()*ownedGadgets.length)];vehicleTime=vehicle==='plane'?9:8;vehicleLane=1;vehicleVelocity=-240;invulnerable=vehicleTime+1;obstacles=[];statusEl.textContent=vehicle==='plane'?'✈️ Vliegtuig! Tik om te fladderen.':'🚀 Booster! Tik om van baan te wisselen, ↓ om terug te gaan.'}
 }

 const newTier=Math.floor(score/500);
 if(newTier!==currentTier){previousTier=currentTier;currentTier=newTier;transition=2.8;tierFlash=3.3;puff(W*.65,ground-110,'#fff3a0');}
 tierFlash=Math.max(0,tierFlash-dt);transition=Math.max(0,transition-dt);
 if(!vehicle){grandma.vy+=1850*dt;grandma.y=Math.min(ground-grandma.h,grandma.y+grandma.vy*dt);if(grandma.y>=ground-grandma.h)grandma.vy=0;}invulnerable=Math.max(0,invulnerable-dt);flash=Math.max(0,flash-dt);for(const c of clouds){c.x-=speed*.045*dt;if(c.x< -110)c.x=W+80}
spawnDistance+=speed*dt;candyDistance-=speed*dt;coinDistance-=speed*dt;
// Elke hindernis heeft een eigen tempo. Een kat kondigt zijn sprint eerst aan
// en versnelt daarna richting oma; het gat wordt op basis van die sprint bewaakt.
if(!vehicle&&spawnDistance>=nextDistance){
  const pool=allTypes.filter(t=>zoneTypes[currentTier%zoneTypes.length].includes(t.id)&&(elapsed>12||t.id!=='walker'));
  const type=(pool.length?pool:types)[Math.floor(Math.random()*(pool.length?pool:types).length)];
  const attacking=(type.id==='cat'&&Math.random()<.55)||(type.id==='car'&&Math.random()<.72);
  const multiplier=attacking?(type.id==='car'?1.95:1.62):1;
  obstacles.push({type,x:W+8,y:ground-type.h,w:type.w,h:type.h,attacking,
    chargeX:W-(type.id==='car'?175:105),charging:false,multiplier,hit:false});
  spawnDistance=0;
  // Afwisseling: soms dicht op elkaar, soms een ruim herstelmoment.
  // Het minimum groeit mee met de snelheid en de sprongduur.
  const close=Math.random()<.43;
  const flightTime=2*690/1850;
  const minimum=speed*(flightTime+.42)+105;
  nextDistance=minimum+(close?random(0,75):random(100,230));
  lastGap=nextDistance;
}
if(coinDistance<=0){
 const count=Math.random()<.35?5:3;
 const height=random(68,115);
 for(let i=0;i<count;i++)coinItems.push({x:W+35+i*43,y:ground-height-Math.sin(i/(count-1)*Math.PI)*25,height:height+Math.sin(i/(count-1)*Math.PI)*25,t:0,taken:false});
 coinDistance=random(1000,1700);
}
if(candyDistance<=0){candies.push({x:W+40,y:ground-115,w:29,h:29,t:0});candyDistance=random(1550,2350)}
for(const c of coinItems){c.x-=speed*dt;c.t+=dt}coinItems=coinItems.filter(c=>c.x>-35&&!c.taken);
for(const o of obstacles){
  if(o.attacking&&!o.charging&&o.x<=o.chargeX)o.charging=true;
  o.x-=speed*(o.charging?o.multiplier:1)*dt;
}for(const c of candies){c.x-=speed*dt;c.t+=dt}obstacles=obstacles.filter(o=>o.x+o.w>-30);candies=candies.filter(c=>c.x+c.w>-30);for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
const body={x:grandma.x+7,y:grandma.y+7,w:grandma.w-13,h:grandma.h-9};for(const o of obstacles){if(!vehicle&&!o.hit&&rectHit(body,{x:o.x+3,y:o.y+3,w:o.w-6,h:o.h-3},7)){o.hit=true;if(invulnerable>0||boostTime>0)continue;if(shield){shield=0;invulnerable=1.25;flash=.6;puff(grandma.x+25,grandma.y+25,'#ffcc65');statusEl.textContent='🍬 Snoepje gebruikt! Je bent weer kwetsbaar.'}else{puff(grandma.x+20,grandma.y+25,'#e88999');end();return}}}for(const c of candies){if(!c.taken&&rectHit(body,{x:c.x,y:c.y+Math.sin(c.t*5)*6,w:c.w,h:c.h},0)){c.taken=true;shield=1;puff(c.x,c.y,'#e89acc');statusEl.textContent='🍬 Snoepje gepakt! Eén botsing wordt opgevangen.'}}candies=candies.filter(c=>!c.taken);
for(const c of coinItems){if(rectHit(body,{x:c.x-10,y:c.y-12,w:24,h:24},0)){c.taken=true;coins++;coinsRun++;saveCoins();puff(c.x,c.y,'#ffcf49')}}
coinItems=coinItems.filter(c=>!c.taken);
}
function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}function line(x1,y1,x2,y2,color,width=3){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}function label(s,x,y,size=28){ctx.font=`${size}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,x,y)}
function background(tierIndex=currentTier){
 const zone=tierIndex%7,tier=TIERS[zone];
 const sky=ctx.createLinearGradient(0,0,0,ground);
 tier.sky.forEach((color,i)=>sky.addColorStop(i/2,color));
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // Wrap a whole strip, not each individual tile: otherwise every object stacks at x=0.
 const scroll=(factor,spacing,offset=0)=>{
  const strip=spacing*(Math.ceil(W/spacing)+4);
  return ((offset-travel*factor)%strip+strip)%strip-spacing;
 };
 const shape=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()};
 const hill=(color,offset,depth)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,ground);for(let x=0;x<=W+15;x+=15)ctx.lineTo(x,ground-depth-Math.sin((x+offset)/125)*depth*.32-Math.cos((x+offset)/61)*depth*.12);ctx.lineTo(W,ground);ctx.fill()};
 const building=(x,y,w,h,body,roof)=>{rounded(x,y,w,h,2,body);shape([[x-7,y],[x+w/2,y-25],[x+w+7,y]],roof);for(let j=0;j<2;j++)for(let k=0;k<2;k++)rounded(x+9+j*(w-23),y+12+k*24,9,12,1,'#fff3cb')};
 const pine=(x,y,size)=>{line(x,y,x,y-size*.85,'#6a6c58',5);for(let i=0;i<3;i++)shape([[x-size*.33+i*3,y-size*(.27+i*.2)],[x,y-size*(.88+i*.12)],[x+size*.33-i*3,y-size*(.27+i*.2)]],i%2?'#397b65':'#4d9674')};
 const cactus=(x,y,size)=>{line(x,y,x,y-size,'#478b62',size*.17);line(x,y-size*.45,x-size*.28,y-size*.45,'#478b62',size*.14);line(x-size*.28,y-size*.45,x-size*.28,y-size*.72,'#478b62',size*.14);line(x,y-size*.62,x+size*.26,y-size*.62,'#478b62',size*.14);line(x+size*.26,y-size*.62,x+size*.26,y-size*.87,'#478b62',size*.14)};
 const star=(x,y,r=2)=>{ellipse(x,y,r,r,'#fff4ce')};
 if(zone===0){
  ellipse(W*.78,ground*.25,35,35,'#ffe3a1');
  hill('#c2dbcd',travel*.06,125);hill('#a8d1b8',travel*.13,67);
  for(let i=-1;i<Math.ceil(W/100)+5;i++){let x=scroll(.22,140,i*140)-70;building(x,ground-105,62,100,i%2?'#d7b9a2':'#a9c9c1','#a16f73')}
  for(let i=-1;i<Math.ceil(W/95)+5;i++){let x=scroll(.47,95,i*95)-45;ellipse(x,ground-36,21,38,'#83b69b');line(x,ground,x,ground-40,'#71977d',4)}
 }else if(zone===1){
  ellipse(W*.8,ground*.21,36,36,'#fff2a4');hill('#a6d4a0',travel*.06,140);hill('#79bb91',travel*.14,76);
  for(let i=-1;i<Math.ceil(W/100)+5;i++){let x=scroll(.35,120,i*120)-55;pine(x,ground-20,85+(i%3)*18)}
  for(let i=-1;i<Math.ceil(W/95)+5;i++){let x=scroll(.68,100,i*100)-40;line(x,ground,x,ground-47,'#6d9773',5);ellipse(x,ground-60,27,38,'#4e9e78');ellipse(x+12,ground-48,20,30,'#75bf83')}
 }else if(zone===2){
  hill('#b9c9d8',travel*.04,58);
  for(let i=-1;i<Math.ceil(W/95)+5;i++){let x=scroll(.13,100,i*100)-50,h=100+(i*43)%105;rounded(x,ground-h,76,h,0,i%2?'#8197b6':'#9dabc2');for(let j=0;j<3;j++)for(let k=0;k<5;k++)rounded(x+11+j*20,ground-h+13+k*19,9,11,0,'#fce4a4')}
  for(let i=-1;i<Math.ceil(W/100)+5;i++){let x=scroll(.5,145,i*145)-70;rounded(x,ground-67,96,67,3,i%2?'#cf9b8d':'#b7a4b2');rounded(x+22,ground-45,17,20,1,'#fff0c4');rounded(x+58,ground-45,17,20,1,'#fff0c4')}
  for(let i=-1;i<Math.ceil(W/100)+5;i++){let x=scroll(.76,120,i*120)-60;line(x,ground,x,ground-83,'#666c82',5);ellipse(x,ground-85,12,13,'#fff1bd')}
 }else if(zone===3){
  ellipse(W*.78,ground*.24,42,42,'#fff1a2');hill('#e8aa6c',travel*.05,138);hill('#d89560',travel*.13,74);
  for(let i=-1;i<Math.ceil(W/100)+5;i++){let x=scroll(.28,145,i*145)-70;shape([[x,ground-46],[x+50,ground-145-(i%3)*18],[x+108,ground-46]],'#c88157')}
  for(let i=-1;i<Math.ceil(W/95)+5;i++){let x=scroll(.62,116,i*116)-50;cactus(x,ground,56+(i%3)*17)}
 }else if(zone===4){
  ellipse(W*.8,ground*.19,38,38,'#f6e9c8');
  for(let i=0;i<54;i++){let x=(i*137+19)%W,y=(i*73+13)%Math.max(100,ground-90);star(x,y,1.2+Math.sin(elapsed*2+i)*.55)}
  hill('#4e4775',travel*.07,140);hill('#342d58',travel*.19,70);
  for(let i=-1;i<Math.ceil(W/100)+5;i++){let x=scroll(.38,125,i*125)-60;shape([[x,ground],[x+25,ground-94],[x+60,ground]],'#272a4e');rounded(x+22,ground-46,12,19,1,'#ffcf81')}
  for(let i=-1;i<Math.ceil(W/95)+5;i++){let x=scroll(.66,105,i*105)-50;line(x,ground,x,ground-54,'#332f53',5);ellipse(x,ground-67,23,29,'#65547f')}
 }else if(zone===5){
  ellipse(W*.78,ground*.2,36,36,'#fff1be');hill('#e9b7d6',travel*.07,124);hill('#d7a3c9',travel*.15,67);
  for(let i=-1;i<Math.ceil(W/100)+5;i++){let x=scroll(.3,138,i*138)-70;rounded(x,ground-92,66,92,8,i%2?'#f2b4cb':'#d8a2db');rounded(x+6,ground-85,54,17,6,'#fff3dd');rounded(x+10,ground-47,46,12,6,'#fff3dd')}
  for(let i=-1;i<Math.ceil(W/95)+5;i++){let x=scroll(.63,112,i*112)-55;line(x,ground,x,ground-74,'#fff3dc',7);ellipse(x,ground-88,22,24,i%2?'#f8a7bd':'#bda5f0');ellipse(x,ground-88,12,13,'#fff0c6')}
 }else{
  for(let i=0;i<65;i++){let x=(i*127+21)%W,y=(i*79+31)%Math.max(100,ground-75);star(x,y,1+Math.sin(elapsed*2+i)*.7)}
  ellipse(W*.77,ground*.24,48,48,'#c9b8e5');ellipse(W*.75,ground*.22,10,10,'#9e8dbd');ellipse(W*.8,ground*.28,8,8,'#9e8dbd');
  hill('#433969',travel*.08,100);hill('#635185',travel*.2,50);
  for(let i=-1;i<Math.ceil(W/100)+5;i++){let x=scroll(.4,145,i*145)-70;rounded(x,ground-82,75,82,20,'#9287b7');rounded(x+12,ground-67,51,32,15,'#bde2ed');ellipse(x+19,ground-12,7,7,'#c4c0e6');ellipse(x+55,ground-12,7,7,'#c4c0e6')}
 }
 // Ground belongs to the current zone too; pavement is synced to world travel.
 const road=ctx.createLinearGradient(0,ground,0,H);
 tier.road.forEach((color,i)=>road.addColorStop(i/2,color));
 ctx.fillStyle=road;ctx.fillRect(0,ground,W,H-ground);
 ctx.fillStyle=zone===4||zone===6?'#28223f':'#493e49';ctx.fillRect(0,ground,W,5);
 const depth=H-ground;
 ctx.save();ctx.beginPath();ctx.rect(0,ground,W,depth);ctx.clip();
 for(let row=0;row<6;row++){
  const top=ground+depth*row/6;
  const bottom=ground+depth*(row+1)/6;
  ctx.strokeStyle=zone===4||zone===6?'#b0a4cb55':'#9e786355';ctx.lineWidth=1.25;
  ctx.beginPath();ctx.moveTo(0,bottom);ctx.lineTo(W,bottom);ctx.stroke();
  const spacing=140+row*17;
  const shift=((travel%spacing)+spacing)%spacing;
  for(let x=-spacing*2-shift+(row%2)*spacing/2;x<W+spacing;x+=spacing){
   ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();
  }
 }
 // Road markings follow exactly the same world distance as obstacles.
 const spacing=125,shift=((travel%spacing)+spacing)%spacing;
 for(let x=-spacing-shift;x<W+spacing;x+=spacing)
  rounded(x,ground+29,43,4,2,zone===4||zone===6?'#d5c6e3':'#edbb94');
 ctx.restore();
}
function drawGrandma(){const outfit=clothing.find(c=>c.id===selectedClothes)||clothing[0];const x=grandma.x,y=grandma.y,bob=grandma.vy===0?Math.sin(walk)*2:0;if(shield){ctx.strokeStyle='#f5a1d0';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x+23,y+35,36,48,0,0,Math.PI*2);ctx.stroke();label('✦',x+51,y-6,20)}if(invulnerable>0&&!vehicle&&Math.floor(invulnerable*12)%2===0)return;ellipse(x+23,ground+1,24,5,'#bda887');line(x+16,y+52+bob,x+12+(grandma.vy===0?Math.sin(walk)*5:0),y+68,'#493e49',6);line(x+31,y+52+bob,x+34-(grandma.vy===0?Math.sin(walk)*5:0),y+68,'#493e49',6);rounded(x+3,y+27+bob,40,34,13,outfit.color);rounded(x+7,y+27+bob,32,25,10,outfit.color);line(x+8,y+36+bob,x-1,y+50+bob,'#efc6a8',7);line(x+38,y+35+bob,x+47,y+47+bob,'#efc6a8',7);ellipse(x+23,y+16+bob,19,20,'#efc6a8');ellipse(x+20,y+0+bob,21,10,outfit.hair);ellipse(x+6,y+11+bob,7,12,outfit.hair);ellipse(x+37,y+10+bob,7,12,outfit.hair);ellipse(x+39,y+2+bob,8,9,outfit.hair);rounded(x+10,y+14+bob,27,9,4,'#493e49');rounded(x+12,y+15+bob,10,7,3,'#e9f4ee');rounded(x+25,y+15+bob,10,7,3,'#e9f4ee');line(x+21,y+18+bob,x+25,y+18+bob,'#493e49',2);ellipse(x+24,y+27+bob,5,2,'#a86f77');
 if(vehicle==='plane'){ctx.save();ctx.translate(x-37,y+37);rounded(0,0,128,24,12,'#d8e9f0');rounded(40,-17,44,20,8,'#6ea4c6');rounded(18,13,87,11,5,'#e49b60');ellipse(10,10,11,11,'#f6cb69');ctx.restore()}
 if(vehicle==='booster'){ctx.save();ctx.translate(x-20,y+35);rounded(0,0,86,30,12,'#6655a5');rounded(9,5,68,13,6,'#a2bce1');ellipse(5,15,10,10,'#33364e');ellipse(82,15,10,10,'#33364e');for(let i=0;i<3;i++)line(-8-i*13,10,0-i*13,20,'#f6b353',4);ctx.restore()}
 }
function drawObstacle(o){
 const x=o.x,y=o.y,t=o.type.id,w=o.w,h=o.h;
 const bounce=Math.sin(walk*2.5)*1.7;
 ctx.save();ctx.translate(x,y);
 ellipse(w/2,h+3,w*.44,4,'#a58c7955');
 const R=(x,y,w,h,r,c)=>rounded(x,y,w,h,r,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c),L=(x,y,xx,yy,c,z=3)=>line(x,y,xx,yy,c,z);
 const polygon=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.fill()};
 const wheel=(cx,cy,r=8)=>{E(cx,cy,r,r,'#333746');E(cx,cy,r*.53,r*.53,'#c4cbd4');E(cx,cy,r*.2,r*.2,'#586375')};
 if(t==='car'){
   // A bespoke compact car: animated wheels, headlamp, windshield and warning.
   if(o.charging){for(let i=0;i<3;i++)L(w+6+i*10,12+i*7,w+19+i*10,12+i*7,'#f7e5b0',2)}
   R(5,17,w-10,24,8,'#d85861');polygon([[17,18],[29,4],[65,4],[78,18]],'#ee7780');
   polygon([[33,7],[60,7],[69,17],[24,17]],'#9fdaeb');
   L(47,7,47,17,'#526b80',2);R(8,23,8,9,3,'#fff4b5');R(w-14,23,7,9,3,'#f9b36c');
   R(13,36,w-26,5,2,'#903b51');wheel(23,40,9);wheel(w-22,40,9);
   if(o.attacking&&!o.charging){R(26,-28,42,22,7,'#fff3d7');ctx.fillStyle='#9e3945';ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.fillText('!',47,-11)}
 }else if(t==='cat'||t==='dog'){
   const cat=t==='cat',fur=cat?'#d18a55':'#bd9878',dark=cat?'#86523e':'#795a4d';
   ctx.translate(0,o.charging?bounce:0);
   E(w*.47,h*.65,w*.31,h*.28,fur);E(w*.72,h*.43,w*.2,h*.24,fur);
   if(cat){polygon([[w*.59,h*.31],[w*.63,1],[w*.76,h*.24]],fur);polygon([[w*.76,h*.24],[w*.9,1],[w*.91,h*.4]],fur)}
   else{E(w*.82,h*.28,8,13,dark);E(w*.57,h*.3,7,13,dark)}
   for(let i=0;i<4;i++)L(13+i*9,h*.73,10+i*9,h-1,dark,4);
   ctx.strokeStyle=fur;ctx.lineWidth=6;ctx.beginPath();ctx.arc(10,h*.49,11,1.8,5.4);ctx.stroke();
   E(w*.67,h*.41,2,2,'#292c36');E(w*.82,h*.41,2,2,'#292c36');E(w*.78,h*.55,3,2,'#493e49');
   if(cat){for(let i=-1;i<=1;i++){L(w*.78,h*.56,w*.98,h*.55+i*5,dark,1);L(w*.74,h*.56,w*.55,h*.55+i*5,dark,1)}}
   if(o.attacking&&!o.charging){R(w*.3,-24,27,21,7,'#fff4dc');ctx.fillStyle='#b94f54';ctx.font='900 18px system-ui';ctx.fillText('!',w*.53,-8)}
   if(o.charging)for(let i=0;i<3;i++)L(w+4+i*9,12+i*8,w+16+i*9,12+i*8,'#f6e8b7',2);
 }else if(t==='cone'){
   polygon([[4,h-4],[w/2,2],[w-4,h-4]],'#f18749');polygon([[11,h-17],[w/2,h-29],[w-11,h-17]],'#fff5df');R(0,h-7,w,7,2,'#555769');
 }else if(t==='bike'){
   wheel(13,h-11,11);wheel(w-12,h-11,11);L(13,h-11,29,h-34,'#4e8da3',4);L(29,h-34,w-12,h-11,'#4e8da3',4);L(13,h-11,39,h-11,'#4e8da3',4);L(39,h-11,29,h-34,'#4e8da3',4);L(29,h-34,29,h-41,'#41455b',3);L(w-12,h-11,w-19,h-45,'#41455b',3);L(w-19,h-45,w-5,h-45,'#41455b',3);
 }else if(t==='plant'||t==='cactus'){
   if(t==='plant'){R(9,h-27,w-18,25,4,'#b66e56');R(6,h-30,w-12,7,2,'#874c43');for(let i=0;i<5;i++){L(w/2,h-28,8+i*7,10+(i%2)*8,'#488c66',3);E(8+i*7,11+(i%2)*8,8,7,i%2?'#d84c83':'#f1a0b4');E(8+i*7,11+(i%2)*8,3,3,'#ffe2a1')}}
   else{L(w/2,h-2,w/2,6,'#458d62',11);L(w/2,h*.53,9,h*.53,'#458d62',8);L(9,h*.53,9,h*.3,'#458d62',8);L(w/2,h*.4,w-9,h*.4,'#458d62',8);L(w-9,h*.4,w-9,h*.22,'#458d62',8)}
 }else if(t==='walker'){
   for(let i of [10,w-10]){L(i,5,i,h-9,'#6b8192',5);wheel(i,h-7,6)}L(10,14,w-10,14,'#6b8192',5);L(10,h*.63,w-10,h*.63,'#6b8192',4);L(7,5,20,5,'#444759',6);L(w-20,5,w-7,5,'#444759',6);
 }else if(t==='log'||t==='rock'||t==='moonrock'||t==='asteroid'){
   if(t==='log'){R(4,10,w-8,h-13,9,'#94634a');E(10,h*.55,7,12,'#c18b63');E(10,h*.55,3,7,'#9c654d');for(let i=0;i<3;i++)L(24+i*9,14,31+i*9,26,'#754b3c',2)}
   else{polygon([[1,h-3],[8,15],[w*.48,2],[w-4,17],[w,h-3]],t==='asteroid'?'#8b7089':'#a48f83');E(w*.5,h*.53,5,3,'#776c71');E(w*.74,h*.73,4,3,'#776c71')}
 }else if(t==='mushroom'||t==='pumpkin'||t==='donut'){
   if(t==='mushroom'){R(w*.36,h*.36,w*.28,h*.62,5,'#f6dfb7');E(w/2,h*.38,w*.47,h*.35,'#cf6174');for(let i=0;i<3;i++)E(10+i*11,14,3,3,'#fff2dc')}
   else if(t==='pumpkin'){E(w/2,h*.6,w*.46,h*.37,'#e98245');L(w/2,h*.3,w/2+3,h*.1,'#61845c',5);polygon([[12,25],[19,19],[23,26]],'#523e44');polygon([[27,26],[33,19],[38,26]],'#523e44')}
   else{E(w/2,h/2,w*.44,h*.45,'#b46c55');E(w/2,h/2,w*.39,h*.4,'#f4a3bb');E(w/2,h/2,w*.16,h*.17,'#b46c55');for(let i=0;i<7;i++)R(8+i*5,10+(i%3)*7,5,2,1,'#fff3a8')}
 }else if(t==='lollipop'||t==='candybox'||t==='gum'){
   if(t==='lollipop'){L(w/2,h*.4,w/2,h-2,'#fff4e5',6);E(w/2,h*.34,18,18,'#e988ad');E(w/2,h*.34,12,12,'#f5d98e');E(w/2,h*.34,6,6,'#a58cd1')}
   else{R(4,7,w-8,h-9,6,t==='gum'?'#a8c7e7':'#b879b5');R(8,13,w-16,10,3,'#fff0d0');R(8,27,w-16,6,2,'#f5a4b6')}
 }else if(t==='bin'){R(6,10,w-12,h-12,4,'#6b93a1');R(2,5,w-4,9,3,'#456b79');for(let i=0;i<3;i++)L(14+i*9,19,14+i*9,h-8,'#a5c4c5',2);wheel(12,h-5,4);wheel(w-12,h-5,4)}
 else if(t==='scorpion'){E(w*.5,h*.64,15,9,'#a96b54');E(w*.8,h*.6,7,7,'#a96b54');for(let i=0;i<3;i++){L(13+i*9,19,8+i*10,h-1,'#8c594a',3);L(13+i*9,19,9+i*10,5,'#8c594a',3)}L(7,17,4,2,'#8c594a',4)}
 else if(t==='tumble'){for(let i=0;i<9;i++){const ang=i*Math.PI/4.5;L(w/2,h/2,w/2+Math.cos(ang)*19,h/2+Math.sin(ang)*17,'#aa8d56',3)}E(w/2,h/2,10,9,'#d2b46f')}
 else if(t==='pigeon'||t==='bat'){E(w*.48,h*.55,17,10,t==='bat'?'#59466c':'#8899ae');polygon([[12,18],[2,5],[22,14]],t==='bat'?'#59466c':'#a3b0c2');polygon([[28,18],[w-2,5],[w-15,19]],t==='bat'?'#59466c':'#a3b0c2');E(w*.76,h*.43,6,6,'#778ba1');E(w*.8,h*.4,2,2,'#fff');polygon([[w-6,18],[w,22],[w-6,25]],'#e7b56d')}
 else if(t==='ghost'){E(w/2,h*.4,w*.43,h*.4,'#f5edf7');R(3,h*.4,w-6,h*.48,4,'#f5edf7');E(16,h*.42,3,5,'#555070');E(29,h*.42,3,5,'#555070')}
 else if(t==='alien'){R(4,12,w-8,h-15,10,'#8dcb9b');E(15,25,5,7,'#3e5364');E(w-15,25,5,7,'#3e5364');L(w/2,12,w/2,3,'#8dcb9b',3);E(w/2,3,4,4,'#f4d28d')}
 else if(t==='satellite'){R(18,12,w-36,h-19,5,'#a5b7c9');R(1,8,16,h-15,2,'#5e8ca8');R(w-17,8,16,h-15,2,'#5e8ca8');for(let i=0;i<3;i++){L(5,14+i*10,13,14+i*10,'#d0e7f0',1);L(w-13,14+i*10,w-5,14+i*10,'#d0e7f0',1)}}
 else if(t==='sock'||t==='slipper'){polygon([[7,3],[w*.48,3],[w*.48,h*.58],[w-3,h*.58],[w-3,h-2],[8,h-2]],t==='sock'?'#f3e9dc':'#b47d83');R(8,3,w*.4,5,2,'#d58a9a')}
 else if(t==='basket'){R(3,15,w-6,h-17,7,'#bb865b');for(let i=0;i<4;i++)L(10+i*9,18,10+i*9,h-4,'#e6bd86',2);for(let i=0;i<3;i++)E(13+i*11,13,10,9,['#e6a5bf','#9c8dc4','#e5d2a4'][i])}
 // Crisp foreground silhouette helps obstacles separate from the scenery.
 ctx.strokeStyle='#342b3e';ctx.lineWidth=2.4;ctx.lineJoin='round';
 ctx.strokeRect(2,h-3,w-4,2);
 ctx.restore();
}
function drawCandy(c){const y=c.y+Math.sin(c.t*5)*6;label('🍬',c.x+15,y+14,29)}
function render(){
 if(transition>0){
  background(previousTier);
  ctx.save();ctx.globalAlpha=1-transition/2.8;background(currentTier);ctx.restore();
 }else background();

 const tier=TIERS[currentTier%TIERS.length];
 // Tier is painted inside the world, rather than outside the game frame.
 ctx.save();ctx.textAlign='center';
 ctx.font='900 23px system-ui';ctx.fillStyle=(currentTier===4||currentTier>=6)?'#fff':'#493e49';
 ctx.globalAlpha=.82;
 ctx.fillText(`TIER ${currentTier+1}`,W/2,Math.max(108,ground*.35));
 ctx.font='800 15px system-ui';ctx.fillText(tier.name.toUpperCase(),W/2,Math.max(132,ground*.35+23));
 ctx.restore();
 if(tierFlash>0){
  const alpha=Math.min(1,tierFlash/0.4,(3.3-tierFlash)/0.3);
  ctx.save();ctx.globalAlpha=Math.max(0,alpha);
  rounded(W*.1,ground*.38,W*.8,110,22,'#fffaf2');
  ctx.textAlign='center';ctx.fillStyle='#493e49';
  ctx.font='900 32px system-ui';ctx.fillText(`TIER ${currentTier+1}`,W/2,ground*.38+47);
  ctx.font='800 19px system-ui';ctx.fillText(tier.name,W/2,ground*.38+80);
  ctx.restore();
 }
for(const c of coinItems){
 ctx.save();ctx.translate(c.x,c.y);ctx.rotate(Math.sin(c.t*7)*.12);
 ellipse(0,0,12,12,'#f8ad2c');ellipse(0,0,9,9,'#ffe17a');
 ctx.fillStyle='#a76b1c';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 13px system-ui';ctx.fillText('€',0,1);ctx.restore();
}
for(const c of candies)drawCandy(c);for(const o of obstacles)drawObstacle(o);drawGrandma();for(const p of particles)ellipse(p.x,p.y,4,4,p.color);if(boostTime>0){rounded(18,57,175,32,10,'#fff2b6');ctx.fillStyle='#493e49';ctx.font='bold 15px system-ui';ctx.fillText('⚡ Turbo '+Math.ceil(boostTime)+'s',29,79)}if(shield){rounded(18,17,169,35,12,'#fffaf2');ctx.fillStyle='#493e49';ctx.font='bold 17px system-ui';ctx.textAlign='left';ctx.fillText('🍬 Schild actief',30,41)}if(flash>0){ctx.fillStyle=`rgba(255,220,140,${flash*.3})`;ctx.fillRect(0,0,W,H)}}
function frame(now){if(state!=='playing')return;const dt=Math.min((now-last)/1000,.035);last=now;update(dt);render();if(state==='playing')requestAnimationFrame(frame)}reset();showMenu('home');resizeGame();requestAnimationFrame(resizeGame);
})();
