from pathlib import Path
p=Path('index.html'); s=p.read_text()
def replace(a,b):
 global s
 assert s.count(a)==1, f'Expected unique anchor: {a[:90]!r}, found {s.count(a)}'
 s=s.replace(a,b)
replace(" {id:'mint',name:'Mintgroen',cost:28,color:'#4eb79b',hair:'#f3e9e1'}", " {id:'mint',name:'Mintgroen',cost:28,color:'#4eb79b',hair:'#f3e9e1'},\n {id:'denim',name:'Denim diva',cost:18,color:'#426c9e',hair:'#f2e4cf'},\n {id:'flower',name:'Bloemenfeest',cost:24,color:'#ed87ac',hair:'#f8f0de'},\n {id:'forest',name:'Boswandeling',cost:30,color:'#477a53',hair:'#ded9ca'},\n {id:'disco',name:'Disco oma',cost:48,color:'#b55dcd',hair:'#f9e6ac'},\n {id:'coral',name:'Koraal chic',cost:34,color:'#f4866a',hair:'#e6e4e3'},\n {id:'midnight',name:'Middernacht',cost:62,color:'#263e63',hair:'#e6d7f3'}")
replace("@media(max-width:650px){.clothes-hanger{width:58px;height:58px;left:-19px;background-size:348px 58px}}", "@media(max-width:650px){.clothes-hanger{width:58px;height:58px;left:-19px;background-size:348px 58px}}\n/* One scroll container for wardrobe: no nested scroll conflicting with the hanger. */\n#overlay.clothespage #menuContent{max-height:none;overflow:visible}\n#overlay.clothespage .panel{overflow-y:auto;overflow-x:hidden;scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}\n#overlay.clothespage .panel::-webkit-scrollbar{display:none;width:0;height:0}\n#overlay.clothespage .clothes-scroll-rail{pointer-events:auto;touch-action:none;cursor:grab;width:44px;user-select:none;-webkit-user-select:none}\n#overlay.clothespage .clothes-scroll-rail:active{cursor:grabbing}\n@media(max-width:650px){#overlay.clothespage .clothes-scroll-rail{right:3px;transform:none;top:27%;bottom:6%}#overlay.clothespage .panel{max-height:calc(100% - 18px)}}")
replace("menuPanel.addEventListener('scroll',syncClothesHanger,{passive:true});", """// The rail is an actual draggable scrollbar, using the same panel as touch scrolling.
let hangerDragPointer=null;
function scrollWardrobeRail(event){
 const bounds=clothesRail.getBoundingClientRect();
 const available=Math.max(1,bounds.height-clothesHanger.offsetHeight);
 const progress=Math.max(0,Math.min(1,(event.clientY-bounds.top-clothesHanger.offsetHeight/2)/available));
 menuPanel.scrollTop=progress*Math.max(0,menuPanel.scrollHeight-menuPanel.clientHeight);
 syncClothesHanger();
}
clothesRail.addEventListener('pointerdown',event=>{
 if(menuPage!=='clothes'||event.button!==0)return;
 hangerDragPointer=event.pointerId;
 clothesRail.setPointerCapture(event.pointerId);
 scrollWardrobeRail(event);
 event.preventDefault();
});
clothesRail.addEventListener('pointermove',event=>{if(event.pointerId===hangerDragPointer)scrollWardrobeRail(event)});
function stopWardrobeDrag(event){if(event.pointerId===hangerDragPointer)hangerDragPointer=null}
clothesRail.addEventListener('pointerup',stopWardrobeDrag);
clothesRail.addEventListener('pointercancel',stopWardrobeDrag);
menuPanel.addEventListener('scroll',syncClothesHanger,{passive:true});""")
p.write_text(s)
t=Path('tests/wardrobe-scroll-outfits.mjs')
t.write_text("""import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
assert.match(html, /#overlay\\.clothespage #menuContent\\{max-height:none;overflow:visible\\}/);
assert.match(html, /#overlay\\.clothespage \\.panel\\{overflow-y:auto;overflow-x:hidden;scrollbar-width:none/);
assert.match(html, /#overlay\\.clothespage \\.clothes-scroll-rail\\{pointer-events:auto;touch-action:none/);
assert.match(html, /clothesRail\\.addEventListener\\('pointerdown'/);
assert.match(html, /clothesRail\\.addEventListener\\('pointermove'/);
assert.match(html, /menuPanel\\.scrollTop=progress\\*Math\\.max/);
for(const name of ['denim','flower','forest','disco','coral','midnight'])assert.match(html,new RegExp("id:'"+name+"',name:"));
assert.match(html, /localStorage\\.setItem\\('grandma-clothes'/);
assert.match(html, /selectedClothes=item\\.id/);
const script=html.match(/<script>\\s*([\\s\\S]*?)\\s*<\\/script>/)?.[1];assert.ok(script);new Function(script);
console.log('PASS unified wardrobe scrollbar, draggable hanger, six outfits, inventory and JS syntax');
""")
print('PASS generated wardrobe patch and regression test')
