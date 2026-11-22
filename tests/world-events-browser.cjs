const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const [viewport,world] of [
  [{width:1280,height:800},2],
  [{width:393,height:852},0],
  [{width:844,height:390},6],
  [{width:1280,height:800},7],
  [{width:1280,height:800},8],
  [{width:1280,height:800},9]
 ]){
  const page=await browser.newPage({viewport,isMobile:viewport.width<900,hasTouch:true});
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  try{
   await page.goto('http://127.0.0.1:8765/?debug=1',{waitUntil:'networkidle'});
   await page.locator('#startBtn').click();
   await page.evaluate(index=>{
    window.__grannyDebug.setWorldForTest(index);
    window.__grannyDebug.advanceWorldEventForTest(18+(index%7)*1.6+.5);
   },world);
   let snap=await page.evaluate(()=>window.__grannyDebug.snapshot());
   const expected=['buurt_scooter','park_scooter','stad_scooter','woestijn_plane','nacht_plane','snoep_scooter','ruimte_plane','winter_scooter','neon_plane','pirate_scooter'][world];
   if(snap.worldEvent.id!==expected||snap.worldEvent.eventCount!==1)
    throw Error('Event missing or wrong world '+JSON.stringify({world,snap}));
   if(snap.flow!=='special_mode'||snap.state!=='playing')
    throw Error('Event is not guarded by SPECIAL_MODE '+JSON.stringify(snap));
   if(!await page.locator('#worldEventCard').isVisible())throw Error('World-event label not visible');
   const bounds=await page.evaluate(()=>{
    const c=document.getElementById('worldEventCard').getBoundingClientRect();
    const g=document.getElementById('game').getBoundingClientRect();
    return {c:{x:c.x,y:c.y,right:c.right,bottom:c.bottom},
      g:{x:g.x,y:g.y,right:g.right,bottom:g.bottom}};
   });
   if(bounds.c.x<bounds.g.x-4||bounds.c.right>bounds.g.right+4||
      bounds.c.y<bounds.g.y-4||bounds.c.bottom>bounds.g.bottom+4)
    throw Error('Event HUD outside game bounds '+JSON.stringify(bounds));
   await page.locator('#pauseBtn').click();
   const paused=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(paused.state!=='paused'||paused.flow!=='paused')
    throw Error('Special mode did not pause safely '+JSON.stringify(paused));
   await page.locator('#startBtn').click();
   snap=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(snap.state!=='playing'||snap.flow!=='special_mode')
    throw Error('Resume did not restore SPECIAL_MODE '+JSON.stringify(snap));
   await page.evaluate(()=>window.__grannyDebug.advanceWorldEventForTest(15));
   const ended=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(ended.flow!=='running'||ended.worldEvent.phase!=='complete'||ended.worldEvent.eventCount!==1)
    throw Error('Event outro did not restore RUNNING '+JSON.stringify(ended));
   if(await page.locator('#worldEventCard').isVisible())throw Error('Event label not hidden on outro');
   await page.evaluate(()=>window.__grannyDebug.advanceWorldEventForTest(80));
   const once=await page.evaluate(()=>window.__grannyDebug.snapshot());
   if(once.worldEvent.eventCount!==1)throw Error('A second special event spawned in same run');
   if(errors.length)throw Error(errors.join('\n'));
   console.log('PASS World Event '+expected+' and pause, intro/outro, one-per-run on '+viewport.width+'x'+viewport.height);
  }finally{await page.close();}
 }
 await browser.close();
})().catch(error=>{console.error(error.stack||error);process.exit(1)});
