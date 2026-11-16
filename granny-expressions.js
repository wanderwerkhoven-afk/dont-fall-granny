/* Expressive Granny — priority-based visual reactions, no gameplay side effects.
 * Existing outfit, collision box and vehicle physics are unchanged.
 */
(()=>{'use strict';
const Expression=Object.freeze({
 RUN:'run',JUMP:'jump',DANGER:'danger',NEAR_MISS:'near_miss',
 RECOVERY:'recovery',SAFE:'safe',PERFECT:'perfect',
 FALL:'fall',PLANE:'plane',SCOOTER:'scooter'
});
const duration={near_miss:.95,safe:1.0,perfect:1.4,fall:1.0,danger:.38};
const precedence={fall:100,recovery:90,perfect:80,safe:75,near_miss:70,danger:60,plane:45,scooter:45,jump:30,run:0};
class GrannyExpressionController{
 constructor(){this.reset();}
 reset(){this.event=null;this.remaining=0;this.elapsed=0;this.current=Expression.RUN;}
 react(event){
  if(!(event in precedence))return false;
  const next=duration[event]||.5;
  if(this.remaining>0&&precedence[event]<precedence[this.event])return false;
  this.event=event;this.remaining=next;return true;
 }
 update(dt){
  const step=Math.max(0,Math.min(.1,Number(dt)||0));
  this.elapsed+=step;
  this.remaining=Math.max(0,this.remaining-step);
  if(!this.remaining)this.event=null;
 }
 resolve({state='playing',vehicle=null,airborne=false,danger=false}={}){
  let mood=Expression.RUN;
  if(state==='over'||state==='falling'||state==='game_over')mood=Expression.FALL;
  else if(state==='recovery')mood=Expression.RECOVERY;
  else if(vehicle==='plane')mood=Expression.PLANE;
  else if(vehicle==='booster')mood=Expression.SCOOTER;
  else if(airborne)mood=Expression.JUMP;
  else if(danger)mood=Expression.DANGER;
  if(this.event&&precedence[this.event]>precedence[mood])mood=this.event;
  this.current=mood;return mood;
 }
 pose(mood=this.current,reducedMotion=false){
  if(reducedMotion)return {tilt:0,armSwing:0};
  const sway=Math.sin(this.elapsed*9);
  return {
   tilt:mood==='recovery'?.14+sway*.08:mood==='fall'?.38:mood==='danger'?.09:mood==='near_miss'?-.09:mood==='perfect'?-.11:0,
   armSwing:mood==='perfect'?.7:mood==='recovery'?.65:mood==='danger'?.55:0
  };
 }
 // Pixel-aligned facial details; base art and every purchased outfit preserved.
 drawFace(ctx,x,y,bob,mood=this.current,reducedMotion=false){
  const ink='#493e49',skin='#a86f77',phase=this.elapsed;
  const circle=(cx,cy,r,c)=>{ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();};
  const curve=(x1,y1,cx,cy,x2,y2,width=2.1)=>{
   ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cx,cy,x2,y2);
   ctx.strokeStyle=ink;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();
  };
  // Glasses remain part of Granny's original hand-drawn look.
  const yy=y+bob;
  if(mood==='danger'||mood==='recovery'||mood==='fall'){
   curve(x+13,yy+12,x+17,yy+8,x+20,yy+12,2);
   curve(x+27,yy+12,x+31,yy+8,x+34,yy+12,2);
  }else if(mood==='perfect'||mood==='safe'||mood==='near_miss'){
   curve(x+13,yy+12,x+17,yy+9,x+20,yy+11,1.7);
   curve(x+27,yy+11,x+31,yy+9,x+34,yy+12,1.7);
  }
  if(mood==='danger'||mood==='recovery'||mood==='fall'){
   circle(x+17,yy+19,2.1,ink);circle(x+30,yy+19,2.1,ink);
  }else if(mood==='perfect'){
   curve(x+14,yy+19,x+17,yy+16,x+20,yy+19,1.7);
   curve(x+27,yy+19,x+30,yy+16,x+33,yy+19,1.7);
  }else{
   circle(x+17,yy+19,1.25,ink);circle(x+30,yy+19,1.25,ink);
  }
  if(mood==='danger'||mood==='recovery'||mood==='fall'){
   circle(x+24,yy+28,3.2,skin);
   circle(x+24,yy+27,1.35,'#fff0df');
  }else if(mood==='perfect'){
   curve(x+17,yy+25,x+24,yy+34,x+32,yy+25,2.7);
   circle(x+13,yy+25,2,'#e9a19d');circle(x+35,yy+25,2,'#e9a19d');
  }else if(mood==='safe'||mood==='near_miss'){
   curve(x+19,yy+26,x+24,yy+31,x+30,yy+26,2.5);
  }else if(mood==='jump'||mood==='plane'){
   curve(x+19,yy+27,x+24,yy+29,x+29,yy+27,1.7);
  }else if(mood==='scooter'){
   curve(x+19,yy+27,x+24,yy+24,x+30,yy+27,2.3);
  }else{
   ctx.beginPath();ctx.ellipse(x+24,yy+27,4.5,1.8,0,0,Math.PI*2);ctx.fillStyle=skin;ctx.fill();
  }
  if(!reducedMotion&&mood==='perfect'){
   const glint=.65+.2*Math.sin(phase*11);
   ctx.save();ctx.globalAlpha=glint;circle(x+39,yy-3,2.3,'#ffe4a3');ctx.restore();
  }
 }
}
window.GrannyExpressions={Expression,GrannyExpressionController};
})();