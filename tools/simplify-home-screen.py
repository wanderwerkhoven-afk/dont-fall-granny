from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert s.count('</style>') == 1
assert '/* Home screen: hero first, no redundant explanations. */' not in s
assert 'id="menuGrandma"' in s and 'id="startBtn"' in s
css='''
/* Home screen: hero first, no redundant explanations. Preserve store and game-over UI. */
#overlay:not(.storepage):not(.gameover) #menuContent,
#overlay:not(.storepage):not(.gameover) #menuGuide,
#overlay:not(.storepage):not(.gameover) #overlayTitle,
#overlay:not(.storepage):not(.gameover) #overlayText{display:none!important}
#overlay:not(.storepage):not(.gameover) #startBtn{display:block;margin:20px 0 2px;min-height:60px}
#overlay:not(.storepage):not(.gameover) .menu-hero{display:grid}
@media(max-width:650px){
 #overlay:not(.storepage):not(.gameover){align-items:start}
 #overlay:not(.storepage):not(.gameover) .panel{margin-top:clamp(8px,2dvh,24px);max-height:calc(100% - 24px);overflow-y:auto}
 #overlay:not(.storepage):not(.gameover) #startBtn{margin-top:18px;min-height:60px}
}
'''
s=s.replace('</style>',css+'</style>')
p.write_text(s,encoding='utf-8')
t=Path('tests/home-screen-regression.mjs')
t.write_text('''import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
assert.ok(html.includes('/* Home screen: hero first, no redundant explanations.'));
for(const id of ['menuContent','menuGuide','overlayTitle','overlayText']) assert.ok(html.includes('#overlay:not(.storepage):not(.gameover) #'+id),id+' only hidden on home');
assert.ok(html.includes('#overlay:not(.storepage):not(.gameover) .menu-hero{display:grid}'));
assert.ok(html.includes('#overlay:not(.storepage):not(.gameover) #startBtn{display:block'));
assert.ok(html.includes('#overlay:not(.storepage):not(.gameover){align-items:start}'));
for(const id of ['menuGrandma','menuTabs','menuRecord','menuWallet','startBtn','clothesScrollRail']) assert.ok(html.includes('id="'+id+'"'),id+' preserved');
assert.ok(html.includes("function showMenu(page='home')"));
const script=html.split('<script>')[1]?.split('</script>')[0];assert.ok(script);new Function(script);
console.log('PASS compact home, hero preserved, start action present, shops isolated, JS syntax');
''',encoding='utf-8')
print('PASS home-screen patch generated')
