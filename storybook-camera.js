/* Storybook Camera — visual-only, fixed-timestep-friendly framing.
 * Never moves physics entities, obstacle coordinates, collision boxes, or RNG.
 * All offsets are clamped for mobile and disabled by Reduced Motion.
 */
(()=>{'use strict';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
class StorybookCamera{
 constructor(){this.reset();}
 reset(){this.y=0;this.parallaxX=0;this.parallaxY=0;this.time=0;this.activeWorld=null;}
 step(dt,options={}){
  const reduced=!!options.reducedMotion;
  if(reduced){this.y=0;this.parallaxX=0;this.parallaxY=0;return this.frame();}
  const step=clamp(Number(dt)||0,0,1/15);
  if(!step)return this.frame();
  this.time+=step;
  const mobile=Number(options.width||900)<650;
  const maxY=mobile?3.5:5.5;
  const maxX=mobile?2.6:4.5;
  const running=options.state==='playing';
  const special=!!options.vehicle;
  const airborne=!!options.airborne&&!special;
  const jump=clamp(Number(options.jumpHeight)||0,0,115);
  const threat=Number(options.threatDistance);
  // Subtle framing lift is reduced whenever a hazard enters Granny's approach.
  const dangerAhead=Number.isFinite(threat)&&threat>=0&&threat<190;
  const jumpLift=airborne?(dangerAhead?1:1.5+4.5*jump/115):0;
  const breathing=running&&!dangerAhead&&!special?Math.sin(this.time*.88)*.55:0;
  const transition=clamp(Number(options.transition)||0,0,2.8);
  const crossing=transition>0?Math.sin((1-transition/2.8)*Math.PI):0;
  const targetY=running&&!special?clamp(-jumpLift+breathing+crossing*1.5,-maxY,maxY):0;
  const targetX=running&&!special?clamp(Math.sin(this.time*.42)*maxX*.65+crossing*maxX*.28,-maxX,maxX):0;
  const smoothing=1-Math.exp(-step*(mobile?4.8:4.1));
  this.y=clamp(this.y+(targetY-this.y)*smoothing,-maxY,maxY);
  this.parallaxX=clamp(this.parallaxX+(targetX-this.parallaxX)*smoothing,-maxX,maxX);
  this.parallaxY=clamp(this.y*.55,-3,3);
  return this.frame();
 }
 frame(){return {y:this.y,parallaxX:this.parallaxX,parallaxY:this.parallaxY};}
}
window.GrannyStorybookCamera={StorybookCamera};
})();
