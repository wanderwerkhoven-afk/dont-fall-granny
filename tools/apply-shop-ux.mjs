import fs from 'node:fs';
import assert from 'node:assert/strict';
const path='index.html';
let html=fs.readFileSync(path,'utf8');
function replaceOnce(before,after){const count=html.split(before).length-1;assert.equal(count,1,`Expected exactly one anchor; got ${count}: ${before.slice(0,90)}`);html=html.replace(before,after)}
replaceOnce('/* Store cards have aligned actions; buttons remain easy to tap. */',`/* Shop Agent Team: selected item, clear cost and responsive card actions. */
#overlay.storepage .store-item{position:relative;transition:border-color .12s ease,box-shadow .12s ease}
#overlay.storepage .store-item.selected{border-color:#2e7664;background:linear-gradient(180deg,#edfff1,#fff9ec);box-shadow:0 0 0 2px #2e766433}
#overlay.storepage .store-item.selected::before{content:'AANGETROKKEN';position:absolute;top:5px;right:5px;font:900 8px system-ui;letter-spacing:.45px;color:#205a49;background:#cdf0d7;border:1px solid #2e7664;border-radius:7px;padding:3px 4px}
#overlay.storepage .store-item:focus{outline:3px solid #256f9e;outline-offset:3px}
#overlay.storepage .store-item button:disabled{opacity:1;color:#544759;background:#e9e1dd}
#overlay.storepage .store-item.selected button:disabled{color:#205a49;background:#cdf0d7;border-color:#2e7664}
#overlay.storepage .store-item .preview{flex-shrink:0}
@media(prefers-reduced-motion:reduce){#overlay.storepage .store-item{transition:none}}
/* Store cards have aligned actions; buttons remain easy to tap. */`);
replaceOnce('const previousScroll=menuPanel.scrollTop;\n saveCoins();saveInventory();showMenu(page);\n if(page===\'clothes\'||page===\'gadgets\'){menuPanel.scrollTop=previousScroll;requestAnimationFrame(syncClothesHanger);const updated=menuContent.querySelector(\'[data-buy="\'+item.id+\'"]\');if(updated&&page===\'clothes\')updated.focus({preventScroll:true})}',`const previousScroll=menuPanel.scrollTop;
 saveCoins();saveInventory();showMenu(page);
 if(page==='clothes'||page==='gadgets'){
  menuPanel.scrollTop=previousScroll;
  requestAnimationFrame(syncClothesHanger);
  const updated=menuContent.querySelector('[data-buy="'+item.id+'"]');
  // Disabled ACTIEF buttons cannot receive focus: focus their selected card instead.
  const focusTarget=updated?.disabled?updated.closest('.store-item'):updated;
  if(focusTarget){if(focusTarget!==updated)focusTarget.tabIndex=-1;focusTarget.focus({preventScroll:true})}
 }`);
replaceOnce("menuTabs.addEventListener('click',e=>{const btn=e.target.closest('[data-page]');if(btn)showMenu(btn.dataset.page)});",`menuTabs.addEventListener('click',e=>{
 const btn=e.target.closest('[data-page]');if(!btn)return;
 if(btn.dataset.page!==menuPage){
  showMenu(btn.dataset.page);
  // Each tab starts at the top; purchases within a tab preserve their own scroll.
  menuPanel.scrollTop=0;
  hangerLastScrollTop=0;
  hangerScrollImpulse=0;
  requestAnimationFrame(syncClothesHanger);
 }
});`);
replaceOnce('<div id="menuWallet">🪙 0 munten</div>','<div id="menuWallet" role="status" aria-live="polite" aria-atomic="true">🪙 0 munten</div>');
assert.match(html,/AANGETROKKEN/);assert.match(html,/focusTarget=updated\?\.disabled/);assert.match(html,/menuPanel.scrollTop=0/);
const script=html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];assert.ok(script);new Function(script);
fs.writeFileSync(path,html);
console.log('PASS: shop polish applied; inline JS parses');