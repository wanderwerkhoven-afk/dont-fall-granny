/* Improvement 14 — Danger Soundscape.
 * Prediction operates on the same obstacle x, charge point, multiplier and
 * instantaneous scroll speed as the collision loop; no speculative timers.
 */
(()=>{'use strict';
const MIN_LEAD=.4,MAX_LEAD=.9;
function timeToContact(obstacle,granny,speed){
 if(!obstacle||!granny||!Number.isFinite(speed)||speed<=0||obstacle.hit)return Infinity;
 const contact=granny.x+7+Math.max(0,granny.w-13)-7;
 const leading=obstacle.x+3; // identical obstacle body start used by collision check
 const distance=leading-contact;
 if(distance<=0)return Infinity;
 const factor=Math.max(1,Number(obstacle.multiplier)||1);
 if(!obstacle.attacking||obstacle.charging||factor===1)return distance/(speed*(obstacle.charging?factor:1));
 const chargeX=Number(obstacle.chargeX);
 if(!Number.isFinite(chargeX))return distance/speed;
 const before=Math.max(0,obstacle.x-chargeX);
 return Math.min(distance,before)/speed+Math.max(0,distance-before)/(speed*factor);
}
function classify(obstacle){
 const id=obstacle?.type?.id||obstacle?.kind||'obstacle';
 if(id==='car')return {id:'vehicle',label:'Verkeer',frequency:210,pan:.72};
 if(id==='cat'||id==='dog')return {id:'animal',label:'Dier',frequency:650,pan:.6};
 if(id==='walker')return {id:'pedestrian',label:'Wandelaar',frequency:480,pan:.6};
 return {id:'obstacle',label:'Obstakel',frequency:360,pan:.62};
}
class DangerSoundscape{
 constructor(){this.reset();}
 reset(){this.warned=new WeakSet();this.visible=null;this.count=0;}
 update({obstacles=[],granny,speed,state,controllerState,vehicle=false,recovery=false,paused=false}={}){
  if(state!=='playing'||controllerState!=='running'||vehicle||recovery||paused){
   this.visible=null;return null;
  }
  let closest=null;
  for(const obstacle of obstacles){
   const eta=timeToContact(obstacle,granny,speed);
   if(eta>MAX_LEAD||eta<0||!Number.isFinite(eta))continue;
   if(!closest||eta<closest.eta)closest={obstacle,eta,kind:classify(obstacle)};
  }
  this.visible=closest;
  if(closest&&!this.warned.has(closest.obstacle)){
   this.warned.add(closest.obstacle);this.count++;
   return {...closest,first:true};
  }
  return closest?{...closest,first:false}:null;
 }
}
window.GrannyDangerSoundscape={MIN_LEAD,MAX_LEAD,timeToContact,classify,DangerSoundscape};
})();