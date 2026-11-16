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
