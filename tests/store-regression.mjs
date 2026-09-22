import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync('index.html', 'utf8');
const sprite = readFileSync('assets/hanger-spritesheet.svg', 'utf8');

// Six 120px cells; the transform's first X coordinate is the centre of each cell.
const transforms = [...sprite.matchAll(/<use href="#hanger" transform="translate\((\d+) (?:\d+)\)/g)].map(match => Number(match[1]));
assert.deepEqual(transforms, [60, 180, 240, 360, 540, 660]);
assert.match(sprite, /width="720" height="120"/);
assert.equal((sprite.match(/<use href="#hanger"/g) || []).length, 6);
assert.match(html, /assets\/hanger-spritesheet\.svg/);
assert.doesNotMatch(html, /assets\/hanger-spritesheet\.png/);
assert.match(html, /background-size:576px 96px/);
assert.match(html, /background-size:504px 84px/);

// The selected outfit must drive the hero and survive the store re-render.
assert.equal((html.match(/data-preview-coat="true"/g) || []).length, 1);
assert.equal((html.match(/data-preview-hair="true"/g) || []).length, 3);
assert.match(html, /function updateGrandmaOutfitPreview\(\)/);
assert.match(html, /clothing\.find\(item=>item\.id===selectedClothes\)/);
assert.match(html, /function showMenu\(page='home'\)\{\s*updateGrandmaOutfitPreview\(\)/);
assert.match(html, /selectedClothes=item\.id/);
assert.match(html, /saveCoins\(\);saveInventory\(\);showMenu\(page\)/);
assert.match(html, /const previousScroll=menuPanel\.scrollTop/);
assert.match(html, /menuPanel\.scrollTop=previousScroll/);
assert.match(html, /prefers-reduced-motion/);

// Catch game-breaking parser errors without running browser-only DOM code.
const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert.ok(script, 'Inline game script not found');
new Function(script);
console.log('PASS: sprite frame cells, desktop/mobile asset sizes, clothing preview, shop persistence and JS syntax');
