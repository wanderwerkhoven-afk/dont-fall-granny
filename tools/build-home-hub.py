from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert s.count('</style>')==1
assert '/* Centered home hub with square shop destinations. */' not in s
old='<button data-page="home" class="active">🏠 Start</button>'
assert s.count(old)==1
s=s.replace(old,'<button data-page="home" class="menu-back" aria-label="Terug naar het startscherm">← Terug</button>')
old="menuContent.innerHTML='<div class=\"home-cards\"><div class=\"home-card\"><span class=\"home-card-icon\">🏃</span><b>REN ZO VER JE KUNT</b><small>Spring over hindernissen en haal de volgende wereld.</small></div><div class=\"home-card\"><span class=\"home-card-icon\">✦</span><b>VERZAMEL & ONTGRENDEL</b><small>Spaar munten voor outfits en zeldzame voertuigen.</small></div></div>';return"
assert s.count(old)==1
new="menuContent.innerHTML='<div class=\"home-hub\"><button class=\"home-hub-tile\" type=\"button\" data-open-page=\"clothes\" aria-label=\"Open outfits\"><span class=\"tile-icon\" aria-hidden=\"true\">👗</span><b>Outfits</b></button><button class=\"home-hub-tile\" type=\"button\" data-open-page=\"gadgets\" aria-label=\"Open gadgets\"><span class=\"tile-icon\" aria-hidden=\"true\">🛠</span><b>Gadgets</b></button><div class=\"home-achievement\" role=\"status\" aria-label=\"Persoonlijk afstandsrecord\"><small>🏆 JOUW PRESTATIE</small><strong>🏁 '+best+' m</strong></div></div>';return"
s=s.replace(old,new)
anchor="menuTabs.addEventListener('click',e=>{"
assert s.count(anchor)==1
s=s.replace(anchor,"menuContent.addEventListener('click',e=>{const tile=e.target.closest('[data-open-page]');if(!tile||menuPage!=='home')return;showMenu(tile.dataset.openPage);overlay.querySelector('.panel').scrollTop=0;});\n"+anchor)
css='''
/* Centered home hub with square shop destinations. */
#overlay:not(.storepage):not(.gameover) .menu-hero{display:grid;place-items:center;justify-items:center;width:100%;margin-inline:auto}
#overlay:not(.storepage):not(.gameover) .menu-grandma{width:100%;margin:0 auto;display:grid;place-items:center}
#overlay:not(.storepage):not(.gameover) .menu-grandma svg{display:block;margin:auto}
#overlay:not(.storepage):not(.gameover) .hero-shadow{left:50%;transform:translateX(-50%)}
#overlay:not(.storepage):not(.gameover) #menuTabs{display:none!important}
#overlay:not(.storepage):not(.gameover) #menuContent{display:block!important;max-height:none;overflow:visible;width:100%;margin:12px 0 0;flex:0 0 auto}
#overlay:not(.storepage):not(.gameover) .menu-meta #menuRecord{display:none}
#overlay:not(.storepage):not(.gameover) .menu-meta{justify-content:center}
.home-hub{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;width:100%}
.home-hub-tile{aspect-ratio:1;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;border:3px solid #493e49;border-radius:18px;background:linear-gradient(155deg,#fff4d6,#e8edff);box-shadow:0 4px 0 #493e49;color:#302633;font:inherit;cursor:pointer;touch-action:manipulation}
.home-hub-tile:nth-child(2){background:linear-gradient(155deg,#e1f4ec,#e0eaff)}
.home-hub-tile .tile-icon{font-size:clamp(36px,9vw,55px);line-height:1.1}
.home-hub-tile b{font-size:clamp(16px,4vw,21px);line-height:1.1}
.home-hub-tile:active{transform:translateY(3px);box-shadow:0 1px 0 #493e49}
.home-hub-tile:focus-visible{outline:3px solid #256f9e;outline-offset:3px}
.home-achievement{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;border:2px solid #493e49;border-radius:14px;background:#fffaf2;padding:12px 15px;color:#30263f}
.home-achievement small{font:900 11px system-ui;letter-spacing:.5px}
.home-achievement strong{font:900 20px system-ui;white-space:nowrap}
#overlay.storepage #menuTabs .menu-back{background:#fff8ec;font-size:12px}
@media(max-width:650px) and (orientation:portrait){
 #overlay:not(.storepage):not(.gameover) .menu-hero{flex:1 1 auto;min-height:105px;max-height:260px;height:auto}
 #overlay:not(.storepage):not(.gameover) .menu-kicker{margin:5px 0}
 #overlay:not(.storepage):not(.gameover) #menuContent{margin:9px 0 0}
 .home-hub{gap:10px}
 .home-hub-tile{border-radius:16px;gap:5px;padding:6px;max-height:185px}
 .home-hub-tile .tile-icon{font-size:clamp(34px,9vw,47px)}
 .home-hub-tile b{font-size:16px}
 .home-achievement{padding:10px 12px}
 .home-achievement small{font-size:10px}
 .home-achievement strong{font-size:18px}
 #overlay:not(.storepage):not(.gameover) #startBtn{margin-top:auto;min-height:58px}
}
@media(max-width:650px) and (orientation:portrait) and (max-height:620px){
 #overlay:not(.storepage):not(.gameover) .menu-hero{min-height:70px;max-height:100px}
 .home-hub{gap:6px}
 .home-hub-tile{max-height:120px}
 .home-achievement{padding:6px 10px}
}
@media(prefers-reduced-motion:reduce){.home-hub-tile{transition:none}}
'''
s=s.replace('</style>',css+'</style>')
p.write_text(s,encoding='utf-8')
assert 'data-open-page="clothes"' in s and 'data-open-page="gadgets"' in s
assert '🏠 Start</button>' not in s
assert s.count('/* Centered home hub with square shop destinations. */')==1
print('PASS centered home hub patch, accessible navigation, best score and grandma retained')
