const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 for(const viewport of [{width:1280,height:800},{width:393,height:852},{width:844,height:390}]){
  const page=await browser.newPage({viewport,isMobile:viewport.width<900,hasTouch:true});
  page.on('pageerror',error=>errors.push(error.stack||String(error)));
  try{
   await page.goto('http://127.0.0.1:8765/?debug=1',{waitUntil:'networkidle'});
   await page.locator('#startBtn').click();
   await page.waitForTimeout(150);
   await page.evaluate(()=>window.__grannyDebug.fall());
   await page.locator('#postRunOverlay.rescue-phase').waitFor();
   // Rescue and Result share a readable centered card after the v40 layout
   // redesign. Verify both phases remain inside the gameplay viewport.
   const rescueBounds=await page.locator('.post-run-card').boundingBox();
   if(!await page.locator('#overlay').evaluate(el=>el.classList.contains('hidden')))
    throw Error('Legacy full-screen game-over menu replaced the world');
   await page.locator('#postRunResult:not([hidden])').waitFor({timeout:3500});
   const result=await page.evaluate(()=>{
    const card=document.querySelector('.post-run-card').getBoundingClientRect();
    const game=document.getElementById('game').getBoundingClientRect();
    return {card:{x:card.x,y:card.y,right:card.right,bottom:card.bottom},
      game:{x:game.x,y:game.y,right:game.right,bottom:game.bottom},
      text:document.querySelector('#postRunHeading').textContent,
      active:window.__grannyDebug.snapshot()};
   });
   if(result.text!=='Oeps… daar gaat oma.')throw Error('Wrong result header');
   const cardCenterX=(result.card.x+result.card.right)/2,gameCenterX=(result.game.x+result.game.right)/2;
   const cardCenterY=(result.card.y+result.card.bottom)/2,gameCenterY=(result.game.y+result.game.bottom)/2;
   if(Math.abs(cardCenterX-gameCenterX)>16||Math.abs(cardCenterY-gameCenterY)>16)
    throw Error('Post-run card is not centered: '+JSON.stringify(viewport)+' '+JSON.stringify(result));
   const rescueCenterX=rescueBounds.x+rescueBounds.width/2;
   const rescueCenterY=rescueBounds.y+rescueBounds.height/2;
   if(Math.abs(rescueCenterY-cardCenterY)>16||Math.abs(rescueCenterX-cardCenterX)>16)
    throw Error('Rescue-to-result card changed center on '+JSON.stringify(viewport));

   if(result.card.x<result.game.x-4||result.card.y<result.game.y-4||
      result.card.right>result.game.right+4||result.card.bottom>result.game.bottom+4)
    throw Error('Result card clipped in viewport '+JSON.stringify(viewport)+' '+JSON.stringify(result));
   if(result.active.phase!=='result'||result.active.flow!=='game_over')
    throw Error('Invalid state transition '+JSON.stringify(result.active));
   if(viewport.width===1280){
    // Delayed input activation blocks the same tap used in the rescue phase.
    await page.evaluate(()=>{
     const game=document.getElementById('game');
     game.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}));
    });
    if((await page.evaluate(()=>window.__grannyDebug.snapshot())).state!=='over')
     throw Error('Tap-to-retry activated during 700ms safety window');
   }
   await page.locator('#postRunRetry').click();
   await page.waitForTimeout(200);
   const again=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(again.state!=='playing'||again.flow!=='running'||again.phase!=='hidden')
    throw Error('Retry did not reset in place '+JSON.stringify(again));
   await page.evaluate(()=>window.__grannyDebug.fall());
   await page.locator('#postRunOverlay.rescue-phase').waitFor();
   await page.locator('#postRunSkip').click();
   await page.locator('#postRunResult:not([hidden])').waitFor();
   await page.waitForTimeout(750);
   await page.locator('#game').evaluate(el=>{
    el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}));
   });
   const tapped=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(tapped.state!=='playing')throw Error('Tap anywhere did not start new run');
   if(errors.length)throw Error('Browser errors: '+errors.join('; '));
   console.log('PASS post-run rescue, result, retry button and safe tap '+viewport.width+'x'+viewport.height);
  }finally{await page.close();}
 }
 await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
