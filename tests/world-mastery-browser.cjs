const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:800},{width:393,height:852}]){
  const page=await browser.newPage({viewport,isMobile:viewport.width<650,hasTouch:true});
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  try{
   await page.addInitScript(()=>{
    if(!localStorage.getItem('mastery-test-seeded')){
     localStorage.setItem('mastery-test-seeded','1');
     localStorage.setItem('grandma-meta-v1',JSON.stringify({
      stats:{xp:1234,runs:3,totalDistance:1240},achievements:['first-run'],
      mastery:{'0':{distance:660,perfects:2,nearMisses:1,bestCombo:2}}
     }));
    }
   });
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
   await page.locator('#homeMainNav [data-open-page="progress"]').click();
   const book=page.locator('#adventureBook');
   if(!await book.isVisible())throw Error('Adventure Book missing');
   if(await book.locator('.adventure-page').count()!==13)throw Error('Expected 13 world pages');
   if(await book.locator('.book-goal').count()!==39)throw Error('Expected 39 permanent star goals');
   const earned=await book.locator('.book-goal.earned').count();
   if(earned!==2)throw Error('Legacy mastery was not migrated to 2 stars: '+earned);
   const total=await book.locator('.book-total').innerText();
   if(!total.includes('2')||!total.includes('39'))throw Error('Wrong total stars: '+total);
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('grandma-meta-v1')));
   if(stored.stats.xp!==1234)throw Error('XP changed during migration');
   if(!stored.achievements.includes('first-run'))throw Error('Achievements overwritten');
   if(!stored.mastery['0'].stars['0']||!stored.mastery['0'].stars['1'])
    throw Error('Mastery awards were not persisted');
   await page.reload({waitUntil:'networkidle'});
   await page.locator('#homeMainNav [data-open-page="progress"]').click();
   if(await page.locator('#adventureBook .book-goal.earned').count()!==2)
    throw Error('Mastery stars lost on reload');
   if(errors.length)throw Error('JavaScript errors: '+errors.join('; '));
   console.log('PASS World Mastery Adventure Book: 13 pages, 39 goals, permanent migrated stars and intact XP/achievements '+viewport.width+'x'+viewport.height);
  }finally{await page.close();}
 }
 await browser.close();
})().catch(error=>{console.error(error.stack||error);process.exit(1)});
