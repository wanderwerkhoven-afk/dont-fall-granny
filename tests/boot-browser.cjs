const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const scenario of [
   {name:'normal-desktop',width:1440,height:900},
   {name:'missing-camera-module',width:1280,height:800,blockCamera:true},
   {name:'portrait-mobile',width:390,height:844,isMobile:true,hasTouch:true}
  ]){
   const page=await browser.newPage({viewport:{width:scenario.width,height:scenario.height},isMobile:!!scenario.isMobile,hasTouch:!!scenario.hasTouch});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   if(scenario.blockCamera)await page.route('**/storybook-camera.js*',route=>route.abort());
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#menuKicker')?.textContent.includes('91 LEVELS'),{timeout:15000});
   const start=page.locator('#startBtn');
   if(!await start.isVisible())throw Error(scenario.name+': start button not visible');
   await start.evaluate(button=>button.click());
   await page.waitForTimeout(1200);
   const status=await page.evaluate(()=>({
     state:document.querySelector('#overlay')?.classList.contains('hidden'),
     score:document.querySelector('#score')?.textContent,
     cameraLoaded:!!window.GrannyStorybookCamera
   }));
   if(!status.state||!Number.parseInt(status.score)>0)throw Error(scenario.name+': failed to start '+JSON.stringify(status));
   if(errors.length)throw Error(scenario.name+': runtime errors '+errors.join(' | '));
   console.log('PASS start '+scenario.name,JSON.stringify(status));
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
