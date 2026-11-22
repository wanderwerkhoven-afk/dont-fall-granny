import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync('app.js','utf8');
const meta=readFileSync('game-meta.js','utf8');
const style=readFileSync('style.css','utf8');
const mastery=readFileSync('world-mastery.js','utf8');
new Function(app);
const w={};new Function('window',meta)(w);new Function('window',mastery)(w);
const hats=w.GrannyMeta.cosmetics.filter(item=>item.type==='hat');
assert.equal(hats.length,13,'Twelve purchasable hats plus a free remove-hat option');
assert.equal(hats.filter(item=>item.cost>0).length,12);
assert.equal(hats.find(item=>item.id==='hat-none')?.cost,0);
assert.equal(new Set(hats.map(item=>item.id)).size,13);
assert.equal(hats.filter(item=>item.masteryRequirement).length,7);
assert.ok(hats.filter(item=>item.cost>0).every(item=>item.cost>=4000),'Hats must remain aspirational purchases');
assert.ok(hats.every(item=>item.hatColor&&item.hatAccent&&item.hatStyle));
const svgStart=app.indexOf('function hatSvgArt(');
const drawStart=app.indexOf('function drawGrannyHat(',svgStart);
const previewStart=app.indexOf('function updateGrandmaOutfitPreview(',drawStart);
assert.ok(svgStart>=0&&drawStart>svgStart&&previewStart>drawStart);
const hatSvgArt=new Function(app.slice(svgStart,drawStart)+'return hatSvgArt;')();
assert.equal(hatSvgArt(hats.find(item=>item.id==='hat-none')),'');
for(const item of hats.filter(item=>item.hatStyle!=='none')){
 const svg=hatSvgArt(item);
 assert.match(svg,/granny-hat-art/);
 assert.ok(svg.includes(item.hatColor),item.id+' needs its own hat color');
 assert.ok(svg.includes(item.hatAccent),item.id+' needs its own trim');
 assert.ok(svg.includes('<path')||svg.includes('<ellipse'));
}
const ctx={
 save(){},restore(){},translate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},
 ellipse(){},set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){}
};
const drawCalls=[];
const render=new Function('ctx','rounded','line',app.slice(drawStart,previewStart)+'return drawGrannyHat;')(ctx,(...a)=>drawCalls.push(['rounded',...a]),(...a)=>drawCalls.push(['line',...a]));
for(const item of hats)assert.doesNotThrow(()=>render(item,100,90,0),item.id+' must render without throwing');
assert.ok(drawCalls.length>0,'Canvas hat rendering must draw details');
assert.match(app,/selectedAccessories=\{cane:'cane-classic',glasses:null,companion:null,hat:'hat-none'\}/);
assert.match(app,/selectedAccessories=\{\.\.\.selectedAccessories,\.\.\.\(savedMeta\.selectedAccessories\|\|\{\}\)\}/,'Old saves remain compatible');
assert.match(app,/drawGrannyHat\(hatItem,x,y,bob\)/,'Draw hat on the live Granny');
assert.match(app,/hatSvgArt\(hat\)/,'Show equipped hat in Granny portrait');
assert.match(app,/hatSvgArt\(item\)/,'Show original hat artwork on store card');
assert.match(app,/data-cosmetic-filter/);
assert.match(app,/cosmeticFilter=type/);
assert.match(app,/const unlock=item\?\.masteryUnlock\|\|item\?\.masteryRequirement/);
assert.match(app,/if\(masteryShopGate\(item\)\.locked\|\|coins<item\.cost\)return/);
assert.match(style,/\.store-item\[data-cosmetic-type\]\[hidden\]/);
const gateStart=app.indexOf('function masteryShopGate('),gateEnd=app.indexOf('function masteryFor(',gateStart);
const state={mastery:{}};
const shopGate=new Function('WORLD_MASTERY','metaState',app.slice(gateStart,gateEnd)+'return masteryShopGate;')(w.GrannyWorldMastery,state);
const rare=hats.find(item=>item.id==='hat-witch');
assert.equal(shopGate(rare).locked,true);
assert.equal(shopGate(rare,true).locked,false,'Existing purchase remains usable');
state.mastery[rare.masteryRequirement.world]={stars:{[rare.masteryRequirement.star]:true}};
assert.equal(shopGate(rare).locked,false,'World Mastery unlocks rare hat purchase');
assert.equal(shopGate(hats[0]).locked,false,'Free remove-hat option stays available');
console.log('PASS hats: 12 drawable styles, free removal, category filters, canvas/portrait/store art, purchase and Mastery persistence');
