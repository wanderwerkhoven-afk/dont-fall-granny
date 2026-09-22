from pathlib import Path
p=Path('index.html')
s=p.read_text()
def patch(old,new):
 global s
 assert s.count(old)==1, f'Expected unique anchor ({s.count(old)}): {old[:100]}'
 s=s.replace(old,new)
# Keep existing one-column cards and the 44px sprite. Move the whole decorative/drag rail beneath the tabs AND wallet row.
patch(' #overlay.clothespage .clothes-scroll-rail{right:5px;width:44px;top:25%;bottom:6%;transform:none}', ' #overlay.clothespage .clothes-scroll-rail{right:5px;width:44px;top:var(--wardrobe-rail-top,45%);bottom:6%;transform:none}')
patch(' requestAnimationFrame(()=>{syncClothesHanger();refreshHangerAnimation()});', ' requestAnimationFrame(()=>{syncClothesRailOffset();syncClothesHanger();refreshHangerAnimation()});')
patch("const clothesRail=document.getElementById('clothesScrollRail'),clothesHanger=document.getElementById('clothesHanger'),menuPanel=overlay.querySelector('.panel');", """const clothesRail=document.getElementById('clothesScrollRail'),clothesHanger=document.getElementById('clothesHanger'),menuPanel=overlay.querySelector('.panel');
// The rail is viewport-positioned alongside the scrolling panel, not part of its content.
// Calculate the original bottom of the controls (before panel scrolling), so it never
// crosses Start/Kleding/Gadgets or the record/wallet while the wardrobe scrolls.
function syncClothesRailOffset(){
 if(menuPage!=='clothes')return;
 const meta=overlay.querySelector('.menu-meta');
 if(!meta)return;
 const overlayTop=overlay.getBoundingClientRect().top;
 const originalMetaBottom=meta.getBoundingClientRect().bottom+menuPanel.scrollTop;
 const tabBottom=menuTabs.getBoundingClientRect().bottom;
 const desired=Math.max(originalMetaBottom,tabBottom)-overlayTop+14;
 const maxTop=Math.max(0,overlay.clientHeight-100);
 overlay.style.setProperty('--wardrobe-rail-top',Math.round(Math.min(desired,maxTop))+'px');
}
window.addEventListener('resize',()=>requestAnimationFrame(()=>{syncClothesRailOffset();syncClothesHanger()}));""")
p.write_text(s)
# Keep permanent regression guard for the correct mobile rail start and scroll mapping.
t=Path('tests/wardrobe-scroll-outfits.mjs')
spec=t.read_text()
spec += "\n// Rail begins underneath all controls rather than covering the shop's tabs or coin badge.\nassert.match(html, /top:var\\(--wardrobe-rail-top,45%\\)/);\nassert.match(html, /function syncClothesRailOffset\\(\\)/);\nassert.match(html, /originalMetaBottom=meta\\.getBoundingClientRect\\(\\)\\.bottom\\+menuPanel\\.scrollTop/);\nassert.match(html, /Math\\.max\\(originalMetaBottom,tabBottom\\)-overlayTop\\+14/);\nassert.match(html, /requestAnimationFrame\\(\\(\\)=>\\{syncClothesRailOffset\\(\\);syncClothesHanger\\(\\);refreshHangerAnimation\\(\\)\\}\\)/);\n"
t.write_text(spec)
print('PASS rail anchored beneath tabs and meta with preserved one-column wardrobe and scroll logic')
