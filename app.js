(()=>{'use strict';
const META=window.GrannyMeta||{version:'V.1.2.0.0',achievements:[],missionPool:[],weeklyPool:[],unlocks:[],cosmetics:[],worldRules:[],tieredAchievements:[],difficultyModes:{},rankLevels:[],worldChallenges:[],collectionSets:[]};
const PROG=window.GrannyProgression||{};
const WORLD_MASTERY=window.GrannyWorldMastery;
const LEVELS=window.GrannyLevels;
const grandmaExpressions=new window.GrannyExpressions.GrannyExpressionController();
const worldEvents=new window.GrannyWorldEvents.WorldEventDirector();
const replay=new window.GrannyReplay.ReplayEngine();
let pendingReplayTape=null,replayAccumulator=0,replayInitialOutfit=null,replayEconomySnapshot=null,replayStepping=false;
let replayLevelCompleted=new Set();
replay.ghostEnabled=(()=>{try{return localStorage.getItem(window.GrannyReplay.GHOST_KEY)==='true'}catch(e){return false}})();
const previousReplay=replay.restore(localStorage);
if(previousReplay)replay.setGhost(previousReplay);
function replayFrame(){
 return {t:replay.tick,x:Math.round(grandma.x*100)/100,
  y:Math.round(grandma.y*100)/100,vy:Math.round(grandma.vy*100)/100,score,world:currentTier,
  lane:vehicleLane,mode:vehicle||'run'};
}
function applyReplayInput(action){
 if(action==='jump')jump();
 else if(action==='left')steerScooter(-1);
 else if(action==='right')steerScooter(1);
}
function finishReplayRecording(){
 if(replay.mode!=='record')return;
 const tape=replay.finish({score,distance:score,elapsed:Math.round(elapsed*1000)/1000,
  state,world:currentTier,reason:daily.finished?daily.reason:'fall'});
 replay.save(localStorage,tape);replay.setGhost(tape);
 replay.mode='recorded';
}
function beginReplayCapture(tape){
 if(tape){
  replayEconomySnapshot={coins,best,meta:JSON.parse(JSON.stringify(metaState))};
  replay.load(tape);replayLevelCompleted=new Set(tape.start.completedLevels||[]);
 }else{
  replay.newRecording({
   activeLevel,world:currentTier,difficulty:metaState.settings.difficulty,
   outfit:selectedClothes,ownedGadgets:[...ownedGadgets],pity:getWorldEventPity(),
   dailyDate:daily.active?daily.config.date:null,
   worldWidth:W,worldHeight:H,ground,grandmaX:grandma.x,
   completedLevels:LEVELS.getLevels().filter(x=>x.completed).map(x=>x.index)
  },daily.active?daily.config.seed:undefined);
 }
}
function forceReplayDimensions(){
 if(!replay.tape||!['playback','record'].includes(replay.mode))return;
 const st=replay.tape.start;
 W=st.worldWidth;H=st.worldHeight;ground=st.ground;grandma.x=st.grandmaX;
 if(state==='ready'&&replay.tick===0)grandma.y=ground-grandma.h;
 if(canvas.width!==W)canvas.width=W;
 if(canvas.height!==H)canvas.height=H;
}
function drawReplayGhost(){
 const snap=replay.ghostAt(replay.tick);
 if(!snap||snap.mode!=='run'||vehicle||snap.world!==currentTier)return;
 // Render the real Granny artwork instead of a generic oval. Ghost snapshots
 // never touch collision or physics; every visual state is restored immediately.
 const prev={x:grandma.x,y:grandma.y,vy:grandma.vy,shield,invulnerable,
  outfit:selectedClothes,expression:grandmaExpressions.current};
 const dx=Math.max(-70,Math.min(80,(snap.score-score)*.22));
 try{
  grandma.x=prev.x+dx;grandma.y=snap.y;grandma.vy=snap.vy||0;
  shield=0;invulnerable=0;
  selectedClothes=replay.ghostTape?.start?.outfit||prev.outfit;
  ctx.save();ctx.globalAlpha=.29;ctx.filter='hue-rotate(148deg) saturate(.6)';
  drawGrandma();
  ctx.restore();
 }finally{
  grandma.x=prev.x;grandma.y=prev.y;grandma.vy=prev.vy;shield=prev.shield;
  invulnerable=prev.invulnerable;selectedClothes=prev.outfit;
  grandmaExpressions.current=prev.expression;
 }
}

const daily=new window.GrannyDaily.DailyChallenge();
let pendingDaily=false,dailyLastResult=null;
const WORLD_EVENT_PITY_KEY='dont-trip-grandma-world-event-pity';
function getWorldEventPity(){try{return Math.max(0,Math.min(5,Number(localStorage.getItem(WORLD_EVENT_PITY_KEY))||0))}catch(e){return 0}}
function saveWorldEventPity(value){if(replay.mode==='playback')return;try{localStorage.setItem(WORLD_EVENT_PITY_KEY,String(Math.max(0,Math.min(5,value))))}catch(e){}}
const APP_VERSION=META.version;
const appVersionEl=document.getElementById('appVersion');
if(appVersionEl)appVersionEl.textContent=APP_VERSION;
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
let levelStartScore=0,lastLevelCelebrated=-1,activeLevel=0;
let combo=0,comboPeak=0,perfectRun=0,safeRun=0,nearMissRun=0,landingPulse=0,rewardPopups=[],tutorialActive=false,tutorialStep=-1,runFinalized=false,perfectRunAlive=true,comebackTime=0,magnetTime=0,comboBurstTime=0,worldEventTime=0,worldEventCooldown=18,challengeTime=0,challengeTier=-1,startTierOffset=0,lastMasteryScore=0;
let W=900,H=390,ground=313;const grandma={x:105,y:0,vy:0,w:43,h:70};let state='ready',score=0,best=0,shield=0,speed=270,obstacles=[],candies=[],particles=[],clouds=[{x:80,y:67,s:1},{x:410,y:110,s:.7},{x:740,y:52,s:1.15}],last=0,spawnDistance=0,nextDistance=450,candyDistance=1200,elapsed=0,invulnerable=0,walk=0,flash=0,travel=0,lastGap=0;
try{best=Number(localStorage.getItem('dont-trip-grandma-best'))||0;coins=Number(localStorage.getItem('dont-trip-grandma-coins'))||0}catch(e){}bestEl.textContent=best+' m';coinsEl.textContent='🪙 '+coins;
function resizeGame(){
 if(['playback','record'].includes(replay.mode)&&replay.tape){forceReplayDimensions();return;}
 const oldW=W,oldGround=ground,wasGrounded=grandma.y>=oldGround-grandma.h-2;
 const mobile=window.matchMedia('(max-width:650px)').matches;
 const box=canvas.getBoundingClientRect();
 // Keep the canvas world at a constant logical height; expand the horizontal
 // field of view to match the full-width desktop instead of stretching art.
 // A single isotropic canvas scale: never independently stretch world X/Y.
 // Portrait uses a 560:390 playfield; landscape expands the visible world width.
 H=390;
 W=mobile?(window.matchMedia('(orientation:portrait)').matches?560:Math.max(560,Math.round(H*box.width/Math.max(1,box.height)))):Math.max(900,Math.round(H*box.width/Math.max(1,box.height)));
 ground=mobile?(window.matchMedia('(orientation:portrait)').matches?313:Math.round(H*.8)):313;
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
// Current single-file game has no separate Balance/Fall controllers: keep this small
// deterministic window integrated with the existing collision -> rescue -> game-over flow.
class RecoveryWindowController{
 constructor(){this.duration=.9;this.active=false;this.position=0;this.elapsed=0;this.safeMin=.38;this.safeMax=.62;this.perfectMin=.47;this.perfectMax=.53;}
 begin(distance,focusBonus=0){
  this.active=true;this.elapsed=0;this.position=0;
  const shrink=Math.min(.065,Math.floor(distance/1000)*.008);
  const difficultyAdjust=(typeof difficultyRule==='function'?difficultyRule().recovery:0)||0;
  const focus=Math.max(0,Math.min(.05,focusBonus+difficultyAdjust));
  this.safeMin=Math.min(this.perfectMin-.01,.38+shrink-focus);
  this.safeMax=Math.max(this.perfectMax+.01,.62-shrink+focus);
 }
 tick(dt){
  if(!this.active)return false;
  this.elapsed=Math.min(this.duration,this.elapsed+Math.max(0,dt));
  this.position=this.elapsed/this.duration;
  return this.elapsed>=this.duration;
 }
 resolve(){
  if(!this.active)return 'inactive';
  this.active=false;
  const p=this.position;
  if(p>=this.perfectMin&&p<=this.perfectMax)return 'perfect';
  if(p>=this.safeMin&&p<=this.safeMax)return 'safe';
  return 'miss';
 }
 reset(){this.active=false;this.elapsed=0;this.position=0;}
}
class BalanceController{
 constructor(){this.value=1;}
 hit(){this.value=.25;}
 recover(result){this.value=result==='perfect'?1:.65;}
 fail(){this.value=0;}
 reset(){this.value=1;}
}
class NearMissController{
 constructor(){this.focus=0;this.streak=0;}
 register(){this.streak=Math.min(3,this.streak+1);this.focus=Math.min(.03,this.focus+.01);return this.focus;}
 consumeFocus(){const focus=this.focus;this.focus=0;this.streak=0;return focus;}
 reset(){this.focus=0;this.streak=0;}
}
// A collision only offers a grab when its obstacle can plausibly be held.
 // Rarity is seeded by the replay RNG; the skill window itself is deterministic.
class LastSecondGrabController{
 constructor(){this.reset();}
 reset(){this.active=false;this.elapsed=0;this.duration=.52;this.target=null;this.used=false;}
 eligible(obstacle){return !!obstacle&&['walker','bike','bin','log'].includes(obstacle.type?.id);}
 offer(obstacle,roll){
  this.reset();
  if(!this.eligible(obstacle)||roll>=.17)return false;
  this.target={x:obstacle.x,y:obstacle.y,w:obstacle.w,h:obstacle.h,id:obstacle.type.id};
  return true;
 }
 begin(){if(!this.target||this.used)return false;this.active=true;this.elapsed=0;this.used=true;return true;}
 tick(dt){if(!this.active)return false;this.elapsed+=Math.max(0,dt);return this.elapsed>=this.duration;}
 resolve(){if(!this.active)return false;this.active=false;return this.elapsed>=.19&&this.elapsed<=.36;}
}
const lastSecondGrab=new LastSecondGrabController();
let grabCelebration=0;
function beginLastSecondGrab(){
 if(!lastSecondGrab.begin())return false;
 if(!flowTo(GameState.GRAB)){lastSecondGrab.reset();return false;}
 state='grab';
 document.getElementById('game').classList.add('grab-mode');
 document.getElementById('jumpBtn').textContent='✋ GRIJP!';
 haptic(14);
 statusEl.textContent='GRIJP! Tik op het juiste moment om je vast te houden!';
 return true;
}
function resolveLastSecondGrab(success){
 if(state!=='grab')return;
 const target=lastSecondGrab.target;
 lastSecondGrab.reset();
 document.getElementById('game').classList.remove('grab-mode');
 document.getElementById('jumpBtn').textContent='↑ Spring!';
 if(!success){balanceController.fail();perfectRunAlive=false;resetCombo();playFeedback('fail');haptic([35,45,55]);end();return;}
 balanceController.recover('safe');
 grandmaExpressions.react('safe');
 perfectRunAlive=false;resetCombo();
 safeRun++;if(replay.mode!=='playback')metaState.stats.safes++;
 recoveryBoost=0;recoverySlow=1.75;recoveryFeedback=1.35;
 recoveryFeedbackText='VASTGEGRABBELD!';
 grabCelebration=reducedRecoveryMotion.matches?0:.75;
 invulnerable=1.5;grandma.vy=0;grandma.y=ground-grandma.h;
 if(target)obstacles=obstacles.filter(o=>!(o.hit&&o.type.id===target.id&&Math.abs(o.x-target.x)<4));
 flowTo(GameState.RUNNING);state='playing';
 statusEl.textContent='Oma hangt aan haar wandelstok! Net op tijd gered.';
 playFeedback('safe');haptic([20,35,20]);evaluateAchievements();
}
function drawLastSecondGrab(){
 if(state==='grab'){
  // Granny stretches for the actual nearby grab target; keep the gesture
  // readable even if the original obstacle is partly behind her.
  const gripX=grandma.x+grandma.w+17,gripY=grandma.y+23;
  ctx.save();ctx.strokeStyle='#493e49';ctx.lineWidth=8;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(grandma.x+grandma.w-7,grandma.y+36);
  ctx.quadraticCurveTo(gripX+3,gripY-18,gripX+18,gripY-4);ctx.stroke();
  ctx.strokeStyle='#f2c7aa';ctx.lineWidth=5;ctx.stroke();
  ctx.fillStyle='#ffdc70';ctx.beginPath();ctx.arc(gripX+19,gripY-4,8,0,Math.PI*2);ctx.fill();ctx.restore();
  const cx=grandma.x+grandma.w+35,cy=grandma.y-40;
  ctx.save();ctx.fillStyle='#fff8df';ctx.strokeStyle='#493e49';ctx.lineWidth=3;
  ctx.beginPath();ctx.roundRect(cx-70,cy-34,180,69,13);ctx.fill();ctx.stroke();
  ctx.textAlign='center';ctx.fillStyle='#493e49';ctx.font='900 17px system-ui';
  ctx.fillText('GRIJP!  TIK NU',cx+20,cy-7);
  ctx.fillStyle='#e6bacf';ctx.fillRect(cx-51,cy+5,142,13);
  ctx.fillStyle='#6dbe93';ctx.fillRect(cx-51+142*(.19/.52),cy+5,142*(.17/.52),13);
  ctx.fillStyle='#493e49';ctx.fillRect(cx-51+142*Math.min(1,lastSecondGrab.elapsed/.52)-2,cy+2,4,19);
  ctx.restore();
 }
 if(grabCelebration>0&&!reducedRecoveryMotion.matches){
  ctx.save();
  const t=1-grabCelebration/.75,angle=-.2*Math.sin(Math.PI*t);
  ctx.strokeStyle='#493e49';ctx.lineWidth=8;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(grandma.x+grandma.w-5,grandma.y+39);
  ctx.quadraticCurveTo(grandma.x+grandma.w+15,grandma.y-7,grandma.x+grandma.w+40,grandma.y+2+Math.sin(t*12)*7);ctx.stroke();
  ctx.strokeStyle='#f2c7aa';ctx.lineWidth=5;ctx.stroke();
  ctx.translate(grandma.x+grandma.w/2,grandma.y+grandma.h/2);ctx.rotate(angle);
  ctx.fillStyle='#ffe278';ctx.strokeStyle='#493e49';ctx.lineWidth=3;
  ctx.beginPath();ctx.roundRect(15,-49,83,24,8);ctx.fill();ctx.stroke();
  ctx.fillStyle='#493e49';ctx.textAlign='center';ctx.font='900 12px system-ui';
  ctx.fillText('HANG ON!',56,-33);
  ctx.restore();
 }
}
const recoveryWindow=new RecoveryWindowController();
const balanceController=new BalanceController();
const nearMissController=new NearMissController();
const reducedRecoveryMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let recoveryBoost=0,recoverySlow=0,recoveryFeedback=0,recoveryFeedbackText='',recoverySettle=0,recoveryCameraSettle=0;
function triggerRecovery(obstacle){
 if(state!=='playing'||vehicle)return;
 if(daily.active){finishDailyRun('fall');return;}
 clearDangerWarnings();audioDirector.stop();
 // Decide once on collision; failed Recovery may expose this rare second chance.
 lastSecondGrab.offer(obstacle,lastSecondGrab.eligible(obstacle)?replay.randomValue():1);
 recoveryWindow.begin(score,nearMissController.consumeFocus());balanceController.hit();flowTo(GameState.RECOVERY);state='recovery';
 document.getElementById('game').classList.add('recovery-mode');
 statusEl.textContent='BALANS! Tik wanneer de wijzer in het geel staat.';
}
function finishRecovery(result){
 document.getElementById('game').classList.remove('recovery-mode');
 recoveryWindow.reset();
 if(result==='miss'&&beginLastSecondGrab())return;
 if(result==='miss'){balanceController.fail();perfectRunAlive=false;resetCombo();playFeedback('fail');haptic([35,45,55]);end();return;}
 balanceController.recover(result);
 grandmaExpressions.react(result==='perfect'?'perfect':'safe');
 if(result==='perfect'){perfectRun++;if(replay.mode!=='playback')metaState.stats.perfects++;incrementMission('perfect');registerCombo(2,'PERFECT · COMBO +2');addWorldMastery('perfects',1);playFeedback('perfect');haptic(24)}else{safeRun++;if(replay.mode!=='playback')metaState.stats.safes++;perfectRunAlive=false;resetCombo();playFeedback('safe')}
 evaluateAchievements();
 recoveryBoost=result==='perfect'?1.5:0;
 recoverySlow=result==='safe'?1.6:0;
 recoverySettle=result==='perfect'&&!reducedRecoveryMotion.matches?.26:0;
 recoveryCameraSettle=result==='perfect'&&!reducedRecoveryMotion.matches?.24:0;
 recoveryFeedback=1.05;
 recoveryFeedbackText=result==='perfect'?'PERFECT SAVE!':'GERED!';
 invulnerable=1.2;flowTo(GameState.RUNNING);state='playing';
 statusEl.textContent=result==='perfect'?'PERFECT SAVE! Korte snelheidsboost.':'Net gered! Oma moet even op snelheid komen.';
}
function attemptRecovery(){
 if(state!=='recovery')return false;
 finishRecovery(recoveryWindow.resolve());return true;
}
function updateLastSecondGrab(dt){
 grandmaExpressions.update(dt);
 if(lastSecondGrab.tick(dt))resolveLastSecondGrab(false);
}
function updateRecovery(dt){grandmaExpressions.update(dt);if(recoveryWindow.tick(dt))finishRecovery('miss');}
function drawRecoveryMeter(){
 if(state!=='recovery')return;
 const cx=grandma.x+grandma.w/2,cy=ground+56,r=49,a0=Math.PI*1.08,a1=Math.PI*1.92;
 const angle=p=>a0+(a1-a0)*p;
 ctx.save();ctx.lineCap='round';
 const segment=(start,end,color,width)=>{ctx.beginPath();ctx.arc(cx,cy,r,angle(start),angle(end));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()};
 segment(0,1,'#493e49',14);
 segment(recoveryWindow.safeMin,recoveryWindow.safeMax,'#ffce52',12);
 segment(recoveryWindow.perfectMin,recoveryWindow.perfectMax,'#fff7d7',13);
 const a=angle(recoveryWindow.position),nx=cx+Math.cos(a)*r,ny=cy+Math.sin(a)*r;
 ctx.beginPath();ctx.moveTo(nx,ny);ctx.lineTo(nx+Math.cos(a)*13,ny+Math.sin(a)*13);
 ctx.strokeStyle='#fffaf2';ctx.lineWidth=5;ctx.stroke();
 ctx.beginPath();ctx.arc(nx,ny,6,0,Math.PI*2);ctx.fillStyle='#493e49';ctx.fill();
 ctx.strokeStyle='#fffaf2';ctx.lineWidth=2;ctx.stroke();
 ctx.font='900 16px system-ui';ctx.textAlign='center';ctx.fillStyle='#493e49';
 ctx.fillText('TIK!  BALANS',cx,cy+18);
 ctx.restore();
}
function drawRecoveryGrandma(){
 if(recoverySettle>0&&!reducedRecoveryMotion.matches){
  const t=1-recoverySettle/.26,impact=Math.sin(t*Math.PI);
  ctx.save();ctx.translate(grandma.x+grandma.w/2,grandma.y+grandma.h);
  ctx.scale(1+impact*.11,1-impact*.11);
  ctx.translate(-(grandma.x+grandma.w/2),-(grandma.y+grandma.h));
  drawGrandma();ctx.restore();return;
 }
 drawGrandma();
}
function drawRecoveryFeedback(){
 if(recoveryFeedback<=0)return;
 const nearMiss=recoveryFeedbackText==='NEAR\nMISS!';
 const x=grandma.x+grandma.w/2+(nearMiss?28:22);
 const y=grandma.y-(nearMiss?48:30);
 ctx.save();ctx.globalAlpha=Math.min(1,recoveryFeedback*(nearMiss?1.15:2));ctx.textAlign='center';
 ctx.font=(nearMiss?'1000 30px':'900 19px')+' system-ui';
 ctx.strokeStyle='#493e49';ctx.lineWidth=nearMiss?6:4;
 ctx.fillStyle='#ffcc65';
 const lines=recoveryFeedbackText.split('\n');
 lines.forEach((line,i)=>{
  const yy=y+i*(nearMiss?27:21);
  ctx.strokeText(line,x,yy);ctx.fillText(line,x,yy);
 });
 ctx.restore();
}

function saveCoins(){if(replay.mode==='playback')return;if(typeof menuWallet!=='undefined')menuWallet.textContent='🪙 '+coins+' munten';coinsEl.textContent='🪙 '+coins;try{localStorage.setItem('dont-trip-grandma-coins',coins)}catch(e){}}
const clothing=[
 {id:'classic',name:'Klassieke oma',cost:0,color:'#ad78a4',hair:'#e6e4e3'},
 {id:'red',name:'Rode jas',cost:250,color:'#e35d67',hair:'#e6e4e3',pattern:'stripes',patternColor:'#ffe0e2'},
 {id:'sport',name:'Sportieve oma',cost:325,color:'#3e8db7',hair:'#f0e9d5',pattern:'chevron',patternColor:'#d8eef8'},
 {id:'gold',name:'Gouden outfit',cost:700,color:'#edb74c',hair:'#fff3d0',pattern:'stars',patternColor:'#ffeab0'},
 {id:'night',name:'Nachtloper',cost:825,color:'#6250a5',hair:'#b4c4ec',pattern:'dots',patternColor:'#def7ed'},
 {id:'mint',name:'Mintgroen',cost:375,color:'#4eb79b',hair:'#f3e9e1',pattern:'dots',patternColor:'#def7ed'},
 {id:'denim',name:'Denim diva',cost:425,color:'#426c9e',hair:'#f2e4cf',pattern:'checks',patternColor:'#d8e6f5'},
 {id:'flower',name:'Bloemenfeest',cost:475,color:'#ed87ac',hair:'#f8f0de',pattern:'flowers',patternColor:'#fff2cd'},
 {id:'forest',name:'Boswandeling',cost:550,color:'#477a53',hair:'#ded9ca',pattern:'leaves',patternColor:'#d2e8bd'},
 {id:'disco',name:'Disco oma',cost:950,color:'#b55dcd',hair:'#f9e6ac',pattern:'sparkles',patternColor:'#fbe9ae'},
 {id:'coral',name:'Koraal chic',cost:625,color:'#f4866a',hair:'#e6e4e3',pattern:'waves',patternColor:'#ffe3d8'},
 {id:'midnight',name:'Middernacht',cost:1200,color:'#263e63',hair:'#e6d7f3',pattern:'stars',patternColor:'#ffeab0'}
];
const gadgets=[
 {id:'plane',name:'Vliegtuig',cost:45,description:'Upgrade: extra beschermschild voor vliegevents · tik om te vliegen.'},
 {id:'booster',name:'Scootmobiel',cost:35,description:'Upgrade: extra beschermschild voor Scootmobiel-events · wissel van baan.'}
];
let modeObstacles=[],modeSpawn=0,modeDistance=0,modeCamera=0,modeGraceTime=0;let ownedClothes=['classic'],selectedClothes='classic',ownedGadgets=[],vehicle=null,vehicleTime=0,vehicleCooldown=24,vehicleLane=1,vehicleVelocity=0,vehicleSpawnWait=25,menuPage='home';
let ownedAccessories=['cane-classic'],selectedAccessories={cane:'cane-classic',glasses:null,companion:null};
let metaState={stats:{runs:0,perfects:0,safes:0,nearMisses:0,coinsCollected:0,maxTier:1,bestCombo:0,totalDistance:0,accessoriesOwned:1,xp:0},records:{distance:0,combo:0,coins:0,perfects:0,tier:1},mastery:{},tiered:{},collections:[],daily:{key:'',progress:{},claimed:[]},weekly:{key:'',progress:{},claimed:[]},settings:{difficulty:'normal',startWorld:0,audio:true,music:false,sfx:null,visualWarnings:true,ghost:false,haptics:true,pinnedMission:null},achievements:[],onboardingSeen:false};
try{ownedClothes=JSON.parse(localStorage.getItem('grandma-clothes'))||['classic'];selectedClothes=localStorage.getItem('grandma-outfit')||'classic';ownedGadgets=JSON.parse(localStorage.getItem('grandma-gadgets'))||[]}catch(e){}
try{
 const savedMeta=JSON.parse(localStorage.getItem('grandma-meta-v1')||'null');
 if(savedMeta&&savedMeta.stats){
  metaState={...metaState,...savedMeta,stats:{...metaState.stats,...savedMeta.stats},records:{...metaState.records,...(savedMeta.records||{})},mastery:{...(savedMeta.mastery||{})},tiered:{...(savedMeta.tiered||{})},settings:{...metaState.settings,...(savedMeta.settings||{})},daily:{...metaState.daily,...(savedMeta.daily||{})},weekly:{...metaState.weekly,...(savedMeta.weekly||{})}};
  ownedAccessories=Array.isArray(savedMeta.ownedAccessories)&&savedMeta.ownedAccessories.length?savedMeta.ownedAccessories:['cane-classic'];
  selectedAccessories={...selectedAccessories,...(savedMeta.selectedAccessories||{})};
 }
}catch(e){}

if(typeof metaState.settings.sfx!=='boolean')metaState.settings.sfx=metaState.settings.audio!==false;
if(typeof metaState.settings.music!=='boolean')metaState.settings.music=false;
if(typeof metaState.settings.visualWarnings!=='boolean')metaState.settings.visualWarnings=true;
if(typeof metaState.settings.ghost!=='boolean')metaState.settings.ghost=replay.ghostEnabled;
replay.ghostEnabled=metaState.settings.ghost;
function saveInventory(){try{localStorage.setItem('grandma-clothes',JSON.stringify(ownedClothes));localStorage.setItem('grandma-outfit',selectedClothes);localStorage.setItem('grandma-gadgets',JSON.stringify(ownedGadgets))}catch(e){}}

const comboEl=document.getElementById('combo'),onboardingEl=document.getElementById('onboarding'),runSummaryEl=document.getElementById('runSummary'),missionPinEl=document.getElementById('missionPin'),eventBannerEl=document.getElementById('eventBanner'),rankHudEl=document.getElementById('rankHud');
function dayKey(){return PROG.dayKey?PROG.dayKey():new Date().toISOString().slice(0,10)}
function weekKey(){return PROG.weekKey?PROG.weekKey():dayKey()}
function activeMissions(pool,count,key){return PROG.activeMissions?PROG.activeMissions(pool,count,key):pool.slice(0,count)}
function ensureMissionPeriods(){
 const d=dayKey(),w=weekKey();
 if(metaState.daily.key!==d)metaState.daily={key:d,progress:{},claimed:[]};
 if(metaState.weekly.key!==w)metaState.weekly={key:w,progress:{},claimed:[]};
 const available=activeMissions(META.missionPool,3,d);
 if(!metaState.settings.pinnedMission||!available.some(m=>m.id===metaState.settings.pinnedMission))metaState.settings.pinnedMission=available[0]?.id||null;
}
function saveMetaState(){if(replay.mode==='playback')return;
 metaState.stats.accessoriesOwned=ownedAccessories.length;
 try{localStorage.setItem('grandma-meta-v1',JSON.stringify({...metaState,ownedAccessories,selectedAccessories}))}catch(e){}
}
function difficultyRule(){return META.difficultyModes?.[(replay.mode==='playback'?replay.tape.start.difficulty:metaState.settings.difficulty)]||{speed:1,recovery:0,reward:1,label:'Normaal'}}
function currentRank(){return PROG.rankForXp?PROG.rankForXp(metaState.stats.xp||0,META.rankLevels):META.rankLevels?.[0]}
function nextRank(){return PROG.nextRank?PROG.nextRank(metaState.stats.xp||0,META.rankLevels):null}
function updateRankHud(){
 if(!rankHudEl)return;
 const rank=currentRank();rankHudEl.textContent=rank?'LV '+rank.level+' · '+rank.name:'LV 1';
}
const dangerDirector=new window.GrannyDangerSoundscape.DangerSoundscape();
const audioDirector=new window.GrannyDangerSoundscape.DangerAudioDirector(window);
const warningEl=document.createElement('div');
warningEl.id='dangerWarning';warningEl.className='danger-warning';warningEl.hidden=true;
warningEl.setAttribute('aria-hidden','true');
warningEl.innerHTML='<span class="danger-warning-edge"></span><span class="danger-warning-label"></span>';
document.getElementById('game').appendChild(warningEl);
function clearDangerWarnings(){
 dangerDirector.reset();warningEl.hidden=true;warningEl.classList.remove('urgent');
}
function updateDangerWarnings(){
 const cue=dangerDirector.update({obstacles,modeObstacles,granny:grandma,speed,state,controllerState:runFlow.current,
   vehicle,worldEventActive:worldEvents.active,vehicleLane,vehicleVelocity,elapsed,modeGraceTime,
   recovery:recoveryWindow.active,paused:state==='paused'});
 if(cue?.first&&metaState.settings.sfx)audioDirector.warning(cue.kind);
 if(!cue||!metaState.settings.visualWarnings){warningEl.hidden=true;return;}
 warningEl.hidden=false;
 warningEl.classList.toggle('urgent',cue.eta<=.55);
 warningEl.style.setProperty('--danger-strength',String(Math.min(1,Math.max(.35,(.9-cue.eta)/.5))));
 warningEl.querySelector('.danger-warning-label').textContent=cue.kind.label+' nadert';
}
function playFeedback(kind){
 if(metaState.settings.sfx)audioDirector.effect(kind);
}
function haptic(pattern){if(metaState.settings.haptics&&navigator.vibrate)try{navigator.vibrate(pattern)}catch(e){}}
function pinnedMission(){
 ensureMissionPeriods();return activeMissions(META.missionPool,3,metaState.daily.key).find(m=>m.id===metaState.settings.pinnedMission)||null
}
function updateMissionPin(){
 if(!missionPinEl)return;const m=pinnedMission();
 if(!m){missionPinEl.hidden=true;return}
 const p=Math.min(m.goal,metaState.daily.progress[m.id]||0);missionPinEl.hidden=state!=='playing'&&state!=='recovery';missionPinEl.textContent=m.icon+' '+p+'/'+m.goal+' · '+m.label;
}
function comboMultiplier(){return Math.min(2,1+Math.floor(combo/5)*.25)}
function updateComboHud(){
 if(!comboEl)return;
 comboEl.textContent=combo>1?'🔥 '+combo+' · x'+comboMultiplier().toFixed(2):'🔥 0';
 comboEl.closest('.pill')?.classList.toggle('combo-hot',combo>=5);
}
function resetCombo(){combo=0;updateComboHud()}
function registerCombo(points=1,labelText=''){
 const before=combo;combo=Math.min(99,combo+points);comboPeak=Math.max(comboPeak,combo);if(!daily.active&&replay.mode!=='playback')metaState.stats.bestCombo=Math.max(metaState.stats.bestCombo,combo);
 updateComboHud();
 const milestone=[5,10,15,25].find(m=>before<m&&combo>=m);
 if(milestone){comboBurstTime=1.7;magnetTime=Math.max(magnetTime,milestone>=10?4:2);rewardPopups.push({text:'🔥 '+(milestone>=15?'MEGA STREAK':'HOT STREAK')+' x'+comboMultiplier().toFixed(2),x:W*.5,y:90,life:1.7});playFeedback('combo');haptic(16)}
 if(labelText)rewardPopups.push({text:labelText,x:grandma.x+35,y:grandma.y-8,life:1});
}
function incrementMission(event,amount=1){if(replay.mode==='playback')return;
 ensureMissionPeriods();
 const sets=[['daily',activeMissions(META.missionPool,3,metaState.daily.key)],['weekly',activeMissions(META.weeklyPool,2,metaState.weekly.key)]];
 for(const [kind,list] of sets){
  const box=metaState[kind];
  for(const m of list){
   if(m.event!==event||box.claimed.includes(m.id))continue;
   box.progress[m.id]=event==='tier'?Math.max(box.progress[m.id]||0,Math.min(m.goal,amount)):Math.min(m.goal,(box.progress[m.id]||0)+amount);
   if(box.progress[m.id]>=m.goal){
    box.claimed.push(m.id);const reward=Math.max(1,Math.round(m.reward*difficultyRule().reward));coins+=reward;saveCoins();
    rewardPopups.push({text:'MISSIE +'+reward+' 🪙',x:W*.5,y:95,life:1.8});playFeedback('achievement');haptic([18,25,18]);
   }
  }
 }
 updateMissionPin();saveMetaState();
}
function evaluateAchievements(){if(replay.mode==='playback')return;
 metaState.stats.accessoriesOwned=ownedAccessories.length;
 for(const a of META.achievements){
  if(metaState.achievements.includes(a.id)||!a.check(metaState.stats))continue;
  metaState.achievements.push(a.id);coins+=a.reward;saveCoins();
  rewardPopups.push({text:a.icon+' '+a.name+' +'+a.reward+' 🪙',x:W*.5,y:78,life:2.1});playFeedback('achievement');haptic([20,30,20]);
 }
 for(const a of META.tieredAchievements||[]){
  const value=metaState.stats[a.stat]||0,tier=PROG.achievementTier?PROG.achievementTier(value,a.tiers):0,old=metaState.tiered[a.id]||0;
  if(tier>old){metaState.tiered[a.id]=tier;const reward=20*tier;coins+=reward;saveCoins();rewardPopups.push({text:a.icon+' '+(PROG.tierLabel?PROG.tierLabel(tier):'Tier '+tier)+' +'+reward+' 🪙',x:W*.5,y:72,life:2});playFeedback('achievement')}
 }
 evaluateCollections();saveMetaState();
}
function evaluateCollections(){
 const owned=[...ownedClothes,...ownedAccessories];
 for(const set of META.collectionSets||[]){
  if(metaState.collections.includes(set.id))continue;
  const done=PROG.collectionStatus?PROG.collectionStatus(set,owned):set.requires.every(id=>owned.includes(id));
  if(done){metaState.collections.push(set.id);rewardPopups.push({text:'🎁 SET COMPLEET · '+set.name,x:W*.5,y:84,life:2})}
 }
}
function achievementProgress(a){
 const s=metaState.stats;
 if(a.id==='first-run')return Math.min(1,s.runs)+'/1';
 if(a.id==='perfect-10')return Math.min(10,s.perfects)+'/10';
 if(a.id==='near-25')return Math.min(25,s.nearMisses)+'/25';
 if(a.id==='coin-250')return Math.min(250,s.coinsCollected)+'/250';
 if(a.id==='tier-5')return Math.min(5,s.maxTier)+'/5';
 if(a.id==='combo-10')return Math.min(10,s.bestCombo)+'/10';
 if(a.id==='distance-5000')return Math.min(5000,s.totalDistance)+'/5000';
 if(a.id==='collector-3')return Math.min(3,s.accessoriesOwned)+'/3';
 return '';
}
function masteryFor(tier=currentTier){const id=tier%TIERS.length;return metaState.mastery[id]||(metaState.mastery[id]={distance:0,perfects:0,nearMisses:0,bestCombo:0})}
function addWorldMastery(key,amount){if(replay.mode==='playback')return;
 const m=masteryFor();m[key]=(m[key]||0)+amount;m.bestCombo=Math.max(m.bestCombo||0,combo);
 const newStars=WORLD_MASTERY.evaluate(currentTier%TIERS.length,m);
 if(newStars.length){
  saveMetaState(); // Permanent at the exact milestone, not only after game-over.
  for(const award of newStars){
   rewardPopups.push({text:'⭐ MASTERY · '+award.sticker,x:W*.5,y:76,life:2.2});
  }
 }
}
function reconcileWorldMastery(){
 let changed=false;
 for(let i=0;i<TIERS.length;i++){
  const entry=metaState.mastery[i];
  if(entry&&WORLD_MASTERY.evaluate(i,entry).length)changed=true;
 }
 if(changed)saveMetaState();
}
function renderAdventureBook(){
 const total=WORLD_MASTERY.totalStars(metaState.mastery);
 const pages=WORLD_MASTERY.WORLD_MASTERY.map((world,index)=>{
  const p=WORLD_MASTERY.progress(index,metaState.mastery[index]||{});
  const goals=p.goals.map(goal=>
   '<div class="book-goal '+(goal.earned?'earned':'')+'">'+
   '<span class="book-sticker" aria-label="'+(goal.earned?'Sticker verdiend':'Sticker vergrendeld')+'">'+
   (goal.earned?goal.symbol:'☆')+'</span>'+
   '<div class="book-goal-copy"><b>'+(goal.earned?goal.sticker:goal.label)+'</b>'+
   '<small>'+(goal.earned?'Permanent vrijgespeeld':Math.min(goal.value,goal.target)+' / '+goal.target)+'</small>'+
   '<div class="book-meter"><span style="width:'+(goal.fraction*100).toFixed(1)+'%"></span></div></div></div>'
  ).join('');
  return '<article class="adventure-page" style="--book-color:'+world.color+'">'+
   '<div class="adventure-page-heading"><span class="adventure-world-icon">'+world.icon+'</span>'+
   '<div><small>WERELD '+(index+1)+' · MASTERYPAGINA</small><h4>'+world.name+'</h4></div>'+
   '<strong>'+p.earned+' / 3 ★</strong></div>'+
   '<div class="book-goals">'+goals+'</div></article>';
 }).join('');
 return '<section class="adventure-book" id="adventureBook" aria-label="Adventure Book World Mastery">'+
 '<div class="adventure-book-header"><div><small>OMA’S ADVENTURE BOOK</small>'+
 '<h3>World Mastery</h3><p>Verdien drie sterren per wereld en verzamel 21 unieke stickers. Alleen voor de sier — zonder gameplayvoordeel.</p></div>'+
 '<strong class="book-total">'+total+' <span>/ 21 ★</span></strong></div>'+
 '<div class="adventure-pages">'+pages+'</div></section>';
}
function currentWorldRule(){return META.worldRules[currentTier%Math.max(1,META.worldRules.length)]||{speed:1,gravity:1850,jump:-690,coinValue:1,candyRate:1,attackBonus:0}}
function eventLabel(){return META.worldChallenges?.[currentTier%Math.max(1,META.worldChallenges.length)]||{icon:'⚡',label:'Wereldevent'}}
function worldEventSpeed(){
 if(worldEventTime<=0)return 1;
 const zone=currentTier%7;
 if(zone===2)return 1.18;
 if(zone===3)return 1+Math.sin(elapsed*2.1)*.1;
 if(zone===5)return 1.1;
 return 1.04
}
function worldEventGravity(){
 if(worldEventTime<=0)return 1;
 return currentTier%7===6?.72:1
}
function worldEventCoinMultiplier(){return worldEventTime>0&&currentTier%7===5?1.5:1}
function showEvent(text,duration=2){
 if(!eventBannerEl)return;eventBannerEl.textContent=text;eventBannerEl.classList.add('show');setTimeout(()=>eventBannerEl.classList.remove('show'),duration*1000)
}
function gainXp(amount){if(replay.mode==='playback')return;
 metaState.stats.xp=(metaState.stats.xp||0)+Math.max(0,Math.round(amount));updateRankHud();
}
function updateTutorial(){
 if(!tutorialActive||!onboardingEl)return;
 const next=elapsed<3?0:elapsed<7?1:elapsed<11?2:3;
 if(next===tutorialStep)return;
 tutorialStep=next;
 if(next===0)onboardingEl.textContent='TIK / SPATIE · spring over het eerste obstakel';
 else if(next===1)onboardingEl.textContent='BOTSING? · tik in het geel om oma te redden';
 else if(next===2)onboardingEl.textContent='MUNTEN + PERFECTS · bouw je combo en multiplier';
 else{tutorialActive=false;onboardingEl.classList.remove('show');metaState.onboardingSeen=true;saveMetaState();return}
 onboardingEl.classList.add('show');
}
ensureMissionPeriods();
updateComboHud();
updateRankHud();


function outfitPatternSvg(outfit,id,coatPath){
 if(!outfit.pattern)return '';
 const c=outfit.patternColor||'#fff5df';
 const motifs={
 stripes:`<path d="M2 0V12 M9 0V12" stroke="${c}" stroke-width="2"/>`,
 chevron:`<path d="M0 3L3 7L6 3L9 7L12 3" fill="none" stroke="${c}" stroke-width="1.8"/>`,
 stars:`<path d="M6 1L7.5 4.5L11 5L8 7.5L9 11L6 9L3 11L4 7.5L1 5L4.5 4.5Z" fill="${c}"/>`,
 dots:`<circle cx="3" cy="3" r="1.9" fill="${c}"/><circle cx="9" cy="9" r="1.9" fill="${c}"/>`,
 checks:`<path d="M0 0V12 M6 0V12 M12 0V12 M0 0H12 M0 6H12 M0 12H12" fill="none" stroke="${c}" stroke-width="1"/>`,
 flowers:`<circle cx="6" cy="3" r="2.7" fill="${c}"/><circle cx="3" cy="6" r="2.7" fill="${c}"/><circle cx="9" cy="6" r="2.7" fill="${c}"/><circle cx="6" cy="9" r="2.7" fill="${c}"/><circle cx="6" cy="6" r="1.6" fill="#f5bd55"/>`,
 leaves:`<path d="M1 10Q1 2 10 1Q10 10 1 10M2 10L9 2" fill="${c}" stroke="#558960" stroke-width=".7"/>`,
 sparkles:`<path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="${c}"/>`,
 waves:`<path d="M0 4Q3 0 6 4T12 4M0 10Q3 6 6 10T12 10" stroke="${c}" stroke-width="1.6" fill="none"/>`
 };
 return `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="12" height="12">${motifs[outfit.pattern]||motifs.dots}</pattern></defs><path d="${coatPath}" fill="url(#${id})" pointer-events="none"/>`;
}
function drawOutfitPattern(outfit,x,y,bob){
 if(!outfit.pattern)return;
 ctx.save();ctx.beginPath();ctx.roundRect(x+5,y+28+bob,36,31,11);ctx.clip();
 ctx.strokeStyle=outfit.patternColor||'#fff5df';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=1.5;
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){
  const px=x+9+col*10,py=y+31+bob+row*9;
  if(outfit.pattern==='stripes'||outfit.pattern==='checks'){ctx.beginPath();ctx.moveTo(px,py-3);ctx.lineTo(px,py+8);ctx.stroke();if(outfit.pattern==='checks'){ctx.beginPath();ctx.moveTo(px-4,py+3);ctx.lineTo(px+6,py+3);ctx.stroke()}}
  else if(outfit.pattern==='waves'||outfit.pattern==='chevron'){ctx.beginPath();ctx.moveTo(px-3,py+2);ctx.lineTo(px+2,py+(outfit.pattern==='waves'?-1:5));ctx.lineTo(px+7,py+2);ctx.stroke()}
  else if(outfit.pattern==='leaves'){ctx.beginPath();ctx.ellipse(px,py,3.1,1.7,-.5,0,Math.PI*2);ctx.fill()}
  else if(outfit.pattern==='flowers'){for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(px+Math.cos(i*Math.PI/2)*2,py+Math.sin(i*Math.PI/2)*2,1.5,0,Math.PI*2);ctx.fill()}}
  else if(outfit.pattern==='stars'||outfit.pattern==='sparkles'){ctx.beginPath();ctx.moveTo(px,py-3);ctx.lineTo(px+1,py-1);ctx.lineTo(px+3,py);ctx.lineTo(px+1,py+1);ctx.lineTo(px,py+3);ctx.lineTo(px-1,py+1);ctx.lineTo(px-3,py);ctx.lineTo(px-1,py-1);ctx.fill()}
  else{ctx.beginPath();ctx.arc(px,py,1.6,0,Math.PI*2);ctx.fill()}
 }
 ctx.restore();
}
function updateGrandmaOutfitPreview(){
 const outfit=clothing.find(item=>item.id===selectedClothes)||clothing[0];
 const hero=document.getElementById('menuGrandma');
 if(!hero)return;
 hero.querySelector('[data-preview-coat]')?.setAttribute('fill',outfit.color);
 const patternTarget=hero.querySelector('[data-preview-pattern]');
 if(patternTarget)patternTarget.innerHTML=outfitPatternSvg(outfit,'hero-outfit-pattern','M28 61 Q55 47 82 61 L86 96 Q54 115 24 96Z');
 hero.querySelectorAll('[data-preview-hair]').forEach(part=>part.setAttribute('fill',outfit.hair));
 const accessories=hero.querySelector('[data-preview-accessories]');
 if(accessories){
  const glasses=selectedAccessories.glasses==='glasses-heart'?'💗':selectedAccessories.glasses==='glasses-star'?'⭐':'';
  const companion=selectedAccessories.companion==='companion-duck'?'🦆':selectedAccessories.companion==='companion-cat'?'🐈':'';
  const cane=selectedAccessories.cane==='cane-gold'?'✨':'';
  accessories.innerHTML=(glasses?'<text x="55" y="43" text-anchor="middle" font-size="12">'+glasses+'</text>':'')+(companion?'<text x="-9" y="119" font-size="51" transform="translate(-18 0) scale(-1 1)">'+companion+'</text>':'')+(cane?'<text x="92" y="80" font-size="12">'+cane+'</text>':'');
 }
 hero.setAttribute('aria-label','Oma draagt: '+outfit.name);
}

const menuContent=document.getElementById('menuContent'),menuWallet=document.getElementById('menuWallet'),menuTabs=document.getElementById('menuTabs'),countdown=document.getElementById('countdown');
const GAME_OVER_SECONDS=10;let deathDeadline=0,deathTimerFrame=0;
const GameState=window.GrannyGameState.GameState;
const runFlow=new window.GrannyGameState.GameStateController();
const dailyHud=document.createElement('div');
dailyHud.id='dailyChallengeHud';dailyHud.className='daily-challenge-hud';dailyHud.hidden=true;
dailyHud.innerHTML='<span>DAILY GRANNY</span><strong id="dailyTimer">75 s</strong><small id="dailyCourseCode"></small>';
document.getElementById('game').appendChild(dailyHud);
const dailyResultCard=document.createElement('div');
dailyResultCard.id='dailyResultCard';dailyResultCard.className='daily-result-card';dailyResultCard.hidden=true;
dailyResultCard.innerHTML='<div class="daily-result-inner"><small>DAILY GRANNY CHALLENGE</small>'+
 '<h2 id="dailyResultTitle">Oma’s dagresultaat</h2><strong id="dailyResultPoints">0 PT</strong>'+
 '<p id="dailyResultDetail"></p><p id="dailyResultRecord"></p><div class="daily-result-actions">'+
 '<button id="dailyRetry" type="button">NOG EEN KEER</button>'+
 '<button id="dailyShare" type="button">Deel resultaat</button>'+
 '<button id="dailySaveCard" type="button">Bewaar kaart</button>'+
 '<button id="dailyHome" type="button">⌂ Home</button></div></div>';
document.getElementById('game').appendChild(dailyResultCard);
function updateDailyHud(){
 if(!daily.active){dailyHud.hidden=true;return}
 dailyHud.hidden=false;
 document.getElementById('dailyTimer').textContent=Math.ceil(daily.remaining)+' s';
 document.getElementById('dailyCourseCode').textContent=daily.config.id;
}
function startDaily(){
 if(state==='paused'||state==='over')returnHome();
 pendingDaily=true;start();
}
function finishDailyRun(reason){
 if(!daily.active||state==='over')return;
 daily.finish(reason);dailyLastResult={
  distance:score,seconds:daily.elapsed,nearMisses:nearMissRun,
  completed:reason==='completed'
 };
 dailyLastResult.points=window.GrannyDaily.points(dailyLastResult);
 const result=replay.mode==='playback'?{newRecord:false,bestScore:dailyLastResult.points,attempts:0}:window.GrannyDaily.record(localStorage,daily.config,dailyLastResult);
 clearDangerWarnings();audioDirector.stop();worldEvents.abort();updateWorldEventCard();
 recoveryWindow.reset();document.getElementById('game').classList.remove('recovery-mode','scooter-mode');
 state='over';flowTo(GameState.FALLING);flowTo(GameState.RESCUE);flowTo(GameState.GAME_OVER);
 dailyHud.hidden=true;
 grandma.vy=0;grandma.y=ground-grandma.h;render();
 document.getElementById('game').classList.add('post-run-active','daily-finished');
 overlay.classList.add('hidden');if(onboardingEl)onboardingEl.classList.remove('show');
 dailyResultCard.hidden=false;
 if(!replayStepping)finishReplayRecording();
 document.getElementById('dailyResultTitle').textContent=dailyLastResult.completed?'OMA HEEFT HET GEHAALD!':'OEPS… OMA STRUIKELT';
 document.getElementById('dailyResultPoints').textContent=dailyLastResult.points+' PT';
 document.getElementById('dailyResultDetail').textContent=dailyLastResult.distance+' m · '+nearMissRun+' Near Misses · '+Math.floor(daily.elapsed)+' / 75 sec · '+(dailyLastResult.completed?'+100 voltooibonus':'Run beëindigd');
 document.getElementById('dailyResultRecord').textContent=(result.newRecord?'NIEUW DAGRECORD · ':'DAGRECORD · ')+result.bestScore+' PT · POGING '+result.attempts;
}
async function shareDailyResult(){
 if(!dailyLastResult||!daily.config)return;
 const img=window.GrannyDaily.cardCanvas(daily.config,dailyLastResult);
 const message=window.GrannyDaily.resultText(daily.config,dailyLastResult);
 if(navigator.share){
  try{
   const blob=await new Promise(ok=>img.toBlob(ok,'image/png'));
   if(blob){
    const file=new File([blob],'granny-daily-'+daily.config.date+'.png',{type:'image/png'});
    if(navigator.canShare?.({files:[file]})){
     await navigator.share({title:'Daily Granny Challenge',text:message,files:[file]});return;
    }
   }
   await navigator.share({title:'Daily Granny Challenge',text:message});return;
  }catch(e){if(e.name==='AbortError')return}
 }
 try{await navigator.clipboard.writeText(message);document.getElementById('dailyShare').textContent='Gekopieerd!';}
 catch(e){downloadDailyCard()}
}
function downloadDailyCard(){
 if(!dailyLastResult||!daily.config)return;
 const link=document.createElement('a');link.download='granny-daily-'+daily.config.date+'.png';
 link.href=window.GrannyDaily.cardCanvas(daily.config,dailyLastResult).toDataURL('image/png');
 document.body.appendChild(link);link.click();link.remove();
}
document.getElementById('dailyRetry').addEventListener('click',startDaily);
document.getElementById('dailyShare').addEventListener('click',shareDailyResult);
document.getElementById('dailySaveCard').addEventListener('click',downloadDailyCard);
document.getElementById('dailyHome').addEventListener('click',()=>returnHome());
const worldEventCard=document.createElement('div');
worldEventCard.id='worldEventCard';
worldEventCard.className='world-event-card';
worldEventCard.hidden=true;
worldEventCard.setAttribute('role','status');
worldEventCard.setAttribute('aria-live','polite');
worldEventCard.innerHTML='<span class="world-event-icon"></span><span class="world-event-copy"><b></b><small></small></span><span class="world-event-countdown"></span>';
document.getElementById('game').appendChild(worldEventCard);
function tickWorldEvent(dt){
 worldEvents.tick(dt,{
  state,controllerState:runFlow.current,vehicle,
  recovery:recoveryWindow.active,paused:state==='paused',
  world:currentTier%7,distance:score,
  safeToEnter:obstacles.every(o=>o.x<grandma.x-110||o.x>grandma.x+grandma.w+260)
 },{
  onStart:(ev,reason)=>{const started=beginWorldEvent(ev);if(started)saveWorldEventPity(0);return started;},
  onActive:()=>{modeObstacles=[];modeSpawn=vehicle==='plane'?1.1:1.3;modeGraceTime=1.6},
  onOutro:()=>{modeObstacles=[]},
  onEnd:completeWorldEvent
 });
 updateWorldEventCard();
}
function updateWorldEventCard(){
 if(!worldEvents.inEvent){worldEventCard.hidden=true;return;}
 const ev=worldEvents.current;
 worldEventCard.hidden=false;
 worldEventCard.classList.toggle('intro',worldEvents.phase==='intro');
 worldEventCard.classList.toggle('outro',worldEvents.phase==='outro');
 worldEventCard.style.setProperty('--event-accent',ev.accent);
 worldEventCard.querySelector('.world-event-icon').textContent=ev.icon;
 worldEventCard.querySelector('b').textContent=ev.title;
 worldEventCard.querySelector('small').textContent=worldEvents.phase==='intro'?'Daar gaan we! · '+ev.caption:
  worldEvents.phase==='outro'?'Oma komt weer veilig op de weg…':ev.caption;
 worldEventCard.querySelector('.world-event-countdown').textContent=worldEvents.phase==='active'?
  Math.ceil(worldEvents.remaining)+' s':worldEvents.phase==='intro'?'START':'KLAAR';
}
function beginWorldEvent(ev){
 if(state!=='playing'||vehicle||recoveryWindow.active||runFlow.current!==GameState.RUNNING)return false;
 if(!flowTo(GameState.SPECIAL_MODE))return false;
 clearDangerWarnings();audioDirector.stop();
 vehicle=ev.mode;
 grandmaExpressions.react(vehicle==='plane'?'plane':'scooter');
 vehicleTime=ev.duration;vehicleLane=1;vehicleVelocity=-180;modeGraceTime=0;
 modeObstacles=[];modeSpawn=vehicle==='plane'?1.25:1.65;modeDistance=0;
 grandma.y=vehicle==='plane'?H*.42:ground-grandma.h;
 // Ordinary collisions/spawns are suspended for the whole event, including intro/outro.
 obstacles=[];candies=[];coinItems=[];spawnDistance=0;
 invulnerable=Math.max(invulnerable,1);
 if((replay.mode==='playback'?replay.tape.start.ownedGadgets:ownedGadgets).includes(ev.mode))shield=Math.max(1,shield);
 statusEl.textContent=ev.title+' · '+ev.caption;
 document.getElementById('jumpBtn').textContent=vehicle==='plane'?'↑ Fladder!':'↑ Spring!';
 document.getElementById('game').classList.toggle('scooter-mode',vehicle==='booster');
 updateWorldEventCard();
 return true;
}
function completeWorldEvent(){
 if(runFlow.current!==GameState.SPECIAL_MODE)return;
 clearDangerWarnings();
 finishVehicle();
 flowTo(GameState.RUNNING);
 updateWorldEventCard();
}

let resultPreviousBest=0,resultPreviousCollections=[],resultPreviousAchievements=[],postRunDelayed=0;
const postRun=new window.GrannyPostRun.RunResultOverlay(document.getElementById('game'),{
 revive:boost=>revive(boost),
 finish:()=>showRunResult(),
 retry:()=>retryRun(),
 home:()=>returnHome()
});
document.getElementById('game').addEventListener('pointerdown',event=>{
 if(state!=='over'||!postRun.canTapRetry())return;
 if(event.target.closest('button, .post-run-card, .world-map-overlay'))return;
 event.preventDefault();retryRun();
},true);
function flowTo(next){
 if(runFlow.current===next)return true;
 return runFlow.transition(next);
}
function showRunResult(){
 if(daily.finished)return;
 if(state!=='over'||postRun.phase==='result')return;
 deathDeadline=0;
 if(deathTimerFrame)cancelAnimationFrame(deathTimerFrame);
 deathTimerFrame=0;
 if(postRunDelayed)clearTimeout(postRunDelayed);
 postRunDelayed=0;
 if(runFlow.current===GameState.RESCUE)flowTo(GameState.GAME_OVER);
 finalizeRun();
 const newCollections=(metaState.collections||[]).filter(id=>!resultPreviousCollections.includes(id));
 const newAchievements=(metaState.achievements||[]).filter(id=>!resultPreviousAchievements.includes(id));
 const newUnlock=newCollections[0]||newAchievements[0];
 const collection=META.collectionSets?.find(a=>a.id===newUnlock);
 const achievement=META.achievements?.find(a=>a.id===newUnlock);
 const summary=window.GrannyPostRun.RunSummaryBuilder.build({
  distance:score,previousBest:resultPreviousBest,coins:coinsRun,
  bestCombo:comboPeak,perfectSaves:perfectRun,
  worldDiscovered:currentTier>startTierOffset?{name:TIERS[currentTier%TIERS.length].name}:null,
  adventureUnlock:newUnlock?{name:collection?.name||achievement?.name||String(newUnlock)}:null
 });
 postRun.showResult(summary,{reducedMotion:reducedRecoveryMotion.matches});
 document.getElementById('game').classList.add('post-run-result');
}
function retryRun(){
 if(state!=='over'||postRun.phase!=='result')return false;
 if(replay.mode==='playback'){returnHome();start();return true;}
 if(runFlow.current===GameState.GAME_OVER&&!flowTo(GameState.RUN_RESET))return false;
 start();
 return true;
}

function stopDeathTimer(){if(postRunDelayed)clearTimeout(postRunDelayed);postRunDelayed=0;postRun.hide();document.getElementById('game').classList.remove('post-run-active','post-run-result');deathDeadline=0;if(deathTimerFrame)cancelAnimationFrame(deathTimerFrame);deathTimerFrame=0;overlay.classList.remove('gameover');overlay.style.removeProperty('--timer-angle')}
function tickDeathTimer(){if(state!=='over'||!deathDeadline)return;const remaining=Math.max(0,(deathDeadline-performance.now())/1000);overlay.style.setProperty('--timer-angle',(remaining/GAME_OVER_SECONDS*360)+'deg');countdown.textContent='⏳ Nog '+Math.ceil(remaining)+' seconden om verder te gaan';if(remaining<=0){showRunResult();return}postRun.setRemaining(remaining);deathTimerFrame=requestAnimationFrame(tickDeathTimer)}
function finalizeRun(){if(replay.mode==='playback'||daily.active||daily.finished)return;if(runFinalized)return;runFinalized=true;saveWorldEventPity(worldEvents.noteRunEnded());metaState.stats.runs++;metaState.stats.totalDistance+=score;metaState.stats.maxTier=Math.max(metaState.stats.maxTier,currentTier+1);metaState.records.distance=Math.max(metaState.records.distance,score);metaState.records.combo=Math.max(metaState.records.combo,comboPeak);metaState.records.coins=Math.max(metaState.records.coins,coinsRun);metaState.records.perfects=Math.max(metaState.records.perfects,perfectRun);metaState.records.tier=Math.max(metaState.records.tier,currentTier+1);incrementMission('distance',score);incrementMission('tier',currentTier+1);gainXp(score*.18+coinsRun*2+perfectRun*15+nearMissRun*7+(perfectRunAlive?100:0));if(perfectRunAlive){coins+=25;saveCoins()}evaluateAchievements();saveMetaState()}
function returnHome(){const wasPlayback=replay.mode==='playback';if(replay.mode==='record')finishReplayRecording();if(replay.mode==='playback'&&replayInitialOutfit){selectedClothes=replayInitialOutfit;replayInitialOutfit=null;}replay.idle();
 if(wasPlayback&&replayEconomySnapshot){
  coins=replayEconomySnapshot.coins;best=replayEconomySnapshot.best;
  metaState=replayEconomySnapshot.meta;replayEconomySnapshot=null;
  bestEl.textContent=best+' m';saveCoins();saveMetaState();updateRankHud();
 }
 const wasDaily=daily.active||daily.finished;dailyResultCard.hidden=true;dailyHud.hidden=true;document.getElementById('game').classList.remove('daily-running','daily-finished','post-run-active');pendingDaily=false;clearDangerWarnings();audioDirector.stop();stopDeathTimer();if(state==='over'&&!wasDaily&&!wasPlayback)finalizeRun();daily.active=false;daily.finished=false;
 if(runFlow.current!==GameState.MENU){
  flowTo(GameState.MENU);
 }if(runSummaryEl)runSummaryEl.innerHTML='';state='ready';reset();showMenu('home');title.textContent='KLAAR VOOR DE START?';text.textContent='Spring over hindernissen, verzamel munten en ontdek nieuwe gebieden.';startBtn.textContent='Start het spel →';overlay.classList.remove('hidden');resizeGame();render()}

const makeHomeIcon=paths=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'+paths+'</svg>';
const HOME_ICONS={
 map:makeHomeIcon('<path d="M7 14L24 8L40 15L57 8V49L40 56L24 49L7 56Z" fill="#fff1cb" stroke="#29243a" stroke-width="4" stroke-linejoin="round"/><path d="M24 8V49M40 15V56" fill="none" stroke="#29243a" stroke-width="3"/><path d="M16 23L20 30L25 25M45 36L49 42L53 36" fill="none" stroke="#e68c75" stroke-width="4" stroke-linecap="round"/><circle cx="17" cy="22" r="4" fill="#f4b35d" stroke="#29243a" stroke-width="2"/>'),
 outfits:makeHomeIcon('<path d="M21 14L10 21L5 32L17 37L20 31V54H44V31L47 37L59 32L54 21L43 14L37 19H27Z" fill="#ba85d7" stroke="#29243a" stroke-width="4" stroke-linejoin="round"/><path d="M28 13C28 6 37 5 37 11C37 17 30 18 30 21" fill="none" stroke="#29243a" stroke-width="4" stroke-linecap="round"/>'),
 gadgets:makeHomeIcon('<path d="M26 7H38L40 15L47 18L54 14L61 24L55 30V38L61 44L54 54L46 49L40 52L38 60H26L24 52L18 49L10 54L3 44L9 38V30L3 24L10 14L18 18L24 15Z" fill="#c5b8dc" stroke="#29243a" stroke-width="3.8" stroke-linejoin="round"/><circle cx="32" cy="34" r="10" fill="#fff7de" stroke="#29243a" stroke-width="4"/>'),
 progress:makeHomeIcon('<rect x="7" y="38" width="13" height="18" rx="2" fill="#fff0ba" stroke="#29243a" stroke-width="3.5"/><rect x="25" y="27" width="13" height="29" rx="2" fill="#ffe174" stroke="#29243a" stroke-width="3.5"/><rect x="43" y="13" width="13" height="43" rx="2" fill="#ffbd53" stroke="#29243a" stroke-width="3.5"/>'),
 extras:makeHomeIcon('<path d="M32 5L40 23L59 25L45 39L49 58L32 49L15 58L19 39L5 25L24 23Z" fill="#ffd457" stroke="#29243a" stroke-width="4" stroke-linejoin="round"/>')
};
function showMenu(page='home'){
 updateGrandmaOutfitPreview();
 ensureMissionPeriods();
 const sectionInfo={
  clothes:['Oma’s kledingkast','Kies een outfit voor Granny en maak haar klaar voor het volgende avontuur.'],
  gadgets:['Gadget garage','Ontdek speciale upgrades en speelmogelijkheden.'],
  progress:['Jouw progressie','Missies, records, badges en alle behaalde mijlpalen.'],
  collection:['Extra’s & accessoires','Geef Granny haar eigen uitstraling met accessoires.']
 };
 const info=sectionInfo[page]||['',''];
 document.getElementById('storeTitle').textContent=info[0];
 document.getElementById('storeDescription').textContent=info[1];
 menuPage=page;overlay.classList.toggle('storepage',page!=='home');overlay.classList.toggle('clothespage',page==='clothes');overlay.classList.toggle('gadgetspage',page==='gadgets');overlay.classList.toggle('progresspage',page==='progress');overlay.classList.toggle('collectionpage',page==='collection');
 menuWallet.textContent='🪙 '+coins+' munten';
 menuTabs.querySelectorAll('button').forEach(b=>{const active=b.dataset.page===page;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 if(page==='home'){
  const nextUnlock=LEVELS.getLevels().find(l=>!l.completed);
  document.getElementById('menuKicker').textContent='OMA’S LEVELAVONTUUR  ✦  49 LEVELS';
  document.getElementById('menuRecord').textContent='🏁 RECORD '+best+' M';
  const outfit=clothing.find(x=>x.id===selectedClothes)||clothing[0],pin=pinnedMission(),rank=currentRank(),unlockedWorld=LEVELS.getWorlds().filter(w=>w.unlocked).length-1,activeAccessories=Object.values(selectedAccessories).filter(Boolean).map(id=>META.cosmetics.find(x=>x.id===id)?.name).filter(Boolean),gadgetLabel=ownedGadgets.length?ownedGadgets.map(id=>gadgets.find(g=>g.id===id)?.name).filter(Boolean).join(' / '):'Geen gadget';
  menuContent.innerHTML='<details class="home-settings"><summary>Spelinstellingen</summary><div class="pre-run-card"><div><small>WERELD '+(LEVELS.LEVELS[LEVELS.getSelected()].worldIndex+1)+' · LEVEL '+LEVELS.LEVELS[LEVELS.getSelected()].number+' / 7 · '+LEVELS.LEVELS[LEVELS.getSelected()].goal+' M</small><b>'+outfit.name+' · '+(rank?.name||'Buurtwandelaar')+'</b><span>'+(pin?pin.icon+' '+pin.label:'Geen missie')+'</span></div><div class="pre-run-settings"><label>Moeilijkheid <select id="difficultySelect">'+Object.values(META.difficultyModes||{}).map(d=>'<option value="'+d.id+'" '+(d.id===metaState.settings.difficulty?'selected':'')+'>'+d.label+'</option>').join('')+'</select></label><label>Startwereld <select id="worldSelect">'+TIERS.map((t,i)=>'<option value="'+i+'" '+(i>unlockedWorld?'disabled':'')+' '+(i===LEVELS.LEVELS[LEVELS.getSelected()].worldIndex?'selected':'')+'>'+t.icon+' '+t.name+'</option>').join('')+'</select></label><button type="button" data-toggle-setting="music" aria-pressed="'+Boolean(metaState.settings.music)+'">'+(metaState.settings.music?'♫ Muziek aan':'♫ Muziek uit')+'</button><button type="button" data-toggle-setting="sfx" aria-pressed="'+Boolean(metaState.settings.sfx)+'">'+(metaState.settings.sfx?'🔊 Geluidseffecten aan':'🔇 Geluidseffecten uit')+'</button><button type="button" data-toggle-setting="visualWarnings" aria-pressed="'+Boolean(metaState.settings.visualWarnings)+'">'+(metaState.settings.visualWarnings?'◉ Waarschuwingen aan':'◎ Waarschuwingen uit')+'</button><button type="button" data-toggle-setting="ghost" aria-pressed="'+Boolean(metaState.settings.ghost)+'">'+(metaState.settings.ghost?'👻 Ghost Granny aan':'👻 Ghost Granny uit')+'</button><button type="button" data-toggle-setting="haptics">'+(metaState.settings.haptics?'📳 Haptics':'📴 Haptics')+'</button></div></div></details><div class="home-hub"><button class="home-hub-tile home-map-tile" type="button" id="worldMapButtonLegacy" aria-haspopup="dialog" aria-expanded="false"><span class="tile-icon" aria-hidden="true">'+HOME_ICONS.map+'</span><b>Wereldkaart</b></button><button class="home-hub-tile" type="button" data-open-page="clothes"><span class="tile-icon">'+HOME_ICONS.outfits+'</span><b>Outfits</b></button><button class="home-hub-tile" type="button" data-open-page="gadgets"><span class="tile-icon">'+HOME_ICONS.gadgets+'</span><b>Gadgets</b></button><button class="home-hub-tile" type="button" data-open-page="progress"><span class="tile-icon">'+HOME_ICONS.progress+'</span><b>Progressie</b></button><button class="home-hub-tile" type="button" data-open-page="collection"><span class="tile-icon">'+HOME_ICONS.extras+'</span><b>Extra’s</b></button><div class="home-achievement"><small>🏆 '+metaState.achievements.length+'/'+META.achievements.length+' ACHIEVEMENTS · XP '+(metaState.stats.xp||0)+'</small><strong>🏁 '+best+' m · 🔥 '+metaState.records.combo+'</strong></div>'+(nextUnlock?'<div class="home-next-unlock">VOLGENDE LEVELDOEL: '+nextUnlock.name+' · '+nextUnlock.number+'/7 · '+nextUnlock.goal+' m</div>':'<div class="home-next-unlock">ALLE 49 LEVELS BEHAALD</div>')+'</div>';
  const day=window.GrannyDaily.course(),previous=window.GrannyDaily.read(localStorage,day.date);
  menuContent.insertAdjacentHTML('afterbegin','<div class="daily-home-teaser"><div><small>ELKE DAG HETZELFDE PARCOURS · '+day.date+'</small><b>Daily Granny Challenge</b><span>75 seconden · '+TIERS[day.world].name+(previous?' · Beste '+previous.bestScore+' PT':'')+'</span></div><button type="button" id="dailyChallengeButton">SPEEL VANDAAG</button></div>');
  menuContent.querySelector('#dailyChallengeButton').addEventListener('click',startDaily);
  const dsel=document.getElementById('difficultySelect'),wsel=document.getElementById('worldSelect');
  dsel?.addEventListener('change',()=>{metaState.settings.difficulty=dsel.value;saveMetaState()});wsel?.addEventListener('change',()=>{const world=Number(wsel.value);const group=LEVELS.getWorlds()[world]?.levels||[];const first=group.find(l=>l.unlocked&&!l.completed)||group.find(l=>l.unlocked);if(first&&LEVELS.select(first.index)){metaState.settings.startWorld=world;saveMetaState();showMenu('home');}});
  menuContent.querySelectorAll('[data-toggle-setting]').forEach(b=>b.addEventListener('click',()=>{const wasOpen=menuContent.querySelector('.home-settings')?.open;const k=b.dataset.toggleSetting;metaState.settings[k]=!metaState.settings[k];if(k==='music'&&metaState.settings.music)audioDirector.unlock();if(k==='music'&&!metaState.settings.music)audioDirector.stop();if(k==='visualWarnings'&&!metaState.settings.visualWarnings)warningEl.hidden=true;if(k==='ghost'){replay.ghostEnabled=metaState.settings.ghost;try{localStorage.setItem(window.GrannyReplay.GHOST_KEY,String(replay.ghostEnabled))}catch(e){}}saveMetaState();showMenu('home');if(wasOpen)menuContent.querySelector('.home-settings').open=true}));
  return
 }
 if(page==='progress'){
  document.getElementById('menuKicker').textContent='OMA’S TROFEEËNKAST  ✦  MISSIES & MIJLPALEN';
  const daily=activeMissions(META.missionPool,3,metaState.daily.key),weekly=activeMissions(META.weeklyPool,2,metaState.weekly.key),rank=currentRank(),next=nextRank();
  const missionCard=(m,kind)=>{const box=metaState[kind],p=Math.min(m.goal,box.progress[m.id]||0),done=box.claimed.includes(m.id),pinned=kind==='daily'&&metaState.settings.pinnedMission===m.id;return '<button class="mission-card '+(done?'done ':'')+(pinned?'pinned':'')+'" type="button" '+(kind==='daily'?'data-pin-mission="'+m.id+'"':'')+'><span>'+m.icon+'</span><div><b>'+m.label+'</b><small>'+p+' / '+m.goal+(done?' · VOLTOOID':'')+(pinned?' · 📌 HUD':'')+'</small></div><strong>+'+m.reward+' 🪙</strong></button>'};
  menuContent.innerHTML='<section class="progress-section"><div class="rank-card"><b>LV '+(rank?.level||1)+' · '+(rank?.name||'Buurtwandelaar')+'</b><small>XP '+(metaState.stats.xp||0)+(next?' / '+next.xp:' · MAX RANK')+'</small></div>'+renderAdventureBook()+'<h3>Vandaag · tik om te pinnen</h3>'+daily.map(m=>missionCard(m,'daily')).join('')+'<h3>Deze week</h3>'+weekly.map(m=>missionCard(m,'weekly')).join('')+'<h3>Achievement tiers</h3><div class="achievement-grid">'+(META.tieredAchievements||[]).map(a=>{const tier=metaState.tiered[a.id]||0,value=metaState.stats[a.stat]||0,nextGoal=a.tiers[Math.min(tier,a.tiers.length-1)];return '<div class="achievement-card '+(tier?'done':'')+'"><span>'+a.icon+'</span><b>'+a.name+'</b><small>'+(PROG.tierLabel?PROG.tierLabel(tier):tier)+' · '+value+'/'+nextGoal+'</small><strong>Brons → Zilver → Goud → Holo</strong></div>'}).join('')+'</div><h3>Records</h3><div class="records-grid"><span>🏁 '+metaState.records.distance+' m</span><span>🔥 '+metaState.records.combo+'</span><span>🪙 '+metaState.records.coins+'</span><span>✨ '+metaState.records.perfects+'</span></div>' +'<h3>Wereld-roadmap</h3><div class="unlock-roadmap">'+META.unlocks.map(u=>'<div class="unlock-step '+(best>=u.distance?'done':'')+'"><span>'+u.icon+'</span><div><b>'+u.distance+' m · '+u.label+'</b><small>'+u.detail+'</small></div></div>').join('')+'</div></section>';menuContent.querySelectorAll('[data-pin-mission]').forEach(b=>b.addEventListener('click',()=>{metaState.settings.pinnedMission=b.dataset.pinMission;saveMetaState();showMenu('progress')}));return
 }
 if(page==='collection'){
  document.getElementById('menuKicker').textContent='OMA’S EXTRA’S  ✦  ACCESSOIRES';
  menuContent.innerHTML='<div class="collection-preview"><b>OMA LOOK</b><span>'+((clothing.find(x=>x.id===selectedClothes)||clothing[0]).name)+' · '+Object.values(selectedAccessories).filter(Boolean).length+' accessoires</span></div><div class="store-grid">'+META.cosmetics.map(item=>{const owned=ownedAccessories.includes(item.id),selected=selectedAccessories[item.type]===item.id;return '<div class="store-item '+(selected?'selected':'')+'"><div class="preview accessory-preview'+(item.type==='companion'?' companion-preview':'')+'">'+(item.type==='companion'?'<span class="companion-preview-icon" aria-hidden="true">'+item.icon+'</span>':item.icon)+'</div><b>'+item.name+'</b><small>'+item.type+'</small><button data-accessory="'+item.id+'" '+(selected||(!owned&&coins<item.cost)?'disabled':'')+'>'+(selected?'✓ ACTIEF':owned?'AANTREKKEN':'🪙 '+item.cost+' · KOPEN')+'</button></div>'}).join('')+'</div><div class="set-bonuses">'+(META.collectionSets||[]).map(s=>'<div class="'+(metaState.collections.includes(s.id)?'done':'')+'"><b>🎁 '+s.name+'</b><small>'+s.requires.join(' + ')+' · '+s.reward+'</small></div>').join('')+'</div>';
  menuContent.querySelectorAll('[data-accessory]').forEach(btn=>btn.addEventListener('click',()=>{const item=META.cosmetics.find(x=>x.id===btn.dataset.accessory);if(!item)return;if(!ownedAccessories.includes(item.id)){if(coins<item.cost)return;coins-=item.cost;ownedAccessories.push(item.id);saveCoins()}selectedAccessories[item.type]=item.id;saveMetaState();evaluateAchievements();showMenu('collection')}));
  return
 }
 document.getElementById('menuKicker').textContent=page==='clothes'?'OMA’S KLEDINGKAST  ✦  PAS JE LOOK AAN':'GADGET GARAGE  ✦  SPECIALE SPELMODI';
 const items=page==='clothes'?clothing:gadgets;
 menuContent.innerHTML='<div class="store-grid">'+items.map(item=>{
 const owned=page==='clothes'?ownedClothes.includes(item.id):ownedGadgets.includes(item.id);
 const selected=page==='clothes'&&selectedClothes===item.id;
 const symbol=page==='clothes'?`<svg viewBox="0 0 64 64" width="58" height="58"><circle cx="32" cy="18" r="13" fill="#f1c8aa" stroke="#392d44" stroke-width="2"/><path d="M15 33 Q32 24 49 33 L53 58 L11 58Z" fill="${item.color}" stroke="#392d44" stroke-width="3"/>${outfitPatternSvg(item,'shop-pattern-'+item.id,'M15 33 Q32 24 49 33 L53 58 L11 58Z')}<path d="M19 15 Q30 0 46 15" stroke="${item.hair}" stroke-width="9" fill="none"/></svg>`:(item.id==='plane'?'✈️':'🛵');
 return `<div class="store-item ${selected?'selected':''}"><div class="preview">${symbol}</div><b>${item.name}</b><small>${item.description||'Een nieuwe look voor oma'}</small><button data-buy="${item.id}" ${selected||(!owned&&coins<item.cost)?'disabled':''}>${selected?'✓ ACTIEF':owned?(page==='clothes'?'AANTREKKEN':'✓ ONTGRENDELD'):'🪙 '+item.cost+' · KOPEN'}</button></div>`
 }).join('')+'</div>';
 menuContent.querySelectorAll('[data-buy]').forEach(btn=>btn.addEventListener('click',()=>{
 const item=items.find(x=>x.id===btn.dataset.buy);if(!item)return;
 if(page==='clothes'){if(!ownedClothes.includes(item.id)){if(coins<item.cost)return;coins-=item.cost;ownedClothes.push(item.id)}selectedClothes=item.id}
 else if(!ownedGadgets.includes(item.id)){if(coins<item.cost)return;coins-=item.cost;ownedGadgets.push(item.id)}
 const previousScroll=menuPanel.scrollTop;
 saveCoins();saveInventory();showMenu(page);
 if(page==='clothes'||page==='gadgets'){
  menuPanel.scrollTop=previousScroll;
  requestAnimationFrame(syncClothesHanger);
  const updated=menuContent.querySelector('[data-buy="'+item.id+'"]');
  const focusTarget=updated?.disabled?updated.closest('.store-item'):updated;
  if(focusTarget){if(focusTarget!==updated)focusTarget.tabIndex=-1;focusTarget.focus({preventScroll:true})}
 }
 }));
 requestAnimationFrame(()=>{syncClothesRailOffset();syncClothesHanger();refreshHangerAnimation()});
}
menuContent.addEventListener('click',e=>{const tile=e.target.closest('[data-open-page]');if(!tile||menuPage!=='home')return;showMenu(tile.dataset.openPage);overlay.querySelector('.panel').scrollTop=0;});
document.getElementById('homeMainNav')?.addEventListener('click',event=>{
 const tile=event.target.closest('[data-open-page]');
 if(!tile||menuPage!=='home')return;
 showMenu(tile.dataset.openPage);
 overlay.querySelector('.panel').scrollTop=0;
});
menuTabs.addEventListener('click',e=>{
 const btn=e.target.closest('[data-page]');if(!btn)return;
 if(btn.dataset.page!==menuPage){
  showMenu(btn.dataset.page);
  // Each tab starts at the top; purchases within a tab preserve their own scroll.
  menuPanel.scrollTop=0;
  hangerLastScrollTop=0;
  hangerScrollImpulse=0;
  requestAnimationFrame(syncClothesHanger);
 }
});
const clothesRail=document.getElementById('clothesScrollRail'),clothesHanger=document.getElementById('clothesHanger'),menuPanel=overlay.querySelector('.panel');
// The rail is viewport-positioned alongside the scrolling panel, not part of its content.
// Calculate the original bottom of the controls (before panel scrolling), so it never
// crosses Start/Kleding/Gadgets or the record/wallet while the wardrobe scrolls.
function syncClothesRailOffset(){
 if(menuPage!=='clothes')return;
 const meta=overlay.querySelector('.menu-meta');
 if(!meta)return;
 const overlayTop=overlay.getBoundingClientRect().top;
 const originalMetaBottom=meta.getBoundingClientRect().bottom+menuPanel.scrollTop;
 const tabBottom=menuTabs.getBoundingClientRect().bottom;
 const desired=Math.max(originalMetaBottom,tabBottom)-overlayTop+14;
 const maxTop=Math.max(0,overlay.clientHeight-100);
 overlay.style.setProperty('--wardrobe-rail-top',Math.round(Math.min(desired,maxTop))+'px');
}
window.addEventListener('resize',()=>requestAnimationFrame(()=>{syncClothesRailOffset();syncClothesHanger()}));
const hangerReduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let hangerTargetY=0,hangerCurrentY=0,hangerScrollImpulse=0,hangerLastScrollTop=0,hangerFrame=2,hangerLastFrameTime=0;
let hangerRaf=0;
function hangerFrameSize(){return window.matchMedia('(max-width:650px)').matches?44:72}
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
// The rail is an actual draggable scrollbar, using the same panel as touch scrolling.
let hangerDragPointer=null;
function scrollWardrobeRail(event){
 const bounds=clothesRail.getBoundingClientRect();
 const available=Math.max(1,bounds.height-clothesHanger.offsetHeight);
 const progress=Math.max(0,Math.min(1,(event.clientY-bounds.top-clothesHanger.offsetHeight/2)/available));
 menuPanel.scrollTop=progress*Math.max(0,menuPanel.scrollHeight-menuPanel.clientHeight);
 syncClothesHanger();
}
clothesRail.addEventListener('pointerdown',event=>{
 if(menuPage!=='clothes'||event.button!==0)return;
 hangerDragPointer=event.pointerId;
 clothesRail.setPointerCapture(event.pointerId);
 scrollWardrobeRail(event);
 event.preventDefault();
});
clothesRail.addEventListener('pointermove',event=>{if(event.pointerId===hangerDragPointer)scrollWardrobeRail(event)});
function stopWardrobeDrag(event){if(event.pointerId===hangerDragPointer)hangerDragPointer=null}
clothesRail.addEventListener('pointerup',stopWardrobeDrag);
clothesRail.addEventListener('pointercancel',stopWardrobeDrag);
menuPanel.addEventListener('scroll',syncClothesHanger,{passive:true});
window.addEventListener('resize',()=>{syncClothesHanger();setHangerFrame(hangerFrame)});
document.addEventListener('visibilitychange',refreshHangerAnimation);
hangerReduceMotion.addEventListener?.('change',refreshHangerAnimation);
setHangerFrame(hangerFrame);
function random(a,b){return a+replay.randomValue()*(b-a)}function reset(){replayAccumulator=0;clearDangerWarnings();audioDirector.stop();worldEvents.reset(getWorldEventPity());updateWorldEventCard();grandmaExpressions.reset();recoveryWindow.reset();lastSecondGrab.reset();grabCelebration=0;document.getElementById('game').classList.remove('grab-mode');balanceController.reset();nearMissController.reset();document.getElementById('game').classList.remove('recovery-mode');recoveryBoost=0;recoverySlow=0;recoveryFeedback=0;recoverySettle=0;recoveryCameraSettle=0;document.getElementById('game').classList.remove('scooter-mode');document.getElementById('jumpBtn').textContent='↑ Spring!';modeObstacles=[];modeSpawn=0;modeDistance=0;modeGraceTime=0;vehicle=null;vehicleTime=0;vehicleSpawnWait=25;vehicleCooldown=25;vehicleLane=1;vehicleVelocity=0;activeLevel=LEVELS.getSelected();startTierOffset=LEVELS.LEVELS[activeLevel].worldIndex;currentTier=startTierOffset;levelStartScore=0;lastLevelCelebrated=-1;previousTier=currentTier;transition=0;tierFlash=0;score=0;coinsRun=0;revives=0;boostTime=0;runFinalized=false;perfectRunAlive=true;comebackTime=0;magnetTime=0;comboBurstTime=0;worldEventTime=0;worldEventCooldown=18;challengeTime=0;challengeTier=-1;lastMasteryScore=0;combo=0;comboPeak=0;perfectRun=0;safeRun=0;nearMissRun=0;landingPulse=0;rewardPopups=[];updateComboHud();coinItems=[];coinDistance=420;shop.style.display='none';shield=0;speed=245;travel=0;lastGap=0;obstacles=[];candies=[];particles=[];grandma.y=ground-grandma.h;grandma.vy=0;spawnDistance=0;nextDistance=520;candyDistance=1100;elapsed=0;invulnerable=0;flash=0;scoreEl.textContent='0 m';document.getElementById('tierFill').style.width='0%';document.getElementById('tierNow').textContent='WERELD '+(currentTier+1)+' · LEVEL '+(LEVELS.LEVELS[activeLevel].number);document.getElementById('tierNext').textContent='DOEL · '+LEVELS.LEVELS[activeLevel].goal+' M';statusEl.textContent='Pak snoepjes om een beschermschild te verdienen.';pauseBtn.textContent='⏸ Pauze'}
function start(){replayAccumulator=0;dailyFixedAccumulator=0;const loading=pendingReplayTape;pendingReplayTape=null;const dailyRequested=loading?!!loading.start.dailyDate:pendingDaily;pendingDaily=false;stopDeathTimer();dailyResultCard.hidden=true;document.getElementById('game').classList.remove('daily-finished','post-run-active');showMenu('home');reset();audioDirector.unlock();
 daily.active=false;daily.finished=false;
 if(loading){activeLevel=loading.start.activeLevel;currentTier=loading.start.world;startTierOffset=currentTier;worldEvents.reset(loading.start.pity||0);replayInitialOutfit=selectedClothes;}
 if(dailyRequested){daily.start(loading?.start.dailyDate);currentTier=daily.config.world;startTierOffset=currentTier;activeLevel=0;updateDailyHud();document.getElementById('game').classList.add('daily-running');statusEl.textContent='Iedereen speelt hetzelfde parcours · 75 seconden';}
 else{document.getElementById('game').classList.remove('daily-running');dailyHud.hidden=true;}
 beginReplayCapture(loading);
 if(loading){selectedClothes=loading.start.outfit;forceReplayDimensions();}
 if(runFlow.current===GameState.MENU)flowTo(GameState.RUN_RESET);
 if(runFlow.current===GameState.RUN_RESET)flowTo(GameState.RUNNING);
 state='playing';overlay.classList.add('hidden');resizeGame();if(loading)forceReplayDimensions();updateMissionPin();tutorialActive=!loading&&!daily.active&&!metaState.onboardingSeen;tutorialStep=-1;if(onboardingEl){onboardingEl.classList.toggle('show',tutorialActive)}last=performance.now();requestAnimationFrame(frame)}function end(){
 if(daily.active){finishDailyRun('fall');return;}
 if(state==='over')return;
 clearDangerWarnings();audioDirector.stop();
 // Existing collision/recovery handlers keep calling end(); all reward
 // bookkeeping happens once, after rescue expires or the player skips.
 resultPreviousBest=best;
 resultPreviousCollections=[...(metaState.collections||[])];
 resultPreviousAchievements=[...(metaState.achievements||[])];
 grandmaExpressions.react('fall');
 worldEvents.abort();updateWorldEventCard();
 recoveryWindow.reset();lastSecondGrab.reset();document.getElementById('jumpBtn').textContent='↑ Spring!';document.getElementById('game').classList.remove('recovery-mode','grab-mode');
 if(vehicle){vehicle=null;vehicleTime=0;modeObstacles=[];document.getElementById('game').classList.remove('scooter-mode');document.getElementById('jumpBtn').textContent='↑ Spring!'}
 state='over';
 flowTo(GameState.FALLING);
 flowTo(GameState.RESCUE);
 if(score>best&&replay.mode!=='playback'){best=score;bestEl.textContent=best+' m';try{localStorage.setItem('dont-trip-grandma-best',best)}catch(e){}}
 // Keep the same canvas and camera framing, with Granny settled on the road.
 grandma.vy=0;grandma.y=ground-grandma.h;
 render();
 const game=document.getElementById('game');
 game.classList.add('post-run-active');game.classList.remove('post-run-result');
 overlay.classList.add('hidden');overlay.classList.remove('gameover');
 if(onboardingEl)onboardingEl.classList.remove('show');
 postRun.setGrannyPosition({x:grandma.x,y:grandma.y,w:grandma.w,h:grandma.h,sceneWidth:W,sceneHeight:H});
 const canRescue=coins>=6;
 deathDeadline=performance.now()+GAME_OVER_SECONDS*1000;
 postRun.showRescue({distance:score,coins,deadline:deathDeadline,canRevive:canRescue});
 if(canRescue)deathTimerFrame=requestAnimationFrame(tickDeathTimer);
 else postRunDelayed=setTimeout(showRunResult,800);
 if(!replayStepping)finishReplayRecording();
}
function revive(boost=false){
 if(replay.mode==='playback')return;
 const cost=boost?6:10;if(state!=='over'||coins<cost||performance.now()>=deathDeadline){if(state==='over'&&performance.now()>=deathDeadline)returnHome();return;}stopDeathTimer();
 coins-=cost;saveCoins();revives++;perfectRunAlive=false;comebackTime=8;
 obstacles=obstacles.filter(o=>o.x<grandma.x-100||o.x>grandma.x+260);
 grandma.y=ground-grandma.h;grandma.vy=0;
 invulnerable=boost?6:3.5;boostTime=boost?6:0;
 state='playing';shop.style.display='none';overlay.classList.add('hidden');
 if(runFlow.current===GameState.RESCUE)flowTo(GameState.RUNNING);
 statusEl.textContent=boost?'⚡ COMEBACK TURBO: 6 seconden bescherming + bonuscombo!':'❤️ COMEBACK: 8 seconden bonuscombo actief!';showEvent('🔥 COMEBACK STREAK · 8 SEC',2);
 last=performance.now();requestAnimationFrame(frame);
}
reviveBtn.addEventListener('click',()=>revive(false));
boostBtn.addEventListener('click',()=>revive(true));
function pause(){if(state==='recovery'||state==='grab')return;if(state==='playing'){clearDangerWarnings();audioDirector.stop();flowTo(GameState.PAUSED);worldEventCard.hidden=true;showMenu('home');state='paused';title.textContent='PAUZE';text.textContent='Even op adem komen. Je run staat veilig stil.';startBtn.textContent='▶ VERDER SPELEN';overlay.classList.remove('hidden');resizeGame();pauseBtn.textContent='▶ Hervat'}else if(state==='paused'){flowTo(worldEvents.inEvent?GameState.SPECIAL_MODE:GameState.RUNNING);state='playing';audioDirector.unlock();updateWorldEventCard();overlay.classList.add('hidden');resizeGame();pauseBtn.textContent='⏸ Pauze';last=performance.now();requestAnimationFrame(frame)}}function jump(){if((state==='playing'||state==='recovery'||state==='grab')&&replay.queue('jump'))return;if(state==='grab'){resolveLastSecondGrab(lastSecondGrab.resolve());return}if(state==='recovery'){attemptRecovery();return}if(state!=='playing'&&vehicle)return;if(vehicle&&!worldEvents.active)return;if(vehicle==='plane'){vehicleVelocity=-390;return}if(vehicle==='booster'){return}if(state==='over')return;if(state==='ready'){start();return}if(state==='paused'){pause();return}if(grandma.y>=ground-grandma.h-1){grandma.vy=currentWorldRule().jump||-690;grandma.y-=1;playFeedback('jump')}}function activate(){if(state==='over')retryRun();else if(state==='paused')pause();else start()}
startBtn.addEventListener('click',activate);pauseBtn.addEventListener('click',pause);canvas.addEventListener('pointerdown',e=>{e.preventDefault();if(vehicle!=='booster')jump()});document.getElementById('jumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();jump()});
function steerScooter(direction){if(state==='playing'&&replay.queue(direction<0?'left':'right'))return;if(state==='playing'&&worldEvents.active&&vehicle==='booster')vehicleLane=Math.max(0,Math.min(2,vehicleLane+direction))}
for(const [id,direction] of [['leftBtn',-1],['rightBtn',1]])document.getElementById(id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();steerScooter(direction)});
document.addEventListener('keydown',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!e.repeat)jump()}else if(['ArrowLeft','KeyA'].includes(e.code)&&vehicle==='booster'){e.preventDefault();if(!e.repeat)steerScooter(-1)}else if(['ArrowRight','KeyD'].includes(e.code)&&vehicle==='booster'){e.preventDefault();if(!e.repeat)steerScooter(1)}else if(e.code==='KeyP'){e.preventDefault();pause()}});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});
function rectHit(a,b,pad=5){return a.x+pad<b.x+b.w-pad&&a.x+a.w-pad>b.x+pad&&a.y+pad<b.y+b.h-pad&&a.y+a.h-pad>b.y+pad}
function puff(x,y,color){for(let i=0;i<Math.ceil(W/100)+5;i++)particles.push({x,y,vx:random(-120,120),vy:random(-170,-30),life:random(.35,.75),color})}
function update(dt){if(daily.active&&daily.advance(dt)){finishDailyRun('completed');return;}grandmaExpressions.update(dt);elapsed+=dt;walk+=dt*11;updateTutorial();landingPulse=Math.max(0,landingPulse-dt*4);magnetTime=Math.max(0,magnetTime-dt);comboBurstTime=Math.max(0,comboBurstTime-dt);comebackTime=Math.max(0,comebackTime-dt);worldEventTime=Math.max(0,worldEventTime-dt);challengeTime=Math.max(0,challengeTime-dt);worldEventCooldown-=dt;for(const p of rewardPopups){p.life-=dt;p.y-=22*dt}rewardPopups=rewardPopups.filter(p=>p.life>0);recoveryBoost=Math.max(0,recoveryBoost-dt);recoverySlow=Math.max(0,recoverySlow-dt);recoveryFeedback=Math.max(0,recoveryFeedback-dt);recoverySettle=Math.max(0,recoverySettle-dt);recoveryCameraSettle=Math.max(0,recoveryCameraSettle-dt);grabCelebration=Math.max(0,grabCelebration-dt);const worldRule=currentWorldRule();const wind=worldRule.wind?1+Math.sin(elapsed*.9)*.055:1;speed=(245+elapsed*2.15+Math.max(0,elapsed-35)*.65)*(recoverySlow>0?.78:1)+(recoveryBoost>0?65:0);speed*=worldRule.speed*wind*difficultyRule().speed*worldEventSpeed()*(challengeTime>0?1.12:1);if(daily.active)speed=daily.config.speed;travel+=speed*dt;score=Math.floor(travel/14);scoreEl.textContent=score+' m';boostTime=Math.max(0,boostTime-dt);const masteryDelta=Math.max(0,score-lastMasteryScore);if(masteryDelta&&!daily.active&&replay.mode!=='playback'){addWorldMastery('distance',masteryDelta);lastMasteryScore=score}// Exactly one world-specific sequence per run; the pity threshold is based
 // on eligible running time/distance and never consumes recovery or pause time.
 if(!daily.active)tickWorldEvent(dt);
 if(daily.active)updateDailyHud();
 audioDirector.musicTick(state==='playing'&&runFlow.current===GameState.RUNNING,metaState.settings.music);
 if(vehicle){
  vehicleTime=worldEvents.remaining;
  modeDistance+=speed*dt;
  if(!worldEvents.active){
   // Intro/outro crossfades are completely safe; no obstacle spawning or
   // collision tests can run while the camera settles between worlds.
   modeObstacles=[];
  }else{
  modeSpawn-=dt;modeGraceTime=Math.max(0,modeGraceTime-dt);
  if(vehicle==='plane'){
   vehicleVelocity+=980*dt;grandma.y+=vehicleVelocity*dt;
   if(grandma.y<24||grandma.y+grandma.h>H-30){
    if(modeGraceTime>0||invulnerable>0||absorbWorldEventHit(null)){
     grandma.y=Math.max(24,Math.min(H-30-grandma.h,grandma.y));
     vehicleVelocity=0;
    }else{end();return}
   }
   if(modeSpawn<=0){
    const gap=Math.max(142,180-elapsed*.08),top=random(78,Math.max(80,H-gap-115));
    modeObstacles.push({x:W+70,top,gap,w:66});modeSpawn=random(1.25,1.65);
   }
   for(const o of modeObstacles){o.x-=Math.max(260,speed*.86)*dt;
    if(grandma.x+grandma.w-7>o.x&&grandma.x+8<o.x+o.w&&(grandma.y+6<o.top||grandma.y+grandma.h-5>o.top+o.gap)){
     if(!absorbWorldEventHit(o)){end();return}
    }
   }
   modeObstacles=modeObstacles.filter(o=>o.x+o.w>0);
  }else{
   grandma.y=ground-grandma.h;
   if(modeSpawn<=0){modeObstacles.push({lane:Math.floor(random(0,3)),z:1.22,kind:replay.randomValue()<.5?'barrier':'car'});modeSpawn=random(.8,1.15)}
   for(const o of modeObstacles){o.z-=dt*(.43+elapsed*.0015);
    if(o.z<.10&&o.z>-.015&&o.lane===vehicleLane){
     if(!absorbWorldEventHit(o)){end();return}
    }
   }
   modeObstacles=modeObstacles.filter(o=>o.z>-.12);
  }
  }
  updateDangerWarnings();
 }

 // A milestone unlocks the next level, without ever stopping this run.
 let levelDistance=Math.max(0,score-levelStartScore);
 let goal=LEVELS.LEVELS[activeLevel].goal;
 if(!daily.active&&levelDistance>=goal&&lastLevelCelebrated!==activeLevel){
  const finished=activeLevel;
  lastLevelCelebrated=finished;
  const newlyUnlocked=replay.mode==='playback'?!replayLevelCompleted.has(finished):LEVELS.complete(finished,levelDistance);
  if(replay.mode==='playback')replayLevelCompleted.add(finished);
  else LEVELS.record(finished,levelDistance);
  if(finished<LEVELS.LEVELS.length-1){
   activeLevel++;
   const nextWorld=LEVELS.LEVELS[activeLevel].worldIndex;
   if(nextWorld!==currentTier){
    // Level thresholds are cumulative within each world:
    // 600 -> 900 -> 1200 -> ... -> 2400 m.
    levelStartScore+=goal;
    previousTier=currentTier;currentTier=nextWorld;
    transition=2.8;tierFlash=0;
    if(replay.mode!=='playback')metaState.stats.maxTier=Math.max(metaState.stats.maxTier,currentTier+1);
    incrementMission('tier',currentTier+1);evaluateAchievements();
   }
  }
  if(newlyUnlocked){coins+=20;coinsRun+=20;if(replay.mode!=='playback')saveCoins();}
  const levelInfo=LEVELS.LEVELS[finished];
  showEvent('LEVEL '+levelInfo.number+' BEHAALD!'+(newlyUnlocked?' · +20 MUNTEN':''),3);
  playFeedback('tier');haptic([15,20,15]);
  statusEl.textContent='LEVEL BEHAALD! Granny rent gewoon door.';
 }
 levelDistance=Math.max(0,score-levelStartScore);
 goal=LEVELS.LEVELS[activeLevel].goal;
 const fill=document.getElementById('tierFill'),tierNow=document.getElementById('tierNow'),tierNext=document.getElementById('tierNext');
 if(fill)fill.style.width=(activeLevel===LEVELS.LEVELS.length-1&&LEVELS.getLevels()[activeLevel].completed?100:Math.min(100,levelDistance/goal*100))+'%';
 if(tierNow)tierNow.textContent='WERELD '+(currentTier+1)+' · LEVEL '+LEVELS.LEVELS[activeLevel].number+' / 7';
 if(tierNext)tierNext.textContent=activeLevel===LEVELS.LEVELS.length-1&&LEVELS.getLevels()[activeLevel].completed?'ALLE LEVELS BEHAALD':'LEVELDOEL · '+Math.max(0,goal-levelDistance)+' M';
 tierFlash=Math.max(0,tierFlash-dt);transition=Math.max(0,transition-dt);
 if(!vehicle){const wasAirborne=grandma.y<ground-grandma.h-2;grandma.vy+=(currentWorldRule().gravity||1850)*worldEventGravity()*dt;grandma.y=Math.min(ground-grandma.h,grandma.y+grandma.vy*dt);if(grandma.y>=ground-grandma.h){if(wasAirborne&&grandma.vy>260)landingPulse=1;grandma.vy=0;}}invulnerable=Math.max(0,invulnerable-dt);flash=Math.max(0,flash-dt);for(const c of clouds){c.x-=speed*.045*dt;if(c.x< -110)c.x=W+80}
if(vehicle){for(const p of particles){p.life-=dt}particles=particles.filter(p=>p.life>0);return;}spawnDistance+=speed*dt;candyDistance-=speed*dt;coinDistance-=speed*dt;
// Elke hindernis heeft een eigen tempo. Een kat kondigt zijn sprint eerst aan
// en versnelt daarna richting oma; het gat wordt op basis van die sprint bewaakt.
if(daily.active){
 for(const entry of daily.due(travel)){
  const type=allTypes.find(t=>t.id===entry.id);
  if(!type)continue;
  obstacles.push({type,x:grandma.x+650-(travel-entry.at),y:ground-type.h,
   w:type.w,h:type.h,attacking:false,charging:false,multiplier:1,
   hit:false,nearMiss:false,nearMissCandidate:false});
 }
}
if(!daily.active&&!vehicle&&spawnDistance>=nextDistance){
  const pool=allTypes.filter(t=>zoneTypes[currentTier%zoneTypes.length].includes(t.id)&&(elapsed>12||t.id!=='walker'));
  const type=(pool.length?pool:types)[Math.floor(replay.randomValue()*(pool.length?pool:types).length)];
  const attackBonus=currentWorldRule().attackBonus||0;const attacking=(type.id==='cat'&&replay.randomValue()<Math.min(.88,.55+attackBonus))||(type.id==='car'&&replay.randomValue()<Math.min(.94,.72+attackBonus));
  const multiplier=attacking?(type.id==='car'?1.95:1.62):1;
  obstacles.push({type,x:W+8,y:ground-type.h,w:type.w,h:type.h,attacking,
    chargeX:W-(type.id==='car'?175:105),charging:false,multiplier,hit:false,nearMiss:false,nearMissCandidate:false});
  spawnDistance=0;
  // Afwisseling: soms dicht op elkaar, soms een ruim herstelmoment.
  // Het minimum groeit mee met de snelheid en de sprongduur.
  const close=replay.randomValue()<(challengeTime>0?.68:.43);
  const flightTime=2*690/1850;
  const minimum=speed*(flightTime+.42)+105;
  nextDistance=minimum+(close?random(0,75):random(100,230));
  lastGap=nextDistance;
}
if(!daily.active&&coinDistance<=0){
 const count=replay.randomValue()<.35?5:3;
 const height=random(68,115);
 for(let i=0;i<count;i++)coinItems.push({x:W+35+i*43,y:ground-height-Math.sin(i/(count-1)*Math.PI)*25,height:height+Math.sin(i/(count-1)*Math.PI)*25,t:0,taken:false});
 coinDistance=random(1000,1700);
}
if(!daily.active&&candyDistance<=0){candies.push({x:W+40,y:ground-115,w:29,h:29,t:0});candyDistance=random(1550,2350)*(currentWorldRule().candyRate||1)}
for(const c of coinItems){c.x-=speed*dt;c.t+=dt;if(magnetTime>0&&c.x>grandma.x&&c.x-grandma.x<190){c.x-=Math.min(180,c.x-grandma.x)*dt*3;c.y+=(grandma.y+35-c.y)*dt*4}}coinItems=coinItems.filter(c=>c.x>-35&&!c.taken);
for(const o of obstacles){
  if(o.attacking&&!o.charging&&o.x<=o.chargeX)o.charging=true;
  o.x-=speed*(o.charging?o.multiplier:1)*dt;
}
updateDangerWarnings();
for(const c of candies){c.x-=speed*dt;c.t+=dt}obstacles=obstacles.filter(o=>o.x+o.w>-30);candies=candies.filter(c=>c.x+c.w>-30);for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
const body={x:grandma.x+7,y:grandma.y+7,w:grandma.w-13,h:grandma.h-9};
for(const o of obstacles){
 const obstacleBody={x:o.x+3,y:o.y+3,w:o.w-6,h:o.h-3};
 const horizontalOverlap=body.x<body.x+body.w&&body.x<obstacleBody.x+obstacleBody.w&&body.x+body.w>obstacleBody.x;
 const clearance=obstacleBody.y-(body.y+body.h);
 if(!o.hit&&horizontalOverlap&&clearance>=0&&clearance<=28)o.nearMissCandidate=true;
 if(!vehicle&&!o.hit&&rectHit(body,obstacleBody,7)){
  o.hit=true;
  if(invulnerable>0||boostTime>0)continue;
  if(shield){shield=0;perfectRunAlive=false;resetCombo();invulnerable=1.25;flash=.6;puff(grandma.x+25,grandma.y+25,'#ffcc65');statusEl.textContent='🍬 Snoepje gebruikt! Combo gereset.'}
  else{puff(grandma.x+20,grandma.y+25,'#e88999');triggerRecovery(o);return}
 }
}
for(const o of obstacles){
 if(!o.hit&&!o.nearMiss&&o.nearMissCandidate&&o.x+o.w<body.x){
  o.nearMiss=true;
  const focus=nearMissController.register();if(currentWorldRule().focusBonus)nearMissController.focus=Math.min(.04,nearMissController.focus+currentWorldRule().focusBonus+(worldEventTime>0&&currentTier%7===4?.01:0));
  grandmaExpressions.react('near_miss');nearMissRun++;if(!daily.active&&replay.mode!=='playback'){metaState.stats.nearMisses++;incrementMission('near');}registerCombo(comebackTime>0?2:1,'NEAR MISS · COMBO '+(comebackTime>0?'+2':'+1'));if(!daily.active&&replay.mode!=='playback'){addWorldMastery('nearMisses',1);evaluateAchievements();}
  recoveryFeedback=1.35;recoveryFeedbackText='NEAR\nMISS!';
  statusEl.textContent='NEAR MISS! +FOCUS · 🔥 '+combo;
 }
}
for(const c of candies){if(!c.taken&&rectHit(body,{x:c.x,y:c.y+Math.sin(c.t*5)*6,w:c.w,h:c.h},0)){c.taken=true;shield=1;puff(c.x,c.y,'#e89acc');statusEl.textContent='🍬 Snoepje gepakt! Eén botsing wordt opgevangen.'}}candies=candies.filter(c=>!c.taken);
for(const c of coinItems){if(rectHit(body,{x:c.x-10,y:c.y-12,w:24,h:24},0)){c.taken=true;const gain=Math.max(1,Math.round((currentWorldRule().coinValue||1)*worldEventCoinMultiplier()*comboMultiplier()*difficultyRule().reward*(comebackTime>0?1.25:1)));coins+=gain;coinsRun+=gain;metaState.stats.coinsCollected+=gain;incrementMission('coins',gain);registerCombo(1,'+'+gain+' 🪙');saveCoins();evaluateAchievements();playFeedback('coin');puff(c.x,c.y,'#ffcf49')}}
coinItems=coinItems.filter(c=>!c.taken);
}
function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}function line(x1,y1,x2,y2,color,width=3){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}function label(s,x,y,size=28){ctx.font=`${size}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,x,y)}
function background(tierIndex=currentTier){
 // Exactly one illustrated world renderer. The old duplicate scenery used
 // independent modulo-wrap loops and caused visual clutter and teleporting.
 const zone=((tierIndex%7)+7)%7,tier=TIERS[zone];
 const sky=ctx.createLinearGradient(0,0,0,ground);
 tier.sky.forEach((color,i)=>sky.addColorStop(i/2,color));
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 if(window.GrannyStorybook){
  window.GrannyStorybook.draw(ctx,{
   tier:tierIndex,travel,W,ground,elapsed,
   reducedMotion:reducedRecoveryMotion.matches
  });
 }
 // Quiet road surface: one horizon line and sparse, stable road markings.
 const road=ctx.createLinearGradient(0,ground,0,H);
 tier.road.forEach((color,i)=>road.addColorStop(i/2,color));
 ctx.fillStyle=road;ctx.fillRect(0,ground,W,H-ground);
 ctx.fillStyle=zone===4||zone===6?'#39334e':'#56445a';
 ctx.fillRect(0,ground,W,4);
 const spacing=215;
 const phase=((travel%spacing)+spacing)%spacing;
 ctx.fillStyle=zone===4||zone===6?'#d8c9e388':'#f5dfc288';
 for(let x=-spacing-phase;x<W+spacing;x+=spacing)
  rounded(x,ground+Math.min(35,(H-ground)*.23),42,3,2,ctx.fillStyle);
}
function drawGrandma(){const outfit=clothing.find(c=>c.id===selectedClothes)||clothing[0];const x=grandma.x,y=grandma.y,bob=grandma.vy===0?Math.sin(walk)*2:0;const mood=grandmaExpressions.resolve({
 state,vehicle,airborne:Math.abs(grandma.vy)>25,
 danger:state==='playing'&&!vehicle&&obstacles.some(o=>o.x>grandma.x+grandma.w&&o.x<grandma.x+grandma.w+175)
});
const pose=grandmaExpressions.pose(mood,reducedRecoveryMotion.matches);
ctx.save();
if(pose.tilt){
 ctx.translate(x+23,y+grandma.h);
 ctx.rotate(pose.tilt);
 ctx.translate(-(x+23),-(y+grandma.h));
}if(metaState.collections.includes('golden-granny')){for(let i=0;i<3;i++)ellipse(x-12-i*10,y+48+Math.sin(walk+i)*6,2.5,2.5,'#f4c64f')}if(metaState.collections.includes('star-style')){ctx.save();ctx.strokeStyle='#d7b6ff';ctx.lineWidth=2;ctx.globalAlpha=.7;ctx.strokeRect(x-5,y-7,grandma.w+10,grandma.h+12);ctx.restore()}const squash=landingPulse&&!reducedRecoveryMotion.matches?Math.sin(landingPulse*Math.PI)*.08:0;if(squash){ctx.save();ctx.translate(x+grandma.w/2,y+grandma.h);ctx.scale(1+squash,1-squash);ctx.translate(-(x+grandma.w/2),-(y+grandma.h));}if(shield){ctx.strokeStyle='#f5a1d0';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x+23,y+35,36,48,0,0,Math.PI*2);ctx.stroke();label('✦',x+51,y-6,20)}if(invulnerable>0&&!vehicle&&Math.floor(invulnerable*12)%2===0){if(squash)ctx.restore();ctx.restore();return;}ellipse(x+23,ground+1,24,5,'#bda887');line(x+16,y+52+bob,x+12+(grandma.vy===0?Math.sin(walk)*5:0),y+68,'#493e49',6);line(x+31,y+52+bob,x+34-(grandma.vy===0?Math.sin(walk)*5:0),y+68,'#493e49',6);rounded(x+3,y+27+bob,40,34,13,outfit.color);rounded(x+7,y+27+bob,32,25,10,outfit.color);drawOutfitPattern(outfit,x,y,bob);line(x+8,y+36+bob,x-1,y+50+bob-pose.armSwing*7,'#efc6a8',7);line(x+38,y+35+bob,x+47,y+47+bob-pose.armSwing*7,'#efc6a8',7);ellipse(x+23,y+16+bob,19,20,'#efc6a8');ellipse(x+20,y+0+bob,21,10,outfit.hair);ellipse(x+6,y+11+bob,7,12,outfit.hair);ellipse(x+37,y+10+bob,7,12,outfit.hair);ellipse(x+39,y+2+bob,8,9,outfit.hair);rounded(x+10,y+14+bob,27,9,4,'#493e49');rounded(x+12,y+15+bob,10,7,3,'#e9f4ee');rounded(x+25,y+15+bob,10,7,3,'#e9f4ee');line(x+21,y+18+bob,x+25,y+18+bob,'#493e49',2);grandmaExpressions.drawFace(ctx,x,y,bob,mood,reducedRecoveryMotion.matches);
 if(vehicle==='plane'){ctx.save();ctx.translate(x-37,y+37);rounded(0,0,128,24,12,'#d8e9f0');rounded(40,-17,44,20,8,'#6ea4c6');rounded(18,13,87,11,5,'#e49b60');ellipse(10,10,11,11,'#f6cb69');ctx.restore()}
 if(selectedAccessories.cane==='cane-gold')line(x+48,y+43+bob,x+50,y+70,'#d7a634',5);
 if(selectedAccessories.glasses==='glasses-heart'){label('💗',x+17,y+18+bob,11);label('💗',x+31,y+18+bob,11)}
 if(selectedAccessories.glasses==='glasses-star'){label('⭐',x+17,y+18+bob,10);label('⭐',x+31,y+18+bob,10)}
 // Companions are three times their previous display size and face Granny.
 // This is cosmetic only: no collision boxes or game balance are affected.
 if(selectedAccessories.companion==='companion-duck'||selectedAccessories.companion==='companion-cat'){
  const duck=selectedAccessories.companion==='companion-duck';
  ctx.save();
  ctx.translate(x-51,ground-31-Math.abs(Math.sin(walk*(duck?.8:.65)))*4);
  ctx.scale(-1,1);
  label(duck?'🦆':'🐈',0,0,duck?60:63);
  ctx.restore();
 }
 if(vehicle==='booster'){ctx.save();ctx.translate(x-20,y+35);rounded(0,0,86,30,12,'#6655a5');rounded(9,5,68,13,6,'#a2bce1');ellipse(5,15,10,10,'#33364e');ellipse(82,15,10,10,'#33364e');for(let i=0;i<3;i++)line(-8-i*13,10,0-i*13,20,'#f6b353',4);ctx.restore()}
 if(squash)ctx.restore();
 ctx.restore();
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
function absorbWorldEventHit(obstacle){
 // An already earned shield still works in special modes; upgrades in the
 // Gadget Garage grant one when their matching world event begins.
 if(invulnerable>0)return true;
 if(!shield)return false;
 shield=0;invulnerable=1.4;flash=.45;
 if(obstacle)modeObstacles=modeObstacles.filter(item=>item!==obstacle);
 statusEl.textContent='🛡️ Schild beschermt oma tijdens het wereldevent!';
 return true;
}
function finishVehicle(){
 grandmaExpressions.react('safe');
 document.getElementById('game').classList.remove('scooter-mode');vehicle=null;vehicleTime=0;modeObstacles=[];modeGraceTime=0;grandma.y=ground-grandma.h;grandma.vy=0;
 invulnerable=2;vehicleSpawnWait=random(38,68);spawnDistance=0;nextDistance=550;
 document.getElementById('jumpBtn').textContent='↑ Spring!';
 statusEl.textContent='Oma is weer te voet!';
}
function drawVehicleMode(){
 const plane=vehicle==='plane';
 const eventWorld=worldEvents.current?.world??currentTier%7;
 const eventTheme=TIERS[eventWorld];
 const eventColor=worldEvents.current?.accent||'#b2d6cf';
 ctx.save();
 if(plane){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,eventTheme.sky[0]);g.addColorStop(1,eventTheme.sky[2]);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let i=0;i<12;i++){const x=((i*151-modeDistance*.17)%(W+170)+(W+170))%(W+170)-80;ellipse(x,65+(i%5)*94,55,16,'#fff9ed');ellipse(x+21,53+(i%5)*94,31,21,'#fff9ed')}
  for(const o of modeObstacles){
   rounded(o.x,-15,o.w,o.top+15,8,'#435c85');rounded(o.x,o.top+o.gap,o.w,H-o.top-o.gap+15,8,'#435c85');
   rounded(o.x-5,o.top-18,o.w+10,18,4,'#f0b768');rounded(o.x-5,o.top+o.gap,o.w+10,18,4,'#f0b768');
   for(let y=18;y<o.top-20;y+=34)rounded(o.x+13,y,o.w-26,9,3,'#b9d6e4');
   for(let y=o.top+o.gap+28;y<H;y+=34)rounded(o.x+13,y,o.w-26,9,3,'#b9d6e4');
  }
  drawGrandma();
  rounded(15,H-70,W-30,48,12,'#ffffffdd');ctx.fillStyle='#302b48';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.fillText('✈️ Tik = fladderen · ontwijk de muren',W/2,H-40);
 }else{
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,eventTheme.sky[0]);sky.addColorStop(.6,eventTheme.sky[1]);sky.addColorStop(1,eventTheme.sky[2]);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  const horizon=H*.29,cx=W/2;
  ctx.save();ctx.globalAlpha=.5;ellipse(W*.79,H*.18,27,27,eventColor);ctx.restore();
  for(let i=0;i<14;i++){const x=i*110-(modeDistance*.12%110);rounded(x,horizon-65-(i%3)*30,75,110+(i%3)*30,3,i%2?'#b6c8bd':'#c5b6b1');for(let j=0;j<3;j++)rounded(x+12+j*20,horizon-44,11,16,1,'#fff2bd')}
  ctx.fillStyle='#595768';ctx.beginPath();ctx.moveTo(cx-48,horizon);ctx.lineTo(cx+48,horizon);ctx.lineTo(W+140,H);ctx.lineTo(-140,H);ctx.closePath();ctx.fill();
  for(let l=1;l<3;l++){ctx.strokeStyle='#fff2cf';ctx.lineWidth=3;ctx.setLineDash([24,23]);ctx.beginPath();ctx.moveTo(cx+(l-1.5)*32,horizon);ctx.lineTo(cx+(l-1.5)*W*.7,H);ctx.stroke();ctx.setLineDash([])}
  for(const o of modeObstacles){
   const depth=Math.max(.02,1.2-o.z),scale=.16+depth*1.1;
   const x=cx+(o.lane-1)*depth*W*.31,y=horizon+depth*depth*(H-horizon)*.85;
   const w=54*scale,h=65*scale;
   rounded(x-w/2,y-h,w,h,5*scale,o.kind==='car'?'#df6269':'#f5b95e');
   rounded(x-w*.33,y-h*.83,w*.66,h*.3,3,'#b7e0e7');
   rounded(x-w*.45,y-h*.19,w*.9,h*.13,2,'#3c354c');
   ctx.fillStyle='#fff6dc';ctx.font=`bold ${Math.max(10,13*scale)}px system-ui`;ctx.textAlign='center';ctx.fillText(o.kind==='car'?'AUTO':'STOP',x,y-h*.39);
  }
  // Rear-view grandma in mobility scooter, moving between three lanes.
  const px=cx+(vehicleLane-1)*W*.28,py=H*.83;
  ellipse(px,py+28,56,13,'#25213b55');
  rounded(px-45,py-21,90,46,16,'#51469a');rounded(px-34,py-13,68,29,12,'#a4a4d9');
  ellipse(px-34,py+23,14,14,'#292b40');ellipse(px+34,py+23,14,14,'#292b40');
  rounded(px-23,py-73,46,60,18,(clothing.find(c=>c.id===selectedClothes)||clothing[0]).color);
  ellipse(px,py-87,24,25,'#f1c8aa');ellipse(px,py-102,25,12,'#f2f0ed');
  line(px-31,py-42,px+31,py-42,'#342b43',5);
  rounded(15,H-57,W-30,38,10,'#fff9e6df');ctx.fillStyle='#302b48';ctx.font='bold 16px system-ui';ctx.textAlign='center';ctx.fillText('🛵 Gebruik LINKS en RECHTS · ontwijk verkeer',W/2,H-33);
 }
 ctx.fillStyle='#fff9ec';ctx.strokeStyle='#342b43';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(W/2-80,16,160,42,12);ctx.fill();ctx.stroke();
 ctx.fillStyle='#342b43';ctx.textAlign='center';ctx.font='900 20px system-ui';ctx.fillText((plane?'✈️':'🛵')+' '+Math.ceil(vehicleTime)+' s',W/2,44);
 ctx.restore();
}
function render(){
 if(vehicle){
  if(worldEvents.opacity<1){background(currentTier);drawGrandma();}
  ctx.save();ctx.globalAlpha=worldEvents.opacity;drawVehicleMode();ctx.restore();drawReplayGhost();return;
 }
 ctx.save();
 if(recoveryCameraSettle>0&&!reducedRecoveryMotion.matches){
  const strength=recoveryCameraSettle/.24;
  const wobble=Math.sin((1-strength)*Math.PI*3)*strength;
  ctx.translate(wobble*4,Math.abs(wobble)*1.5);
 }
 // Preview the next illustrated world before reaching the actual tier boundary.
 // Roadmap/gameplay switches at the usual 500 m; only scenery blends early.
 const approaching=0,lastWorld=true;
 const blend=(!lastWorld&&state==='playing'&&approaching>=420)
   ? Math.max(0,Math.min(1,(approaching-455)/45)):0;
 if(blend>0){
  background(currentTier);
  ctx.save();ctx.globalAlpha=blend;background(currentTier+1);ctx.restore();
 }else if(transition>0){
  background(previousTier);
  ctx.save();ctx.globalAlpha=1-transition/2.8;background(currentTier);ctx.restore();
 }else background();

 const tier=TIERS[currentTier%TIERS.length];
 // Tier is painted inside the world, rather than outside the game frame.
 if(state!=='recovery'){
  ctx.save();ctx.textAlign='center';
  ctx.font='900 23px system-ui';ctx.fillStyle=(currentTier===4||currentTier>=6)?'#fff':'#493e49';
  ctx.globalAlpha=.82;
  ctx.fillText(`TIER ${currentTier+1}`,W/2,Math.max(108,ground*.35));
  ctx.font='800 15px system-ui';ctx.fillText(tier.name.toUpperCase(),W/2,Math.max(132,ground*.35+23));
  ctx.restore();
 }
 if(tierFlash>0&&state!=='recovery'){
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
for(const c of candies)drawCandy(c);for(const o of obstacles)drawObstacle(o);drawRecoveryGrandma();drawRecoveryMeter();drawLastSecondGrab();drawRecoveryFeedback();for(const p of particles)ellipse(p.x,p.y,4,4,p.color);for(const p of rewardPopups){ctx.save();ctx.globalAlpha=Math.min(1,p.life*1.7);ctx.textAlign='center';ctx.font='900 17px system-ui';ctx.strokeStyle='#493e49';ctx.lineWidth=4;ctx.fillStyle='#ffdc70';ctx.strokeText(p.text,p.x,p.y);ctx.fillText(p.text,p.x,p.y);ctx.restore();}if(boostTime>0){rounded(18,57,175,32,10,'#fff2b6');ctx.fillStyle='#493e49';ctx.font='bold 15px system-ui';ctx.fillText('⚡ Turbo '+Math.ceil(boostTime)+'s',29,79)}if(comboBurstTime>0){ctx.save();ctx.globalAlpha=Math.min(.22,comboBurstTime*.14);ctx.fillStyle='#ffd866';ctx.fillRect(0,0,W,H);ctx.restore()}if(worldEventTime>0&&currentTier%7===3){ctx.save();ctx.globalAlpha=.12;ctx.fillStyle='#d49a63';for(let i=0;i<24;i++)ctx.fillRect((i*79+elapsed*95)%W,(i*43)%ground,18,3);ctx.restore()}if(flash>0){ctx.fillStyle=`rgba(255,220,140,${flash*.3})`;ctx.fillRect(0,0,W,H)}ctx.restore();drawReplayGhost()}
let dailyFixedAccumulator=0;
function replayStep(){
 replayStepping=true;
 replay.beforeTick(applyReplayInput);
 if(state==='grab')updateLastSecondGrab(window.GrannyReplay.DT);
 else if(state==='recovery')updateRecovery(window.GrannyReplay.DT);
 else if(state==='playing')update(window.GrannyReplay.DT);
 replay.afterTick(replayFrame());replayStepping=false;
 if(state==='over')finishReplayRecording();
}
function frame(now){
 if(state!=='playing'&&state!=='recovery'&&state!=='grab')return;
 const raw=Math.max(0,(now-last)/1000);
 last=now;replayAccumulator+=Math.min(raw,.25);
 let steps=0;
 while((state==='playing'||state==='recovery'||state==='grab')&&replayAccumulator>=window.GrannyReplay.DT&&steps<15){
  replayStep();replayAccumulator-=window.GrannyReplay.DT;steps++;
 }
 render();
 if(typeof updateReplayDebugPanel==='function')updateReplayDebugPanel();
 if(state==='playing'||state==='recovery'||state==='grab')requestAnimationFrame(frame);
}
if(window.GrannyStorybook)window.GrannyStorybook.installMap(
 ()=>({score,best,currentTier,startTierOffset,state}),pause,
 index=>{
  if(!LEVELS.select(index))return false;
  metaState.settings.startWorld=LEVELS.LEVELS[index].worldIndex;saveMetaState();
  if(state==='ready'||state==='over'||state==='paused')returnHome();
  return true;
 }
);
// Debug-only test entry points: never exposed during normal gameplay.
if(new URLSearchParams(location.search).get('debug')==='1'){
 const replayDebug=document.createElement('div');
replayDebug.id='replayDebugPanel';replayDebug.className='replay-debug-panel';replayDebug.hidden=true;
replayDebug.innerHTML='<b>REPLAY DEBUG · <span id="replayDebugState">READY</span></b>'+
 '<button type="button" id="copyReplay">COPY REPLAY</button>'+
 '<button type="button" id="loadReplay">LOAD REPLAY</button>'+
 '<span id="replayDebugMessage" role="status"></span>';
document.body.appendChild(replayDebug);
function replayDebugMessage(message){document.getElementById('replayDebugMessage').textContent=message;}
document.getElementById('copyReplay').addEventListener('click',async()=>{
 const tape=replay.mode==='record'?replay.tape:replay.restore(localStorage);
 if(!tape){replayDebugMessage('Nog geen opname beschikbaar.');return;}
 const str=JSON.stringify(tape);
 try{await navigator.clipboard.writeText(str);replayDebugMessage('Opname gekopieerd · '+tape.ruleset);}
 catch(e){const box=window.prompt('Kopieer de replay-JSON',str);replayDebugMessage(box===null?'Kopiëren geannuleerd.':'Selecteer en kopieer de JSON.');}
});
document.getElementById('loadReplay').addEventListener('click',()=>{
 const value=window.prompt('Plak de replay-JSON (zelfde rulesetversie):');
 if(!value)return;
 try{
  const tape=window.GrannyReplay.ensureTape(value);
  if(state!=='ready')returnHome();
  pendingReplayTape=tape;start();
  replayDebugMessage('Replay geladen · seed '+tape.seed);
 }catch(e){replayDebugMessage(e.message);}
});
function updateReplayDebugPanel(){
 if(replayDebug.hidden)return;
 document.getElementById('replayDebugState').textContent=
  replay.mode.toUpperCase()+' · '+replay.tick+' ticks'+(replay.error?' · DESYNC':'');
 if(replay.error)replayDebugMessage(replay.error);
}

 replayDebug.hidden=false;
 window.__grannyDebug={fall:()=>end(),result:()=>showRunResult(),retry:()=>retryRun(),
  setWorldForTest:world=>{if(state==='playing'&&!worldEvents.used)currentTier=Math.max(0,Math.min(6,world|0));},
  advanceWorldEventForTest:seconds=>{for(let i=0;i<Math.ceil(seconds/.05);i++)tickWorldEvent(.05);},
  dangerTestObstacle:(id='cat',seconds=.7)=>{
   if(state!=='playing'||runFlow.current!==GameState.RUNNING)return false;
   const type=allTypes.find(t=>t.id===id)||allTypes[0];
   const x=grandma.x+grandma.w-13+Math.max(.2,Math.min(1.2,seconds))*speed-3;
   const item={type,x,y:ground-type.h,w:type.w,h:type.h,
    attacking:false,charging:false,multiplier:1,hit:false,nearMiss:false};
   obstacles=[item];updateDangerWarnings();return true;
  },
  dangerTestClear:()=>{obstacles=[];updateDangerWarnings();},

  dailyAdvanceForTest:seconds=>{if(daily.active){daily.elapsed=Math.min(daily.config.duration,daily.elapsed+Math.max(0,seconds));if(daily.elapsed>=daily.config.duration)finishDailyRun('completed');}},
  exportReplay:()=>replay.tape?JSON.stringify(replay.tape):null,
  loadReplay:json=>{const tape=window.GrannyReplay.ensureTape(json);if(state!=='ready')returnHome();pendingReplayTape=tape;start();return true;},
  grabTestForTest:()=>{if(state!=='playing')return false;lastSecondGrab.offer({type:{id:'walker'},x:grandma.x+40,y:ground-62,w:65,h:62},0);balanceController.hit();flowTo(GameState.RECOVERY);state='recovery';finishRecovery('miss');return state==='grab';},
  grabInfoForTest:()=>({active:lastSecondGrab.active,elapsed:lastSecondGrab.elapsed,flow:runFlow.current}),
  replayStepForTest:(count=1)=>{for(let i=0;i<count&&(state==='playing'||state==='recovery'||state==='grab');i++)replayStep();render();},
  replayInfo:()=>({mode:replay.mode,tick:replay.tick,seed:replay.tape?.seed,
    ruleset:replay.tape?.ruleset,error:replay.error,ghost:replay.ghostEnabled,
    inputCount:replay.inputs.length,frameCount:replay.frames.length}),
  snapshot:()=>({daily:daily.config?{active:daily.active,finished:daily.finished,date:daily.config.date,seed:daily.config.seed,elapsed:daily.elapsed,index:daily.index,reason:daily.reason}:null,state,flow:runFlow.current,phase:postRun.phase,score,warningVisible:!warningEl.hidden,dangerCues:dangerDirector.count,
   obstacles:obstacles.length,coins,
   worldEvent:{phase:worldEvents.phase,id:worldEvents.current?.id||null,
    eventCount:worldEvents.eventCount,used:worldEvents.used,elapsed:worldEvents.elapsed,
    remaining:worldEvents.remaining,reason:worldEvents.reason}})};
}
reconcileWorldMastery();reset();showMenu('home');resizeGame();requestAnimationFrame(resizeGame);
// Rescale canvas world when the header is hidden/revealed or mobile browser chrome
// changes usable viewport height; keep physics coordinates aligned with CSS pixels.
if(typeof ResizeObserver!=='undefined'){
 const gameplayResizeObserver=new ResizeObserver(()=>resizeGame());
 gameplayResizeObserver.observe(document.getElementById('game'));
}
})();
