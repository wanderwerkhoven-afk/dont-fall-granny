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
  if(navCount!==6)throw Error('Expected 6 navigation buttons including settings');
  if(!initiallyVisible)throw Error('Start button not visible');
  if(!kicker.includes('70 LEVELS'))throw Error('Game did not initialize; kicker='+kicker);
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
  // Gameplay fills the entire viewport: no redundant heading, no overlapping HUD.
  const layout=await page.evaluate(()=>{
    const bounds=s=>{const r=document.querySelector(s).getBoundingClientRect();
      return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    return {title: getComputedStyle(document.querySelector('.shell>header')).display,
      game:bounds('.game'),scoreboard:bounds('.scoreboard'),map:bounds('#worldMapHudButton'),
      tier:bounds('#tierTrack'),viewport:{width:innerWidth,height:innerHeight}};
  });
  if(layout.title!=='none')throw Error('Gameplay still shows the page title');
  if(layout.game.height<layout.viewport.height*.85)throw Error('Gameplay does not use available screen height');
  if(layout.scoreboard.right>layout.map.x+3)throw Error('Gameplay HUD overlaps world-map button');
  if(layout.tier.right>layout.scoreboard.x+3)throw Error('Level progress overlaps HUD');
  // Landscape phone (e.g. iPhone in landscape) must keep score cards and touch
  // controls separate; test real CSS geometry, not only DOM presence.
  const landscape=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
  try{
    await landscape.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
    await landscape.locator('#startBtn').click();
    await landscape.waitForTimeout(250);
    const b=await landscape.evaluate(()=>{
      const rect=s=>{const v=document.querySelector(s).getBoundingClientRect();
        return {x:v.x,y:v.y,right:v.right,bottom:v.bottom,width:v.width,height:v.height};};
      return {title:getComputedStyle(document.querySelector('.shell>header')).display,
        game:rect('.game'),scoreboard:rect('.scoreboard'),map:rect('#worldMapHudButton'),
        tier:rect('#tierTrack'),footer:rect('.game .footer'),status:rect('.game .status'),
        viewport:{width:innerWidth,height:innerHeight}};
    });
    console.log('Landscape gameplay layout:',b);
    if(b.title!=='none')throw Error('Landscape page title remains during gameplay');
    if(b.game.height<b.viewport.height*.8)throw Error('Landscape canvas not fullscreen');
    if(b.scoreboard.right>b.map.x+3)throw Error('Landscape HUD overlaps map');
    if(b.tier.right>b.scoreboard.x+3)throw Error('Landscape level HUD collides with score');
    if(b.footer.bottom>b.status.y+3)throw Error('Landscape controls overlap status');
    if(b.footer.right>b.game.right+3)throw Error('Landscape controls outside playfield');
  }finally{await landscape.close();}
  console.log('PASS: full-viewport gameplay, clean desktop and landscape phone HUD');

  // iOS portrait regression: Granny's complete SVG must remain inside the
  // banner even when the home panel is taller than the viewport.
  const mobile=await browser.newPage({
    viewport:{width:393,height:852},
    deviceScaleFactor:3,
    isMobile:true,
    hasTouch:true
  });
  try {
    await mobile.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
    await mobile.waitForTimeout(350);
    const hero=await mobile.locator('#overlay .menu-hero').boundingBox();
    const granny=await mobile.locator('#menuGrandma svg').boundingBox();
    console.log('Mobile hero and Granny bounds:',{hero,granny});
    if(!hero||!granny)throw Error('Mobile Granny illustration is missing');
    const margin=8;
    if(granny.x<hero.x-margin||granny.y<hero.y-margin||
       granny.x+granny.width>hero.x+hero.width+margin||
       granny.y+granny.height>hero.y+hero.height+margin)
      throw Error('Granny SVG overflows mobile portrait hero banner');
    if(granny.height<85)throw Error('Granny is rendered too small on portrait mobile');
    console.log('PASS: Granny stays fully visible inside iPhone portrait banner');
  } finally { await mobile.close(); }

 } finally {
  await page.screenshot({path:'/tmp/granny-smoke.png',fullPage:true}).catch(()=>{});
  await browser.close();
 }
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
