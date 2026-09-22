from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
def replace_once(old,new):
 global s
 assert s.count(old)==1, ('Expected one anchor',old[:100],s.count(old))
 s=s.replace(old,new,1)
assert 'class RecoveryWindowController{' not in s
css='''
/* In-world recovery: the balance arc replaces the ordinary score HUD, never a popup. */
.game.recovery-mode .scoreboard,.game.recovery-mode .tier-track{visibility:hidden}
'''
replace_once('</style>',css+'</style>')
controller='''
// Current single-file game has no separate Balance/Fall controllers: keep this small
// deterministic window integrated with the existing collision -> rescue -> game-over flow.
class RecoveryWindowController{
 constructor(){this.duration=.9;this.active=false;this.position=0;this.elapsed=0;this.safeMin=.38;this.safeMax=.62;this.perfectMin=.47;this.perfectMax=.53;}
 begin(distance){
  this.active=true;this.elapsed=0;this.position=0;
  const shrink=Math.min(.065,Math.floor(distance/1000)*.008);
  this.safeMin=.38+shrink;this.safeMax=.62-shrink;
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
const recoveryWindow=new RecoveryWindowController();
const reducedRecoveryMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let balance=1,recoveryBoost=0,recoverySlow=0,recoveryFeedback=0,recoveryFeedbackText='',recoverySettle=0;
function triggerRecovery(){
 if(state!=='playing'||vehicle)return;
 recoveryWindow.begin(score);balance=.25;state='recovery';
 document.getElementById('game').classList.add('recovery-mode');
 statusEl.textContent='BALANS! Tik wanneer de wijzer in het geel staat.';
}
function finishRecovery(result){
 document.getElementById('game').classList.remove('recovery-mode');
 recoveryWindow.reset();
 if(result==='miss'){balance=0;end();return;}
 balance=result==='perfect'?1:.65;
 recoveryBoost=result==='perfect'?1.5:0;
 recoverySlow=result==='safe'?1.6:0;
 recoverySettle=result==='perfect'&&!reducedRecoveryMotion.matches?.26:0;
 recoveryFeedback=1.05;
 recoveryFeedbackText=result==='perfect'?'PERFECT SAVE!':'GERED!';
 invulnerable=1.2;state='playing';
 statusEl.textContent=result==='perfect'?'PERFECT SAVE! Korte snelheidsboost.':'Net gered! Oma moet even op snelheid komen.';
}
function attemptRecovery(){
 if(state!=='recovery')return false;
 finishRecovery(recoveryWindow.resolve());return true;
}
function updateRecovery(dt){if(recoveryWindow.tick(dt))finishRecovery('miss');}
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
 ctx.save();ctx.globalAlpha=Math.min(1,recoveryFeedback*2);
 ctx.font='900 19px system-ui';ctx.textAlign='center';
 ctx.strokeStyle='#493e49';ctx.lineWidth=4;
 ctx.strokeText(recoveryFeedbackText,grandma.x+grandma.w/2+22,grandma.y-30);
 ctx.fillStyle='#ffcc65';ctx.fillText(recoveryFeedbackText,grandma.x+grandma.w/2+22,grandma.y-30);
 ctx.restore();
}
'''
replace_once('const allTypes=[...types,...extras];', 'const allTypes=[...types,...extras];'+controller)
replace_once("function random(a,b){return a+Math.random()*(b-a)}function reset(){", "function random(a,b){return a+Math.random()*(b-a)}function reset(){recoveryWindow.reset();document.getElementById('game').classList.remove('recovery-mode');balance=1;recoveryBoost=0;recoverySlow=0;recoveryFeedback=0;recoverySettle=0;")
replace_once('function start(){stopDeathTimer();showMenu(\'home\');reset();', "function start(){stopDeathTimer();showMenu('home');reset();")
replace_once('function end(){\n if(vehicle)', "function end(){\n recoveryWindow.reset();document.getElementById('game').classList.remove('recovery-mode');\n if(vehicle)")
replace_once("function pause(){if(state==='playing')", "function pause(){if(state==='recovery')return;if(state==='playing')")
replace_once("function jump(){if(state!=='playing'&&vehicle)return;", "function jump(){if(state==='recovery'){attemptRecovery();return}if(state!=='playing'&&vehicle)return;")
replace_once("function update(dt){elapsed+=dt;walk+=dt*11;speed=245+elapsed*2.15+Math.max(0,elapsed-35)*.65;travel+=speed*dt;", "function update(dt){elapsed+=dt;walk+=dt*11;recoveryBoost=Math.max(0,recoveryBoost-dt);recoverySlow=Math.max(0,recoverySlow-dt);recoveryFeedback=Math.max(0,recoveryFeedback-dt);recoverySettle=Math.max(0,recoverySettle-dt);speed=(245+elapsed*2.15+Math.max(0,elapsed-35)*.65)*(recoverySlow>0?.78:1)+(recoveryBoost>0?65:0);travel+=speed*dt;")
replace_once("else{puff(grandma.x+20,grandma.y+25,'#e88999');end();return}","else{puff(grandma.x+20,grandma.y+25,'#e88999');triggerRecovery();return}")
replace_once("for(const c of candies)drawCandy(c);for(const o of obstacles)drawObstacle(o);drawGrandma();for(const p of particles)", "for(const c of candies)drawCandy(c);for(const o of obstacles)drawObstacle(o);drawRecoveryGrandma();drawRecoveryMeter();drawRecoveryFeedback();for(const p of particles)")
replace_once("function frame(now){if(state!=='playing')return;const dt=Math.max(0,Math.min((now-last)/1000,.035));last=now;update(dt);render();if(state==='playing')requestAnimationFrame(frame)}", "function frame(now){if(state!=='playing'&&state!=='recovery')return;const dt=Math.max(0,Math.min((now-last)/1000,.035));last=now;if(state==='recovery')updateRecovery(dt);else update(dt);render();if(state==='playing'||state==='recovery')requestAnimationFrame(frame)}")
# The recovery HUD is in-canvas, so the ordinary in-world tier text should also yield focus.
replace_once(" ctx.save();ctx.textAlign='center';\n ctx.font='900 23px system-ui';", " ctx.save();ctx.textAlign='center';\n if(state==='recovery')ctx.globalAlpha=0;\n ctx.font='900 23px system-ui';")
# Do not run the decorative tier celebration across an active timing window.
replace_once(' if(tierFlash>0){\n  const alpha=', " if(tierFlash>0&&state!=='recovery'){\n  const alpha=")
p.write_text(s,encoding='utf-8')
t=Path('tests/recovery-skill-check.mjs')
t.write_text('''import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
const script=html.split('<script>')[1]?.split('</script>')[0];
assert.ok(script);new Function(script);
const snippet=script.split('class RecoveryWindowController{')[1]?.split('\\nconst recoveryWindow=new RecoveryWindowController();')[0];
assert.ok(snippet,'skill controller found');
const Controller=new Function('class RecoveryWindowController{'+snippet+';return RecoveryWindowController;')();
const w=new Controller();
w.begin(0);assert.equal(w.duration,.9);assert.equal(w.safeMin,.38);assert.equal(w.safeMax,.62);
assert.equal(w.tick(.45),false);assert.equal(w.position,.5);assert.equal(w.resolve(),'perfect');
w.begin(0);w.tick(.9*.4);assert.equal(w.resolve(),'safe');
w.begin(0);w.tick(.9*.6);assert.equal(w.resolve(),'safe');
w.begin(0);w.tick(.9*.2);assert.equal(w.resolve(),'miss');
w.begin(0);assert.equal(w.tick(.9),true);assert.equal(w.resolve(),'miss');
w.begin(10000);assert.ok(w.safeMin>.38&&w.safeMax<.62);assert.ok(w.safeMin<.47&&w.safeMax>.53);
w.reset();assert.equal(w.active,false);assert.equal(w.position,0);
assert.ok(script.includes('triggerRecovery();return'), 'ordinary unshielded collision enters recovery');
assert.ok(script.includes("if(state==='recovery')updateRecovery(dt)"),'recovery ticks in animation loop');
assert.ok(script.includes("if(state==='recovery'){attemptRecovery();return}"),'jump input taps recovery');
assert.ok(script.includes("if(result==='miss'){balance=0;end();return;}"),'miss delegates existing rescue flow');
assert.ok(script.includes('drawRecoveryGrandma();drawRecoveryMeter();drawRecoveryFeedback();'),'in-world meter renders');
assert.ok(html.includes('.game.recovery-mode .scoreboard'),'HUD hidden during recovery');
console.log('PASS recovery timing, PERFECT/SAFE/MISS, harder safe window, reset, collision/input/rescue integration, JS syntax');
''',encoding='utf-8')
print('PASS recovery integration patch generated')
