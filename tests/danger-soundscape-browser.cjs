const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:800},{width:393,height:852},{width:844,height:390}]){
  const page=await browser.newPage({viewport,isMobile:viewport.width<900,hasTouch:true});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.stack||String(error)));
  try{
   await page.goto('http://127.0.0.1:8765/?debug=1',{waitUntil:'networkidle'});
   await page.locator('.home-settings summary').click();
   for(const key of ['music','sfx','visualWarnings']){
    if(await page.locator('[data-toggle-setting="'+key+'"]').count()!==1)
     throw Error('Independent '+key+' control missing');
   }
   // Toggle each control separately and ensure the saved values are independent.
   await page.locator('[data-toggle-setting="music"]').click();
   await page.locator('[data-toggle-setting="sfx"]').click();
   await page.locator('[data-toggle-setting="visualWarnings"]').click();
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('grandma-meta-v1')).settings);
   if(saved.music!==true||saved.sfx!==false||saved.visualWarnings!==false)
    throw Error('Independent preferences not persisted '+JSON.stringify(saved));
   await page.reload({waitUntil:'networkidle'});
   await page.locator('.home-settings summary').click();
   for(const [key,expected] of [['music','true'],['sfx','false'],['visualWarnings','false']]){
    const pressed=await page.locator('[data-toggle-setting="'+key+'"]').getAttribute('aria-pressed');
    if(pressed!==expected)throw Error('Reload lost '+key+' preference: '+pressed);
   }
   await page.locator('[data-toggle-setting="music"]').click();
   await page.locator('[data-toggle-setting="sfx"]').click();
   await page.locator('[data-toggle-setting="visualWarnings"]').click();
   await page.locator('#startBtn').click();
   await page.evaluate(()=>window.__grannyDebug.dangerTestObstacle('car',.74));
   let snap=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(!snap.warningVisible||snap.dangerCues!==1)
    throw Error('Warning did not fire in the 400-900 ms window '+JSON.stringify(snap));
   if(!await page.locator('#dangerWarning').isVisible())throw Error('Visual edge cue missing');
   const geometry=await page.locator('#dangerWarning').boundingBox();
   const game=await page.locator('#game').boundingBox();
   if(!geometry||!game||geometry.x<game.x+game.width*.85||
      geometry.x+geometry.width>game.x+game.width+5)
    throw Error('Warning overlaps gameplay or is outside right edge');
   await page.evaluate(()=>window.__grannyDebug.dangerTestObstacle('cat',.23));
   snap=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(snap.dangerCues!==1)throw Error('Late hazard triggered audio outside 400-900ms');
   await page.evaluate(()=>window.__grannyDebug.dangerTestClear());
   snap=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(snap.warningVisible)throw Error('Stale warning remains after hazard removed');
   // Pausing must stop all warnings and not add new audio.
   await page.evaluate(()=>window.__grannyDebug.dangerTestObstacle('cat',.65));
   await page.locator('#pauseBtn').click();
   snap=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(snap.warningVisible||snap.state!=='paused')throw Error('Pause did not clear danger warning');
   if(errors.length)throw Error('Uncaught browser errors: '+errors.join('; '));
   console.log('PASS danger soundscape settings, 400-900ms cue, no late alerts, edge HUD and pause '+viewport.width+'x'+viewport.height);
  }finally{await page.close();}
 }
 await browser.close();
})().catch(error=>{console.error(error.stack||error);process.exit(1)});
