import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
assert.match(html, /#overlay\.clothespage #menuContent\{max-height:none;overflow:visible\}/);
assert.match(html, /#overlay\.clothespage \.panel\{overflow-y:auto;overflow-x:hidden;scrollbar-width:none/);
assert.match(html, /#overlay\.clothespage \.clothes-scroll-rail\{pointer-events:auto;touch-action:none/);
assert.match(html, /clothesRail\.addEventListener\('pointerdown'/);
assert.match(html, /clothesRail\.addEventListener\('pointermove'/);
assert.match(html, /menuPanel\.scrollTop=progress\*Math\.max/);
for(const name of ['denim','flower','forest','disco','coral','midnight'])assert.match(html,new RegExp("id:'"+name+"',name:"));
assert.match(html, /localStorage\.setItem\('grandma-clothes'/);
assert.match(html, /selectedClothes=item\.id/);
const script=html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];assert.ok(script);new Function(script);
console.log('PASS unified wardrobe scrollbar, draggable hanger, six outfits, inventory and JS syntax');

// Rail begins underneath all controls rather than covering the shop's tabs or coin badge.
assert.match(html, /top:var\(--wardrobe-rail-top,45%\)/);
assert.match(html, /function syncClothesRailOffset\(\)/);
assert.match(html, /originalMetaBottom=meta\.getBoundingClientRect\(\)\.bottom\+menuPanel\.scrollTop/);
assert.match(html, /Math\.max\(originalMetaBottom,tabBottom\)-overlayTop\+14/);
assert.match(html, /requestAnimationFrame\(\(\)=>\{syncClothesRailOffset\(\);syncClothesHanger\(\);refreshHangerAnimation\(\)\}\)/);
