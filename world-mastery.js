/* Improvement 13 — World Mastery: 21 permanent stars and cosmetic stickers.
 * Pure helpers; never changes XP, coin wallet, missions or achievements.
 */
(()=>{
'use strict';
const WORLD_MASTERY=Object.freeze([
 {id:'neighborhood',name:'De rustige buurt',icon:'🏡',color:'#b5dfcd',goals:[{key:'distance',target:600,label:'Wandel 600 meter',sticker:'Buurtbloem',symbol:'🌼'},{key:'perfects',target:2,label:'Maak 2 Perfect Saves',sticker:'Gouden Wandelstok',symbol:'🦯'},{key:'nearMisses',target:4,label:'Maak 4 Near Misses',sticker:'Stoepster',symbol:'⭐'}]},
 {id:'park',name:'Het stadspark',icon:'🌳',color:'#b7dcb8',goals:[{key:'distance',target:750,label:'Wandel 750 meter',sticker:'Parkboeket',symbol:'💐'},{key:'perfects',target:3,label:'Maak 3 Perfect Saves',sticker:'Dansende Eend',symbol:'🦆'},{key:'nearMisses',target:5,label:'Maak 5 Near Misses',sticker:'Picknickheld',symbol:'🧺'}]},
 {id:'city',name:'De grote stad',icon:'🏙️',color:'#c6c9e4',goals:[{key:'distance',target:900,label:'Wandel 900 meter',sticker:'City Lights',symbol:'🌆'},{key:'perfects',target:3,label:'Maak 3 Perfect Saves',sticker:'Metrostapper',symbol:'🚇'},{key:'nearMisses',target:6,label:'Maak 6 Near Misses',sticker:'Verkeerskoningin',symbol:'🚦'}]},
 {id:'desert',name:'De woestijn',icon:'🌵',color:'#ebc78e',goals:[{key:'distance',target:900,label:'Wandel 900 meter',sticker:'Zandduin',symbol:'🏜️'},{key:'perfects',target:4,label:'Maak 4 Perfect Saves',sticker:'Zonnekoningin',symbol:'☀️'},{key:'nearMisses',target:6,label:'Maak 6 Near Misses',sticker:'Cactusvriend',symbol:'🌵'}]},
 {id:'night',name:'De nacht',icon:'🌙',color:'#a5a0cc',goals:[{key:'distance',target:1000,label:'Wandel 1.000 meter',sticker:'Maanwandeling',symbol:'🌙'},{key:'perfects',target:4,label:'Maak 4 Perfect Saves',sticker:'Nachtster',symbol:'✨'},{key:'nearMisses',target:7,label:'Maak 7 Near Misses',sticker:'Vuurvliegje',symbol:'💫'}]},
 {id:'candy',name:'De snoepwereld',icon:'🍬',color:'#ebbedb',goals:[{key:'distance',target:1100,label:'Wandel 1.100 meter',sticker:'Suikerspin',symbol:'🍭'},{key:'perfects',target:5,label:'Maak 5 Perfect Saves',sticker:'Candy Queen',symbol:'🍬'},{key:'nearMisses',target:8,label:'Maak 8 Near Misses',sticker:'Snoepster',symbol:'🍡'}]},
 {id:'space',name:'De ruimte',icon:'🚀',color:'#b6b1df',goals:[{key:'distance',target:1200,label:'Wandel 1.200 meter',sticker:'Sterrenreis',symbol:'🪐'},{key:'perfects',target:5,label:'Maak 5 Perfect Saves',sticker:'Kosmische Oma',symbol:'👩‍🚀'},{key:'nearMisses',target:8,label:'Maak 8 Near Misses',sticker:'Supernova',symbol:'🌟'}]}
]);
function normalizeStars(entry={}){
 const raw=entry&&typeof entry.stars==='object'?entry.stars:{};
 return [0,1,2].map(index=>raw[index]===true||raw[String(index)]===true);
}
function evaluate(worldIndex,stats={}){
 const world=WORLD_MASTERY[worldIndex];
 if(!world)return [];
 const previous=normalizeStars(stats);
 const earned=[];
 for(let i=0;i<3;i++){
  const goal=world.goals[i];
  const amount=Math.max(0,Number(stats[goal.key])||0);
  if(previous[i]||amount>=goal.target){
   if(!previous[i])earned.push({worldIndex,index:i,id:world.id+'-'+i,sticker:goal.sticker,symbol:goal.symbol});
   previous[i]=true;
  }
 }
 if(!stats.stars||typeof stats.stars!=='object')stats.stars={};
 previous.forEach((earned,index)=>{if(earned)stats.stars[index]=true});
 return earned;
}
function progress(worldIndex,stats={}){
 const world=WORLD_MASTERY[worldIndex];if(!world)return null;
 const stars=normalizeStars(stats);
 return {
  world,stars,earned:stars.filter(Boolean).length,
  goals:world.goals.map((goal,index)=>({
   ...goal,index,earned:stars[index],
   value:Math.max(0,Number(stats[goal.key])||0),
   fraction:Math.max(0,Math.min(1,(Number(stats[goal.key])||0)/goal.target))
  }))
 };
}
function totalStars(mastery={}){
 return WORLD_MASTERY.reduce((sum,_,index)=>sum+normalizeStars(mastery[index]).filter(Boolean).length,0);
}
window.GrannyWorldMastery={WORLD_MASTERY,evaluate,progress,totalStars,normalizeStars};
})();
