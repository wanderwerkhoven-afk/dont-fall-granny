import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync('index.html', 'utf8');
const sprite = readFileSync('assets/hanger-spritesheet.svg', 'utf8');
const workflow = readFileSync('.github/workflows/deploy-wooden-hanger.yml', 'utf8');

// The six 120px cells must have one whole hanger centered in each frame.
const uses = [...sprite.matchAll(/<use href="#hanger" transform="([^"]+)"\s*\/>/g)];
assert.equal(uses.length, 6, 'Expected six hanger uses');
const expectedCenters = [60, 180, 300, 420, 540, 660];
uses.forEach((use, index) => {
  const transform = use[1];
  const translated = transform.match(/^translate\((\d+)(?: (\d+))?\)/);
  assert.ok(translated, `Frame ${index + 1} has no translation`);
  // Rotated instances translate their source center (60,58) to the cell center.
  // Unrotated instances translate the source image origin by index*120.
  const actualCenter = Number(translated[1]) + (transform.includes('rotate(') ? 0 : 60);
  assert.equal(actualCenter, expectedCenters[index], `Frame ${index + 1} is misaligned`);
});
assert.match(sprite, /width="720" height="120"/);
assert.match(sprite, /viewBox="0 0 720 120"/);
assert.equal((sprite.match(/<use href="#hanger"/g) || []).length, 6);
assert.match(html, /assets\/hanger-spritesheet\.svg/);
assert.doesNotMatch(html, /assets\/hanger-spritesheet\.png/);
assert.match(html, /background-size:432px 72px/);
assert.match(html, /background-size:348px 58px/);
assert.match(html, /function setHangerFrame\(/);
assert.match(html, /function syncClothesHanger\(/);

// Selected outfit drives the menu hero and survives the shop rerender.
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

// A green build must ship the sprite, not only index.html.
assert.match(workflow, /node tests\/store-regression\.mjs/);
assert.match(workflow, /cp -R assets\/\. _site\/assets\//);
assert.match(workflow, /test -s _site\/assets\/hanger-spritesheet\.svg/);
assert.match(workflow, /deploy-pages@v4/);

// Catch game-breaking parser errors without executing browser-only DOM code.
const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert.ok(script, 'Inline game script not found');
new Function(script);
console.log('PASS: six correctly centered sprite frames, asset deployment, clothing preview, shop state and JS syntax');
