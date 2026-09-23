from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="""function drawRecoveryFeedback(){
 if(recoveryFeedback<=0)return;
 ctx.save();ctx.globalAlpha=Math.min(1,recoveryFeedback*2);
 ctx.font='900 19px system-ui';ctx.textAlign='center';
 ctx.strokeStyle='#493e49';ctx.lineWidth=4;
 ctx.strokeText(recoveryFeedbackText,grandma.x+grandma.w/2+22,grandma.y-30);
 ctx.fillStyle='#ffcc65';ctx.fillText(recoveryFeedbackText,grandma.x+grandma.w/2+22,grandma.y-30);
 ctx.restore();
}"""
new="""function drawRecoveryFeedback(){
 if(recoveryFeedback<=0)return;
 const nearMiss=recoveryFeedbackText==='NEAR\\nMISS!';
 const x=grandma.x+grandma.w/2+(nearMiss?28:22);
 const y=grandma.y-(nearMiss?48:30);
 ctx.save();ctx.globalAlpha=Math.min(1,recoveryFeedback*(nearMiss?1.15:2));ctx.textAlign='center';
 ctx.font=(nearMiss?'1000 30px':'900 19px')+' system-ui';
 ctx.strokeStyle='#493e49';ctx.lineWidth=nearMiss?6:4;
 ctx.fillStyle='#ffcc65';
 const lines=recoveryFeedbackText.split('\\n');
 lines.forEach((line,i)=>{
  const yy=y+i*(nearMiss?27:21);
  ctx.strokeText(line,x,yy);ctx.fillText(line,x,yy);
 });
 ctx.restore();
}"""
assert s.count(old)==1
s=s.replace(old,new,1)
old2="""  recoveryFeedback=.7;recoveryFeedbackText='NICE DODGE  +FOCUS';
  statusEl.textContent='NICE DODGE! Focus maakt je volgende recovery iets ruimer ('+Math.round(focus*100)+'%).';"""
new2="""  recoveryFeedback=1.35;recoveryFeedbackText='NEAR\\nMISS!';
  statusEl.textContent='NEAR MISS! +FOCUS';"""
assert s.count(old2)==1
s=s.replace(old2,new2,1)
p.write_text(s,encoding='utf-8')

t=Path('tests/recovery-risk-loop.mjs')
x=t.read_text(encoding='utf-8')
x=x.replace("assert.ok(script.includes(\"recoveryFeedbackText='NICE DODGE  +FOCUS'\"));",
            "assert.ok(script.includes(\"recoveryFeedback=1.35;recoveryFeedbackText='NEAR\\\\nMISS!'\"));")
x += "\nassert.ok(script.includes(\"const nearMiss=recoveryFeedbackText==='NEAR\\\\nMISS!'\"),'large stacked near miss feedback');\nassert.ok(script.includes(\"ctx.font=(nearMiss?'1000 30px':'900 19px')+' system-ui'\"),'near miss uses larger text');\n"
t.write_text(x,encoding='utf-8')
print('PASS near miss feedback patch')
