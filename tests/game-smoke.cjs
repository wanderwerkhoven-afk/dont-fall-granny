const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
 const page = await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];
 page.on('pageerror',err=>errors.push(err.stack||String(err)));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('console: '+msg.text())});
 page.on('requestfailed',request=>errors.push('network: '+request.url()+' '+request.failure()?.errorText));
 try {
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
  await page.waitForTimeout(600);
  const navCount=await page.locator('#homeMainNav button').count();
  const initiallyVisible=await page.locator('#startBtn').isVisible();
  const kicker=await page.locator('#menuKicker').innerText();
  console.log({navCount,initiallyVisible,kicker,errors});
  if(navCount!==5)throw Error('Expected 5 navigation buttons');
  if(!initiallyVisible)throw Error('Start button not visible');
  if(!kicker.includes('49 LEVELS'))throw Error('Game did not initialize; kicker='+kicker);
  // Every secondary screen must preserve navigation and accessible controls.
  for(const [key,title] of [['clothes','kledingkast'],['gadgets','Gadget garage'],['progress','progressie'],['collection','accessoires']]){
    await page.locator('#homeMainNav [data-open-page="'+key+'"]').click();
    if(!await page.locator('#overlay.storepage').count())throw Error('Secondary page did not open: '+key);
    const heading=await page.locator('#storeTitle').innerText();
    if(!heading.toLowerCase().includes(title.toLowerCase()))throw Error('Wrong heading for '+key+': '+heading);
    if(!await page.locator('#menuContent').isVisible())throw Error('Content missing for '+key);
    if(!await page.locator('#menuTabs [data-page="home"]').isVisible())throw Error('Back navigation missing for '+key);
    if(['clothes','gadgets','collection'].includes(key)&&!await page.locator('#menuContent button').count())throw Error('Interactive items missing from '+key);
    const panel=await page.locator('#menuContent').boundingBox();
    const outer=await page.locator('#overlay').boundingBox();
    if(!panel||!outer||panel.width<260||panel.x<outer.x+outer.width*.30)throw Error('Desktop content layout collapsed on '+key);
    await page.locator('#menuTabs [data-page="home"]').click();
    if(await page.locator('#overlay.storepage').count())throw Error('Return to home failed: '+key);
  }
  console.log('PASS: outfits, gadgets, progression, extras, and home navigation');
  await page.locator('#startBtn').click({timeout:8000});
  await page.waitForTimeout(2200);
  const overlayHidden=await page.locator('#overlay').evaluate(el=>el.classList.contains('hidden'));
  const score=await page.locator('#score').innerText();
  console.log({overlayHidden,score,errors});
  if(!overlayHidden)throw Error('Start did not hide overlay');
  if(!/\d+ m/.test(score)||parseInt(score)<=0)throw Error('Game did not advance after start');
  if(errors.length)throw Error('Browser errors: '+errors.join('\n'));
  console.log('PASS: game initialized, menu visible, and score advances after Start');
 } finally {
  await page.screenshot({path:'/tmp/granny-smoke.png',fullPage:true}).catch(()=>{});
  await browser.close();
 }
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
