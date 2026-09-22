import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const path='index.html';let html=readFileSync(path,'utf8');
const once=(before,after)=>{assert.equal(html.split(before).length-1,1,`Expected exactly one occurrence: ${before.slice(0,70)}`);html=html.replace(before,after)};
// Give the existing SVG outfit elements stable identifiers, without changing their geometry.
once('<div class="menu-grandma" id="menuGrandma"><svg','<div class="menu-grandma" id="menuGrandma"><svg');
// The original coat is one path, identified by its fixed color. Keep SVG unchanged apart from a data hook.
once('L86 96 Q54 115 24 96Z" fill="#9b6bb0"','L86 96 Q54 115 24 96Z" data-preview-coat="true" fill="#9b6bb0"');
// The hair cap and side curls share the original white hair; target all three via current fill without touching skin.
once('Q40 16 27 34" fill="#f4f1ee"','Q40 16 27 34" data-preview-hair="true" fill="#f4f1ee"');
once('<circle cx="27" cy="36" r="9" fill="#f4f1ee"','<circle cx="27" cy="36" r="9" data-preview-hair="true" fill="#f4f1ee"');
once('<circle cx="84" cy="36" r="9" fill="#f4f1ee"','<circle cx="84" cy="36" r="9" data-preview-hair="true" fill="#f4f1ee"');
const inventory='function saveInventory(){try{localStorage.setItem(\'grandma-clothes\',JSON.stringify(ownedClothes));localStorage.setItem(\'grandma-outfit\',selectedClothes);localStorage.setItem(\'grandma-gadgets\',JSON.stringify(ownedGadgets))}catch(e){}}';
assert.ok(html.includes(inventory),'Inventory storage marker not found');
const add=`\nfunction updateGrandmaOutfitPreview(){\n const outfit=clothing.find(item=>item.id===selectedClothes)||clothing[0];\n const hero=document.getElementById('menuGrandma');\n if(!hero)return;\n hero.querySelector('[data-preview-coat]')?.setAttribute('fill',outfit.color);\n hero.querySelectorAll('[data-preview-hair]').forEach(part=>part.setAttribute('fill',outfit.hair));\n hero.setAttribute('aria-label','Oma draagt: '+outfit.name);\n}\n`;
html=html.replace(inventory,inventory+add);
const menu='function showMenu(page=\'home\'){\n menuPage=page;';
once(menu,"function showMenu(page='home'){\n updateGrandmaOutfitPreview();\n menuPage=page;");
// Existing menu rerender after purchase calls showMenu(page), so the preview updates both on equip and first render.
assert.match(html,/selectedClothes=item\.id/);
assert.match(html,/saveCoins\(\);saveInventory\(\);showMenu\(page\)/);
assert.match(html,/function updateGrandmaOutfitPreview\(\)/);
writeFileSync(path,html);console.log('PASS preview coat and three hair parts share selected outfit and update on menu render');
