from pathlib import Path
p=Path('index.html'); s=p.read_text()
def replace(old,new):
 global s
 assert s.count(old)==1,(old[:80],s.count(old))
 s=s.replace(old,new)
# Preserve all IDs and existing purchases; only change prices and visual metadata.
prices={'red':(250,'stripes'),'sport':(325,'chevron'),'gold':(700,'stars'),'night':(825,'dots'),'mint':(375,'dots'),'denim':(425,'checks'),'flower':(475,'flowers'),'forest':(550,'leaves'),'disco':(950,'sparkles'),'coral':(625,'waves'),'midnight':(1200,'stars')}
colors={'stripes':'#ffe0e2','chevron':'#d8eef8','stars':'#ffeab0','dots':'#def7ed','checks':'#d8e6f5','flowers':'#fff2cd','leaves':'#d2e8bd','sparkles':'#fbe9ae','waves':'#ffe3d8'}
import re
for ident,(price,pattern) in prices.items():
 rx=r"(\{id:'"+ident+r"',name:'[^']+',cost:)\d+(,color:'[^']+',hair:'[^']+')(\})"
 matches=list(re.finditer(rx,s));assert len(matches)==1,(ident,len(matches))
 s=re.sub(rx,lambda m:m.group(1)+str(price)+m.group(2)+",pattern:'"+pattern+"',patternColor:'"+colors[pattern]+"'"+m.group(3),s,count=1)
