(()=>{
'use strict';
function dayKey(){return new Date().toISOString().slice(0,10)}
function weekKey(){
 const d=new Date(),start=new Date(Date.UTC(d.getUTCFullYear(),0,1)),day=Math.floor((d-start)/86400000);
 return d.getUTCFullYear()+'-W'+String(Math.ceil((day+start.getUTCDay()+1)/7)).padStart(2,'0')
}
function seedValue(key){return [...key].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7)}
function activeMissions(pool,count,key){
 if(!pool.length)return[];
 const seed=seedValue(key);
 return Array.from({length:Math.min(count,pool.length)},(_,i)=>pool[(seed+i*2)%pool.length])
}
function achievementTier(value,thresholds=[]){
 let tier=0;
 for(let i=0;i<thresholds.length;i++)if(value>=thresholds[i])tier=i+1;
 return tier
}
function tierLabel(tier){return ['—','Brons','Zilver','Goud','Holo'][tier]||'Holo'}
function rankForXp(xp,levels=[]){
 let rank=levels[0]||{level:1,name:'Buurtwandelaar',xp:0};
 for(const level of levels)if(xp>=level.xp)rank=level;
 return rank
}
function nextRank(xp,levels=[]){return levels.find(level=>level.xp>xp)||null}
function collectionStatus(set,owned=[]){return set.requires.every(id=>owned.includes(id))}
window.GrannyProgression={dayKey,weekKey,seedValue,activeMissions,achievementTier,tierLabel,rankForXp,nextRank,collectionStatus};
})();