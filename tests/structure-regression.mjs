import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync('index.html','utf8');
const css=readFileSync('style.css','utf8');
const script=readFileSync('app.js','utf8');

assert.match(html, /<link rel="stylesheet" href="style\.css">/, 'External stylesheet missing');
assert.match(html, /<script src="app\.js" defer><\/script>/, 'External app script missing');
assert.doesNotMatch(html, /<style>/, 'Inline stylesheet should stay extracted');
assert.doesNotMatch(html, /<script>\s*\(\(\)=>/, 'Game logic should stay extracted');
assert.match(html, /id="appVersion"[^>]*><\/div>/, 'Version mount point missing');
assert.doesNotMatch(html, /id="shop"[^>]*style=/, 'Shop presentation should live in CSS');
assert.match(css, /#shop\{display:none;gap:8px;flex-wrap:wrap;justify-content:center;margin:12px 0\}/, 'Shop base styling missing');
assert.match(script, /const APP_VERSION='V\.1\.0\.0\.2';/, 'Canonical release version missing');
assert.match(script, /appVersionEl\.textContent=APP_VERSION/, 'Version is not mounted into the UI');
assert.match(css, /assets\/hanger-spritesheet\.svg/, 'Sprite reference moved out of deployable CSS');
assert.match(css, /Release marker: mirrors the visible version workflow used in DONE/);
assert.match(script, /class RecoveryWindowController/);
assert.match(script, /function showMenu\(page='home'\)/);
new Function(script);

console.log('PASS external bundle structure, centralized V.1.0.0.2 version, CSS-owned shop and app JS syntax');
