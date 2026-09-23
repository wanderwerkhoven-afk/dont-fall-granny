from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='/* Desktop home compatibility: keep the complete hub inside the game frame. */'
assert marker not in s
anchor='/* In-world recovery: the balance arc replaces the ordinary score HUD, never a popup. */'
assert s.count(anchor)==1
css=r'''
/* Desktop home compatibility: keep the complete hub inside the game frame. */
@media(min-width:651px){
 #overlay:not(.storepage):not(.gameover) .panel{
   height:100%;
   max-height:100%;
   display:flex;
   flex-direction:column;
   overflow:hidden;
   padding:8px 18px 10px;
 }
 #overlay:not(.storepage):not(.gameover) .menu-hero{
   width:min(100%,620px);
   height:clamp(88px,14dvh,112px);
   min-height:88px;
   flex:0 0 clamp(88px,14dvh,112px);
   margin:0 auto 3px;
 }
 #overlay:not(.storepage):not(.gameover) .menu-grandma{
   height:100%;
 }
 #overlay:not(.storepage):not(.gameover) .menu-grandma svg{
   height:min(96%,104px);
 }
 #overlay:not(.storepage):not(.gameover) .menu-kicker{
   margin:3px 0 2px;
   line-height:1.1;
 }
 #overlay:not(.storepage):not(.gameover) .menu-meta{
   margin:2px 0 4px;
   flex:0 0 auto;
 }
 #overlay:not(.storepage):not(.gameover) #menuContent{
   margin:3px 0 5px;
   flex:0 0 auto;
 }
 #overlay:not(.storepage):not(.gameover) .home-hub{
   width:auto;
   max-width:none;
   grid-template-columns:repeat(2,clamp(108px,14dvh,150px));
   justify-content:center;
   gap:8px 10px;
   margin:0 auto;
 }
 #overlay:not(.storepage):not(.gameover) .home-hub-tile{
   width:100%;
   aspect-ratio:1 / 1;
   max-height:none;
   border-radius:16px;
   gap:5px;
   padding:8px;
 }
 #overlay:not(.storepage):not(.gameover) .home-hub-tile .tile-icon{
   font-size:clamp(30px,5dvh,44px);
 }
 #overlay:not(.storepage):not(.gameover) .home-hub-tile b{
   font-size:15px;
 }
 #overlay:not(.storepage):not(.gameover) .home-achievement{
   padding:7px 11px;
   min-height:38px;
 }
 #overlay:not(.storepage):not(.gameover) .home-achievement small{
   font-size:9px;
 }
 #overlay:not(.storepage):not(.gameover) .home-achievement strong{
   font-size:16px;
 }
 #overlay:not(.storepage):not(.gameover) #startBtn{
   margin-top:auto;
   margin-bottom:0;
   min-height:44px;
   flex:0 0 44px;
 }
}
@media(min-width:651px) and (max-height:650px){
 #overlay:not(.storepage):not(.gameover) .menu-hero{
   height:82px;
   min-height:82px;
   flex-basis:82px;
 }
 #overlay:not(.storepage):not(.gameover) .home-hub{
   grid-template-columns:repeat(2,104px);
   gap:6px 9px;
 }
 #overlay:not(.storepage):not(.gameover) .home-achievement{
   min-height:34px;
   padding:5px 10px;
 }
}
'''
s=s.replace(anchor,css+'\n'+anchor)
p.write_text(s,encoding='utf-8')
print('PASS desktop home compatibility patch applied')
