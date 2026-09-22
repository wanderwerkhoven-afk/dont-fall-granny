from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='/* Mobile viewport: use available screen space without covering controls. */'
assert marker not in s
assert s.count('</style>')==1
assert 'function syncClothesRailOffset()' in s
assert 'id="menuGrandma"' in s
css='''
/* Mobile viewport: use available screen space without covering controls. */
@media(max-width:650px) and (orientation:portrait){
 body{padding:max(3px,env(safe-area-inset-top)) 3px max(3px,env(safe-area-inset-bottom))}
 .shell{gap:3px}
 header{padding:0 5px;margin:0}
 header h1{font-size:clamp(19px,5vw,25px);line-height:1.12}
 .game{border-width:2px;border-radius:14px}
 #overlay{padding:4px;overflow:hidden}
 #overlay .panel{width:100%;max-width:none;max-height:100%;height:100%;padding:10px 12px 14px;border-width:2px;border-radius:15px;box-shadow:none;min-height:0}
 #overlay:not(.storepage):not(.gameover){align-items:stretch}
 #overlay:not(.storepage):not(.gameover) .panel{display:flex;flex-direction:column;margin:0;max-height:100%;overflow-y:auto}
 #overlay:not(.storepage):not(.gameover) .menu-hero{height:clamp(122px,24dvh,205px);flex:0 0 auto}
 #overlay:not(.storepage):not(.gameover) .menu-grandma{height:100%;display:grid;place-items:center}
 #overlay:not(.storepage):not(.gameover) .menu-grandma svg{height:min(95%,174px);width:auto}
 #overlay:not(.storepage):not(.gameover) .menu-kicker{margin:10px 0 6px}
 #overlay:not(.storepage):not(.gameover) .menu-tabs{margin:5px 0 8px}
 #overlay:not(.storepage):not(.gameover) .menu-meta{margin:5px 0}
 #overlay:not(.storepage):not(.gameover) #startBtn{margin-top:auto;margin-bottom:4px;min-height:60px;flex:0 0 auto}
 #overlay.storepage .panel{padding:8px 9px 12px;overflow-y:auto;overflow-x:hidden}
 #overlay.storepage .menu-hero{height:66px}
 #overlay.storepage .menu-grandma{height:64px}
 #overlay.storepage .menu-grandma svg{height:62px}
 #overlay.storepage .menu-kicker{margin:5px 0 3px;font-size:9px}
 #overlay.storepage .menu-tabs{margin:4px 0 6px}
 #overlay.storepage .menu-meta{margin:5px 0}
 #overlay.clothespage .store-grid{margin:8px 48px 12px 0;gap:8px}
 #overlay.clothespage .store-item{min-height:100px;padding:8px;grid-template-columns:62px minmax(0,1fr);column-gap:8px;row-gap:3px}
 #overlay.clothespage .store-item .preview{width:62px;height:65px}
 #overlay.clothespage .store-item .preview svg{max-width:100%;height:53px}
 #overlay.clothespage .store-item button{min-height:44px}
 #overlay.clothespage .clothes-scroll-rail{right:3px;top:var(--wardrobe-rail-top,45%);bottom:4%}
}
@media(max-width:650px) and (orientation:portrait) and (max-height:620px){
 #overlay:not(.storepage):not(.gameover) .menu-hero{height:100px}
 #overlay:not(.storepage):not(.gameover) #startBtn{margin-top:12px}
}
'''
s=s.replace('</style>',css+'</style>')
p.write_text(s,encoding='utf-8')
print('PASS: mobile viewport styles applied, grandma preserved, rail calculation preserved')
