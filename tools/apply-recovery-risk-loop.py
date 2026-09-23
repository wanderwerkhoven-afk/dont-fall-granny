from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
def one(old,new):
    global s
    assert s.count(old)==1, (old[:120], s.count(old))
    s=s.replace(old,new,1)

one(" constructor(){this.duration=.9;this.active=false;this.position=0;this.elapsed=0;this.safeMin=.38;this.safeMax=.62;this.perfectMin=.47;this.perfectMax=.53;}\n begin(distance){\n  this.active=true;this.elapsed=0;this.position=0;\n  const shrink=Math.min(.065,Math.floor(distance/1000)*.008);\n  this.safeMin=.38+shrink;this.safeMax=.62-shrink;\n }",
""" constructor(){this.duration=.9;this.active=false;this.position=0;this.elapsed=0;this.safeMin=.38;this.safeMax=.62;this.perfectMin=.47;this.perfectMax=.53;}
 begin(distance,focusBonus=0){
  this.active=true;this.elapsed=0;this.position=0;
  const shrink=Math.min(.065,Math.floor(distance/1000)*.008);
  const focus=Math.max(0,Math.min(.03,focusBonus));
  this.safeMin=Math.min(this.perfectMin-.01,.38+shrink-focus);
  this.safeMax=Math.max(this.perfectMax+.01,.62-shrink+focus);
 }""")

one("const recoveryWindow=new RecoveryWindowController();\nconst reducedRecoveryMotion=window.matchMedia('(prefers-reduced-motion: reduce)');\nlet balance=1,recoveryBoost=0,recoverySlow=0,recoveryFeedback=0,recoveryFeedbackText='',recoverySettle=0;",
"""class BalanceController{
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
const recoveryWindow=new RecoveryWindowController();
const balanceController=new BalanceController();
const nearMissController=new NearMissController();
const reducedRecoveryMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let recoveryBoost=0,recoverySlow=0,recoveryFeedback=0,recoveryFeedbackText='',recoverySettle=0,recoveryCameraSettle=0;""")

one(" recoveryWindow.begin(score);balance=.25;state='recovery';",
    " recoveryWindow.begin(score,nearMissController.consumeFocus());balanceController.hit();state='recovery';")
one(" if(result==='miss'){balance=0;end();return;}\n balance=result==='perfect'?1:.65;",
    " if(result==='miss'){balanceController.fail();end();return;}\n balanceController.recover(result);")
one(" recoverySettle=result==='perfect'&&!reducedRecoveryMotion.matches?.26:0;",
    " recoverySettle=result==='perfect'&&!reducedRecoveryMotion.matches?.26:0;\n recoveryCameraSettle=result==='perfect'&&!reducedRecoveryMotion.matches?.24:0;")

one("function random(a,b){return a+Math.random()*(b-a)}function reset(){recoveryWindow.reset();document.getElementById('game').classList.remove('recovery-mode');balance=1;recoveryBoost=0;recoverySlow=0;recoveryFeedback=0;recoverySettle=0;",
"""function random(a,b){return a+Math.random()*(b-a)}function reset(){recoveryWindow.reset();balanceController.reset();nearMissController.reset();document.getElementById('game').classList.remove('recovery-mode');recoveryBoost=0;recoverySlow=0;recoveryFeedback=0;recoverySettle=0;recoveryCameraSettle=0;""")

one("function update(dt){elapsed+=dt;walk+=dt*11;recoveryBoost=Math.max(0,recoveryBoost-dt);recoverySlow=Math.max(0,recoverySlow-dt);recoveryFeedback=Math.max(0,recoveryFeedback-dt);recoverySettle=Math.max(0,recoverySettle-dt);",
"""function update(dt){elapsed+=dt;walk+=dt*11;recoveryBoost=Math.max(0,recoveryBoost-dt);recoverySlow=Math.max(0,recoverySlow-dt);recoveryFeedback=Math.max(0,recoveryFeedback-dt);recoverySettle=Math.max(0,recoverySettle-dt);recoveryCameraSettle=Math.max(0,recoveryCameraSettle-dt);""")

