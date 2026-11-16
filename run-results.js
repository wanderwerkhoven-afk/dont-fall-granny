/* Improvement 11 — one in-world rescue → result → retry presentation.
 * UI and summary are independent of physics; no reload, no duplicate rewards.
 */
(()=>{'use strict';
const RESULT_PRIORITY=Object.freeze({
 OUTFIT_UNLOCK:100,WORLD_DISCOVERED:90,NEW_RECORD:80,ADVENTURE_UNLOCK:70,
 BEST_COMBO:50,PERFECT_SAVES:40,COINS:10
});
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
class RunSummaryBuilder{
 static build(run={}){
  const distance=Math.max(0,Math.floor(run.distance||0));
  const previousBest=Math.max(0,Math.floor(run.previousBest||0));
  const delta=Math.max(0,distance-previousBest);
  const options=[];
  const add=(key,label,reward=null)=>options.push({key,label,priority:RESULT_PRIORITY[key],reward});
  if(run.outfitUnlock?.name)add('OUTFIT_UNLOCK','Nieuwe outfit: '+run.outfitUnlock.name,run.outfitUnlock);
  if(run.worldDiscovered?.name)add('WORLD_DISCOVERED','Nieuwe wereld: '+run.worldDiscovered.name);
  if(delta>0)add('NEW_RECORD','Nieuw record · +'+delta+' m');
  if(run.adventureUnlock?.name)add('ADVENTURE_UNLOCK','Nieuw: '+run.adventureUnlock.name,run.adventureUnlock);
  if((run.bestCombo||0)>=2)add('BEST_COMBO','Beste combo ×'+Math.floor(run.bestCombo));
  if((run.perfectSaves||0)>0)add('PERFECT_SAVES',Math.floor(run.perfectSaves)+' Perfect Saves');
  if((run.coins||0)>0)add('COINS','+'+Math.floor(run.coins)+' munten');
  options.sort((a,b)=>b.priority-a.priority);
  const highlights=options.slice(0,3);
  const reward=options.find(x=>x.reward)?.reward||null;
  const size=options.some(x=>x.priority>=90)?'celebration':highlights.length>=2?'standard':'compact';
  return Object.freeze({distance,delta,highlights,reward,size});
 }
}
class RunResultOverlay{
 constructor(game,handlers){
  this.game=game;this.handlers=handlers;this.phase='hidden';this.visibleAt=0;
  this.root=document.createElement('div');
  this.root.id='postRunOverlay';this.root.className='post-run-overlay';
  this.root.hidden=true;
  this.root.setAttribute('aria-label','Granny rescue en runresultaat');
  this.root.innerHTML='<div class="post-run-dim"></div><div class="post-run-focus" aria-hidden="true"></div>'+
  '<div class="post-run-card" role="group" aria-label="Rescue en resultaat">'+
  '<div class="post-run-tag">OMA’S AVONTUUR</div>'+
  '<h2 id="postRunHeading">Oeps… daar gaat oma.</h2>'+
  '<div class="post-run-distance" aria-live="off"><strong id="postRunDistance">0</strong><span> m</span></div>'+
  '<p id="postRunRecord" class="post-run-record"></p>'+
  '<div id="postRunRescue" class="post-run-rescue">'+
  '<div class="post-run-timer" id="postRunTimer" role="timer" aria-live="off">10 s</div>'+
  '<p>Red oma voordat de tijd voorbij is!</p>'+
  '<div class="post-run-rescue-actions">'+
  '<button type="button" id="postRunRevive">❤️ Red oma · 10 munten</button>'+
  '<button type="button" id="postRunBoost">⚡ Turbo · 6 munten</button></div>'+
  '<button type="button" id="postRunSkip" class="post-run-link">Bekijk resultaat</button></div>'+
  '<div id="postRunResult" class="post-run-result" hidden>'+
  '<div class="post-run-highlights" id="postRunHighlights"></div>'+
  '<div class="post-run-reward" id="postRunReward" hidden></div>'+
  '<button type="button" id="postRunRetry" class="post-run-retry">NOG EEN KEER</button>'+
  '<button type="button" id="postRunHome" class="post-run-link">⌂ Home</button></div></div>';
  game.appendChild(this.root);
  this.card=this.root.querySelector('.post-run-card');
  this.distance=this.root.querySelector('#postRunDistance');
  this.results=this.root.querySelector('#postRunResult');
  this.rescue=this.root.querySelector('#postRunRescue');
  this.heading=this.root.querySelector('#postRunHeading');
  this.timer=this.root.querySelector('#postRunTimer');
  this.root.querySelector('#postRunRevive').addEventListener('click',()=>handlers.revive(false));
  this.root.querySelector('#postRunBoost').addEventListener('click',()=>handlers.revive(true));
  this.root.querySelector('#postRunSkip').addEventListener('click',()=>handlers.finish());
  this.root.querySelector('#postRunRetry').addEventListener('click',()=>handlers.retry());
  this.root.querySelector('#postRunHome').addEventListener('click',()=>handlers.home());
  this.root.addEventListener('pointerdown',event=>{
   // Only the dimmed scenery supports tap-to-retry, never the first rescue tap.
   if(this.phase==='result'&&event.target===this.root&&this.canTapRetry()){
    event.preventDefault();handlers.retry();
   }
  });
 }
 setGrannyPosition({x=110,y=240,w=43,h=70,sceneWidth=900,sceneHeight=390}={}){
  this.root.style.setProperty('--post-granny-x',(100*(x+w*.5)/Math.max(1,sceneWidth)).toFixed(2)+'%');
  this.root.style.setProperty('--post-granny-y',(100*(y+h*.5)/Math.max(1,sceneHeight)).toFixed(2)+'%');
 }
 hide(){
  this.phase='hidden';this.visibleAt=0;this.root.hidden=true;this.root.classList.remove('result-phase','rescue-phase');
 }
 showRescue({distance=0,coins=0,deadline=0,canRevive=true}={}){
  this.root.hidden=false;this.phase='rescue';this.visibleAt=0;this.deadline=deadline;
  this.root.classList.remove('result-phase');this.root.classList.add('rescue-phase');
  this.card.dataset.size='compact';this.heading.textContent='Oeps… daar gaat oma.';
  this.distance.textContent=String(Math.floor(distance));
  this.root.querySelector('#postRunRecord').textContent='';
  this.results.hidden=true;this.rescue.hidden=false;
  this.root.querySelector('#postRunRevive').disabled=coins<10;
  this.root.querySelector('#postRunBoost').disabled=coins<6;
  this.rescue.querySelector('p').textContent=canRevive?'Red oma voordat de tijd voorbij is!':'Oma is gevallen. Bekijk je resultaat.';
  this.setRemaining((deadline-performance.now())/1000);
 }
 setRemaining(seconds){
  if(this.phase!=='rescue')return;
  const n=Math.max(0,Math.ceil(seconds));
  this.timer.textContent=n+' s';
  this.timer.style.setProperty('--rescue-progress',Math.max(0,Math.min(1,seconds/10))*100+'%');
  this.root.style.setProperty('--rescue-progress',Math.max(0,Math.min(1,seconds/10))*100+'%');
 }
 showResult(summary,{reducedMotion=false}={}){
  this.root.hidden=false;this.phase='result';this.visibleAt=performance.now();
  this.root.classList.remove('rescue-phase');this.root.classList.add('result-phase');
  this.card.dataset.size=summary.size;this.heading.textContent='Oeps… daar gaat oma.';
  this.rescue.hidden=true;this.results.hidden=false;
  this.root.querySelector('#postRunRecord').textContent=summary.delta>0?'NIEUW RECORD · +'+summary.delta+' m':'';
  this.root.querySelector('#postRunHighlights').innerHTML=summary.highlights.map(h=>
   '<div class="post-run-highlight">'+escapeHtml(h.label)+'</div>').join('');
  const reward=this.root.querySelector('#postRunReward');
  reward.hidden=!summary.reward;
  reward.innerHTML=summary.reward?'<div class="post-run-book" aria-label="Nieuwe beloning">'+
   '<span class="post-run-sticker">★</span><span>ADVENTURE BOOK<br><b>'+
   escapeHtml(summary.reward.name)+'</b></span></div>':'';
  const starting=0;
  this.distance.textContent='0';
  if(this.counter)cancelAnimationFrame(this.counter);
  if(reducedMotion){this.distance.textContent=String(summary.distance);return;}
  const started=performance.now();
  const animate=now=>{
   if(this.phase!=='result')return;
   const p=Math.min(1,(now-started)/440);
   this.distance.textContent=String(Math.floor(starting+(summary.distance-starting)*(1-(1-p)**3)));
   if(p<1)this.counter=requestAnimationFrame(animate);
  };
  this.counter=requestAnimationFrame(animate);
 }
 canTapRetry(){return this.phase==='result'&&performance.now()-this.visibleAt>=700;}
}
window.GrannyPostRun={RESULT_PRIORITY,RunSummaryBuilder,RunResultOverlay};
})();