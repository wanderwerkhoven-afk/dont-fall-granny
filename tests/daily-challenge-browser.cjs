const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:800},{width:393,height:852},{width:844,height:390}]){
  const page=await browser.newPage({viewport,isMobile:viewport.width<900,hasTouch:true});
  const errors=[];page.on('pageerror',error=>errors.push(String(error)));
  try{
   await page.goto('http://127.0.0.1:8765/?debug=1',{waitUntil:'networkidle'});
   if(!await page.locator('#dailyChallengeButton').isVisible())throw Error('Daily challenge not visible in home menu');
   await page.locator('#dailyChallengeButton').click();
   const first=await page.evaluate(()=>{
    const snap=window.__grannyDebug.snapshot();
    return {snap,course:window.GrannyDaily.course(),
      obstacles:Array.from({length:12},(_,i)=>window.GrannyDaily.obstacleAt(window.GrannyDaily.course(),i))};
   });
   if(first.snap.state!=='playing'||!first.snap.daily?.active)throw Error('Daily mode did not start');
   if(!await page.locator('#dailyChallengeHud').isVisible())throw Error('Daily countdown not visible');
   await page.evaluate(()=>window.__grannyDebug.dailyAdvanceForTest(75));
   if(!await page.locator('#dailyResultCard').isVisible())throw Error('Daily result not visible at expiry');
   const after=await page.evaluate(()=>{
    const summary=window.__grannyDebug.snapshot();
    const saved=window.GrannyDaily.read(localStorage,window.GrannyDaily.utcDate());
    const canvas=window.GrannyDaily.cardCanvas(window.GrannyDaily.course(),
      {points:900,distance:850,nearMisses:2,perfectSaves:0,completed:true,seconds:75});
    return {summary,saved,card:{width:canvas.width,height:canvas.height,data:canvas.toDataURL('image/png').slice(0,25)}};
   });
   if(after.summary.daily.active||!after.summary.daily.finished||after.summary.daily.reason!=='completed')
    throw Error('Wrong daily completion state '+JSON.stringify(after.summary));
   if(!after.saved||after.saved.attempts!==1)throw Error('Daily record not saved');
   if(after.card.width!==1200||after.card.height!==630||!after.card.data.startsWith('data:image/png'))
    throw Error('Shareable graphic card was not generated');
   const bounds=await page.locator('#dailyResultCard .daily-result-inner').boundingBox();
   const game=await page.locator('#game').boundingBox();
   if(!bounds||!game||bounds.x<game.x-4||bounds.x+bounds.width>game.x+game.width+4||
      bounds.y<game.y-4||bounds.y+bounds.height>game.y+game.height+4)
    throw Error('Daily result card is clipped on '+JSON.stringify(viewport));
   await page.locator('#dailyRetry').click();
   const again=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(!again.daily?.active||again.daily.index!==0)throw Error('Daily retry did not start same course');
   const second=await page.evaluate(()=>({course:window.GrannyDaily.course(),
    obstacles:Array.from({length:12},(_,i)=>window.GrannyDaily.obstacleAt(window.GrannyDaily.course(),i))}));
   if(JSON.stringify(first.course)!==JSON.stringify(second.course)||
      JSON.stringify(first.obstacles)!==JSON.stringify(second.obstacles))
    throw Error('Retry produced a different obstacle course');
   await page.evaluate(()=>window.__grannyDebug.dailyAdvanceForTest(75));
   await page.locator('#dailyHome').click();
   await page.locator('#startBtn').click();
   const endless=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(endless.state!=='playing'||endless.daily.active)throw Error('Endless run not independently available');
   if(errors.length)throw Error('Uncaught browser errors '+errors.join('; '));
   console.log('PASS Daily Challenge identical course, 75s finish, result PNG, retry and endless mode '+viewport.width+'x'+viewport.height);
  }finally{await page.close();}
 }
 await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