one("    chargeX:W-(type.id==='car'?175:105),charging:false,multiplier,hit:false});",
    "    chargeX:W-(type.id==='car'?175:105),charging:false,multiplier,hit:false,nearMiss:false,nearMissCandidate:false});")

collision="const body={x:grandma.x+7,y:grandma.y+7,w:grandma.w-13,h:grandma.h-9};for(const o of obstacles){if(!vehicle&&!o.hit&&rectHit(body,{x:o.x+3,y:o.y+3,w:o.w-6,h:o.h-3},7)){o.hit=true;if(invulnerable>0||boostTime>0)continue;if(shield){shield=0;invulnerable=1.25;flash=.6;puff(grandma.x+25,grandma.y+25,'#ffcc65');statusEl.textContent='🍬 Snoepje gebruikt! Je bent weer kwetsbaar.'}else{puff(grandma.x+20,grandma.y+25,'#e88999');triggerRecovery();return}}}for(const c of candies){"
replacement="""const body={x:grandma.x+7,y:grandma.y+7,w:grandma.w-13,h:grandma.h-9};
for(const o of obstacles){
 const obstacleBody={x:o.x+3,y:o.y+3,w:o.w-6,h:o.h-3};
 const horizontalOverlap=body.x<body.x+body.w&&body.x<obstacleBody.x+obstacleBody.w&&body.x+body.w>obstacleBody.x;
 const clearance=obstacleBody.y-(body.y+body.h);
 if(!o.hit&&horizontalOverlap&&clearance>=0&&clearance<=28)o.nearMissCandidate=true;
 if(!vehicle&&!o.hit&&rectHit(body,obstacleBody,7)){
  o.hit=true;
  if(invulnerable>0||boostTime>0)continue;
  if(shield){shield=0;invulnerable=1.25;flash=.6;puff(grandma.x+25,grandma.y+25,'#ffcc65');statusEl.textContent='🍬 Snoepje gebruikt! Je bent weer kwetsbaar.'}
  else{puff(grandma.x+20,grandma.y+25,'#e88999');triggerRecovery();return}
 }
}
for(const o of obstacles){
 if(!o.hit&&!o.nearMiss&&o.nearMissCandidate&&o.x+o.w<body.x){
  o.nearMiss=true;
  const focus=nearMissController.register();
  recoveryFeedback=.7;recoveryFeedbackText='NICE DODGE  +FOCUS';
  statusEl.textContent='NICE DODGE! Focus maakt je volgende recovery iets ruimer ('+Math.round(focus*100)+'%).';
 }
}
for(const c of candies){"""
one(collision,replacement)

one("function render(){\n if(vehicle){drawVehicleMode();return;}\n if(transition>0){",
"""function render(){
 if(vehicle){drawVehicleMode();return;}
 ctx.save();
 if(recoveryCameraSettle>0&&!reducedRecoveryMotion.matches){
  const strength=recoveryCameraSettle/.24;
  const wobble=Math.sin((1-strength)*Math.PI*3)*strength;
  ctx.translate(wobble*4,Math.abs(wobble)*1.5);
 }
 if(transition>0){""")

one("for(const c of candies)drawCandy(c);for(const o of obstacles)drawObstacle(o);drawRecoveryGrandma();drawRecoveryMeter();drawRecoveryFeedback();for(const p of particles)ellipse(p.x,p.y,4,4,p.color);if(boostTime>0){rounded(18,57,175,32,10,'#fff2b6');ctx.fillStyle='#493e49';ctx.font='bold 15px system-ui';ctx.fillText('⚡ Turbo '+Math.ceil(boostTime)+'s',29,79)}if(flash>0){ctx.fillStyle=`rgba(255,220,140,${flash*.3})`;ctx.fillRect(0,0,W,H)}}",
"""for(const c of candies)drawCandy(c);for(const o of obstacles)drawObstacle(o);drawRecoveryGrandma();drawRecoveryMeter();drawRecoveryFeedback();for(const p of particles)ellipse(p.x,p.y,4,4,p.color);if(boostTime>0){rounded(18,57,175,32,10,'#fff2b6');ctx.fillStyle='#493e49';ctx.font='bold 15px system-ui';ctx.fillText('⚡ Turbo '+Math.ceil(boostTime)+'s',29,79)}if(flash>0){ctx.fillStyle=`rgba(255,220,140,${flash*.3})`;ctx.fillRect(0,0,W,H)}ctx.restore()}""")