# Mobile cards are horizontal, in one column. Give the visible rail a dedicated gutter.
style='''
/* Boutique mobile: one scroll surface and a clear rail gutter; no cards under hanger. */
@media(max-width:650px){
 #overlay.clothespage .panel{padding:12px 12px 18px;overflow-y:auto;overflow-x:hidden}
 #overlay.clothespage .store-grid{grid-template-columns:minmax(0,1fr);gap:10px;margin:10px 49px 18px 0}
 #overlay.clothespage .store-item{display:grid;grid-template-columns:72px minmax(0,1fr);grid-template-areas:'preview name' 'preview details' 'preview action';column-gap:10px;row-gap:4px;min-height:112px;padding:10px;text-align:left;align-items:center}
 #overlay.clothespage .store-item .preview{grid-area:preview;width:72px;height:76px;align-self:center}
 #overlay.clothespage .store-item b{grid-area:name;font-size:13px;line-height:1.2;padding-right:2px}
 #overlay.clothespage .store-item small{grid-area:details;min-height:0;font-size:10px;line-height:1.2;flex:none}
 #overlay.clothespage .store-item button{grid-area:action;min-height:44px;margin:0;font-size:11px}
 #overlay.clothespage .store-item.selected::before{top:3px;right:3px;font-size:7px;padding:2px 3px}
 #overlay.clothespage .clothes-scroll-rail{right:5px;width:44px;top:25%;bottom:6%;transform:none}
 #overlay.clothespage .clothes-pole{left:21px}
 #overlay.clothespage .clothes-hanger{left:0;width:44px;height:44px;background-size:264px 44px}
 #overlay.clothespage .menu-tabs{background:#fff8ec;isolation:isolate}
}
'''
replace('</style>',style+'</style>')
replace("function hangerFrameSize(){return window.matchMedia('(max-width:650px)').matches?58:72}","function hangerFrameSize(){return window.matchMedia('(max-width:650px)').matches?44:72}")
# SVG motifs share one definition and a clipped garment overlay for shop and large hero.
helper='''function outfitPatternSvg(outfit,id,coatPath){
 if(!outfit.pattern)return '';
 const c=outfit.patternColor||'#fff5df';
 const motifs={
 stripes:`<path d="M2 0V12 M9 0V12" stroke="${c}" stroke-width="2"/>`,
 chevron:`<path d="M0 3L3 7L6 3L9 7L12 3" fill="none" stroke="${c}" stroke-width="1.8"/>`,
 stars:`<path d="M6 1L7.5 4.5L11 5L8 7.5L9 11L6 9L3 11L4 7.5L1 5L4.5 4.5Z" fill="${c}"/>`,
 dots:`<circle cx="3" cy="3" r="1.9" fill="${c}"/><circle cx="9" cy="9" r="1.9" fill="${c}"/>`,
 checks:`<path d="M0 0V12 M6 0V12 M12 0V12 M0 0H12 M0 6H12 M0 12H12" fill="none" stroke="${c}" stroke-width="1"/>`,
 flowers:`<circle cx="6" cy="3" r="2.7" fill="${c}"/><circle cx="3" cy="6" r="2.7" fill="${c}"/><circle cx="9" cy="6" r="2.7" fill="${c}"/><circle cx="6" cy="9" r="2.7" fill="${c}"/><circle cx="6" cy="6" r="1.6" fill="#f5bd55"/>`,
 leaves:`<path d="M1 10Q1 2 10 1Q10 10 1 10M2 10L9 2" fill="${c}" stroke="#558960" stroke-width=".7"/>`,
 sparkles:`<path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="${c}"/>`,
 waves:`<path d="M0 4Q3 0 6 4T12 4M0 10Q3 6 6 10T12 10" stroke="${c}" stroke-width="1.6" fill="none"/>`
 };
 return `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="12" height="12">${motifs[outfit.pattern]||motifs.dots}</pattern></defs><path d="${coatPath}" fill="url(#${id})" pointer-events="none"/>`;
}
function drawOutfitPattern(outfit,x,y,bob){
 if(!outfit.pattern)return;
 ctx.save();ctx.beginPath();ctx.roundRect(x+5,y+28+bob,36,31,11);ctx.clip();
 ctx.strokeStyle=outfit.patternColor||'#fff5df';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=1.5;
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){
  const px=x+9+col*10,py=y+31+bob+row*9;
  if(outfit.pattern==='stripes'||outfit.pattern==='checks'){ctx.beginPath();ctx.moveTo(px,py-3);ctx.lineTo(px,py+8);ctx.stroke();if(outfit.pattern==='checks'){ctx.beginPath();ctx.moveTo(px-4,py+3);ctx.lineTo(px+6,py+3);ctx.stroke()}}
  else if(outfit.pattern==='waves'||outfit.pattern==='chevron'){ctx.beginPath();ctx.moveTo(px-3,py+2);ctx.lineTo(px+2,py+(outfit.pattern==='waves'?-1:5));ctx.lineTo(px+7,py+2);ctx.stroke()}
  else if(outfit.pattern==='leaves'){ctx.beginPath();ctx.ellipse(px,py,3.1,1.7,-.5,0,Math.PI*2);ctx.fill()}
  else if(outfit.pattern==='flowers'){for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(px+Math.cos(i*Math.PI/2)*2,py+Math.sin(i*Math.PI/2)*2,1.5,0,Math.PI*2);ctx.fill()}}
  else if(outfit.pattern==='stars'||outfit.pattern==='sparkles'){ctx.beginPath();ctx.moveTo(px,py-3);ctx.lineTo(px+1,py-1);ctx.lineTo(px+3,py);ctx.lineTo(px+1,py+1);ctx.lineTo(px,py+3);ctx.lineTo(px-1,py+1);ctx.lineTo(px-3,py);ctx.lineTo(px-1,py-1);ctx.fill()}
  else{ctx.beginPath();ctx.arc(px,py,1.6,0,Math.PI*2);ctx.fill()}
 }
 ctx.restore();
}
'''
replace('function updateGrandmaOutfitPreview(){',helper+'function updateGrandmaOutfitPreview(){')
# Large preview pattern rendered above flat coat, with a separate coordinate system.
coat='M28 61 Q55 47 82 61 L86 96 Q54 115 24 96Z'
replace('<path d="'+coat+'" data-preview-coat="true" fill="#9b6bb0" stroke="#392d44" stroke-width="4"/>','<path d="'+coat+'" data-preview-coat="true" fill="#9b6bb0" stroke="#392d44" stroke-width="4"/><g data-preview-pattern="true"></g>')
replace("hero.querySelector('[data-preview-coat]')?.setAttribute('fill',outfit.color);","hero.querySelector('[data-preview-coat]')?.setAttribute('fill',outfit.color);\n const patternTarget=hero.querySelector('[data-preview-pattern]');\n if(patternTarget)patternTarget.innerHTML=outfitPatternSvg(outfit,'hero-outfit-pattern','"+coat+"');")
# Outline should stay visible after pattern overlay; inner draw constrained by matching path.
preview='M15 33 Q32 24 49 33 L53 58 L11 58Z'
needle='<path d="'+preview+'" fill="${item.color}" stroke="#392d44" stroke-width="3"/><path d="M19 15'
replace(needle,'<path d="'+preview+'" fill="${item.color}" stroke="#392d44" stroke-width="3"/>${outfitPatternSvg(item,\'shop-pattern-\'+item.id,\''+preview+'\')}<path d="M19 15')
replace("rounded(x+7,y+27+bob,32,25,10,outfit.color);line(x+8", "rounded(x+7,y+27+bob,32,25,10,outfit.color);drawOutfitPattern(outfit,x,y,bob);line(x+8")
p.write_text(s)
print('Boutique layout, prices, consistent SVG/canvas patterns updated')
