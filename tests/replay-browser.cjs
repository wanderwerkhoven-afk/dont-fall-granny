const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:800},{width:393,height:852},{width:844,height:390}]){
  const page=await browser.newPage({viewport,isMobile:viewport.width<900,hasTouch:true});
  const errors=[];page.on('pageerror',error=>errors.push(error.stack||String(error)));
  try{
   await page.goto('http://127.0.0.1:8765/?debug=1',{waitUntil:'networkidle'});
   if(!await page.locator('#replayDebugPanel').isVisible())throw Error('Replay debug panel missing');
   if(!await page.locator('#copyReplay').isVisible()||!await page.locator('#loadReplay').isVisible())
    throw Error('COPY / LOAD REPLAY unavailable in debug mode');
   await page.locator('.home-settings summary').click();
   const button=page.locator('[data-toggle-setting="ghost"]');
   if(await button.count()!==1)throw Error('Ghost Granny toggle missing');
   await button.click();
   const ghostEnabled=await page.evaluate(()=>localStorage.getItem('granny-replay-ghost-enabled-v1'));
   if(ghostEnabled!=='true')throw Error('Ghost preference was not persisted');
   await page.locator('#startBtn').click();
   const result=await page.evaluate(()=>{
    const debug=window.__grannyDebug;
    debug.replayStepForTest(20);
    const canvas=document.getElementById('canvas');
    canvas.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}));
    debug.replayStepForTest(36);
    canvas.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}));
    debug.replayStepForTest(51);
    const before=debug.snapshot(),info=debug.replayInfo();
    debug.fall();
    const json=debug.exportReplay();
    return {before,info,tape:JSON.parse(json)};
   });
   if(result.info.mode!=='record'||result.info.inputCount!==2)
    throw Error('Tick-indexed player input was not recorded '+JSON.stringify(result.info));
   if(result.tape.ruleset!=='granny-rules-2026.11.19-r1'||result.tape.format!==1||
      !Number.isInteger(result.tape.seed)||result.tape.frames.length<15)
    throw Error('Incomplete replay JSON');
   if(result.tape.inputs.some(x=>x[1]!=='jump'))throw Error('Unexpected stored actions');
   const recorded=await page.evaluate(tape=>{
    const debug=window.__grannyDebug;
    debug.loadReplay(JSON.stringify(tape));
    const first=debug.replayInfo();
    debug.replayStepForTest(tape.result.ticks);
    return {first,info:debug.replayInfo(),after:debug.snapshot()};
   },result.tape);
   if(recorded.first.mode!=='playback'||recorded.first.seed!==result.tape.seed)
    throw Error('Loaded replay did not preserve seed/ruleset');
   if(recorded.info.error)throw Error('Replayed physics diverged: '+recorded.info.error);
   if(recorded.after.score!==result.before.score)
    throw Error('Replay score mismatch '+result.before.score+' vs '+recorded.after.score);
   if(recorded.info.tick!==result.tape.result.ticks)
    throw Error('Replay did not consume same fixed physics ticks');
   if(errors.length)throw Error('Runtime errors: '+errors.join('; '));
   console.log('PASS Replay record → seed/input JSON → deterministic playback → ghost setting '+viewport.width+'x'+viewport.height);
  }finally{await page.close();}
 }
 await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