# Fix the tier label suppression bug during recovery.
old=""" ctx.save();ctx.textAlign='center';
 if(state==='recovery')ctx.globalAlpha=0;
 ctx.font='900 23px system-ui';ctx.fillStyle=(currentTier===4||currentTier>=6)?'#fff':'#493e49';
 ctx.globalAlpha=.82;
 ctx.fillText(`TIER ${currentTier+1}`,W/2,Math.max(108,ground*.35));
 ctx.font='800 15px system-ui';ctx.fillText(tier.name.toUpperCase(),W/2,Math.max(132,ground*.35+23));
 ctx.restore();"""
new=""" if(state!=='recovery'){
  ctx.save();ctx.textAlign='center';
  ctx.font='900 23px system-ui';ctx.fillStyle=(currentTier===4||currentTier>=6)?'#fff':'#493e49';
  ctx.globalAlpha=.82;
  ctx.fillText(`TIER ${currentTier+1}`,W/2,Math.max(108,ground*.35));
  ctx.font='800 15px system-ui';ctx.fillText(tier.name.toUpperCase(),W/2,Math.max(132,ground*.35+23));
  ctx.restore();
 }"""
one(old,new)

p.write_text(s,encoding='utf-8')

# Update existing recovery regression for BalanceController.
tp=Path('tests/recovery-skill-check.mjs')
t=tp.read_text(encoding='utf-8')
t=t.replace("assert.ok(script.includes(\"if(result==='miss'){balance=0;end();return;}\"),'miss delegates existing rescue flow');",
            "assert.ok(script.includes(\"if(result==='miss'){balanceController.fail();end();return;}\"),'miss delegates existing rescue flow');")
tp.write_text(t,encoding='utf-8')

risk=Path('tests/recovery-risk-loop.mjs')
risk.write_text("""import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
const script=html.split('<script>')[1]?.split('</script>')[0];
assert.ok(script);new Function(script);
assert.ok(script.includes('class BalanceController{'));
assert.ok(script.includes('class NearMissController{'));
assert.ok(script.includes('nearMissController.consumeFocus()'));
assert.ok(script.includes("recoveryFeedbackText='NICE DODGE  +FOCUS'"));
assert.ok(script.includes('clearance>=0&&clearance<=28'));
assert.ok(script.includes("recoveryCameraSettle=result==='perfect'"));
assert.ok(script.includes('ctx.translate(wobble*4,Math.abs(wobble)*1.5)'));
assert.ok(script.includes("if(recoveryCameraSettle>0&&!reducedRecoveryMotion.matches)"));
assert.ok(script.includes("if(state!=='recovery'){"),'tier label hidden during recovery');
const rw=script.split('class RecoveryWindowController{')[1]?.split('const recoveryWindow=new RecoveryWindowController();')[0];
assert.ok(rw);
const C=new Function('class RecoveryWindowController{'+rw+';return RecoveryWindowController;')();
const w=new C();
w.begin(0,0);const base=[w.safeMin,w.safeMax];
w.begin(0,.03);assert.ok(w.safeMin<base[0]&&w.safeMax>base[1],'near miss focus widens next safe window');
w.begin(10000,.03);assert.ok(w.safeMin<w.perfectMin&&w.safeMax>w.perfectMax,'difficulty never crushes perfect zone');
console.log('PASS near-miss focus risk/reward, balance controller, perfect camera settle, recovery HUD suppression and syntax');
""",encoding='utf-8')
print('PASS patch prepared')
