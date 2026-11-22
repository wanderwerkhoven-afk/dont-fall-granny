/* Thirteen worlds, seven progressively longer levels per world. */
(()=>{'use strict';
const KEY='granny-levels-v2';
const OLD_KEY='granny-levels-v1';
const GOALS=[600,900,1200,1500,1800,2100,2400];
const WORLDS=[
 ['neighborhood','De rustige buurt'],['park','Het stadspark'],
 ['city','De grote stad'],['desert','De woestijn'],['night','De nacht'],
 ['candy','De snoepwereld'],['space','De ruimte'],
 ['winter','Winterwonderland'],['neon','Neon 80’s'],['pirate','Piratenbaai'],
 ['halloween','Halloweenland'],['jungle','De jungle'],['carnival','Het carnaval']
];
const LEVELS=WORLDS.flatMap(([id,name],worldIndex)=>GOALS.map((goal,levelIndex)=>({
 id:id+'-'+(levelIndex+1),name,worldIndex,levelIndex,
 number:levelIndex+1,goal
})));
let completed=[],selected=0,bests={};
try{
 const data=JSON.parse(localStorage.getItem(KEY)||'null');
 if(data){
  completed=Array.isArray(data.completed)?data.completed.filter(i=>Number.isInteger(i)&&i>=0&&i<LEVELS.length):[];
  bests=data.bests&&typeof data.bests==='object'?data.bests:{};
  selected=Number.isInteger(data.selected)?data.selected:0;
 }else{
  // Preserve earned world progress from the seven-world prototype: a previously
  // completed world counts as that world's seven level milestones.
  const old=JSON.parse(localStorage.getItem(OLD_KEY)||'null');
  if(old&&Array.isArray(old.completed)){
   const highest=old.completed.filter(i=>Number.isInteger(i)&&i>=0&&i<7).reduce((a,b)=>Math.max(a,b),-1);
   for(let i=0;i<(highest+1)*7;i++)completed.push(i);
   selected=Math.min(LEVELS.length-1,Math.max(0,completed.length));
  }
 }
}catch(_){}
function unlocked(index){return Number.isInteger(index)&&index>=0&&index<LEVELS.length&&(index===0||completed.includes(index-1));}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({completed,selected,bests}));}catch(_){}}
function select(index){if(!unlocked(index))return false;selected=index;persist();return true;}
function complete(index,meters){
 if(!unlocked(index))return false;
 const first=!completed.includes(index);
 if(first)completed.push(index);
 bests[index]=Math.max(Number(bests[index]||0),meters);
 completed.sort((a,b)=>a-b);
 if(first&&index+1<LEVELS.length&&unlocked(index+1))selected=index+1;
 persist();return first;
}
function record(index,meters){if(!LEVELS[index])return;bests[index]=Math.max(Number(bests[index]||0),meters);persist();}
function getSelected(){return selected;}
function getLevels(){return LEVELS.map((l,i)=>({...l,index:i,unlocked:unlocked(i),completed:completed.includes(i),best:Number(bests[i]||0)}));}
function getWorlds(){
 const levels=getLevels();
 return WORLDS.map(([id,name],index)=>{
  const group=levels.slice(index*7,index*7+7);
  return {id,name,index,levels:group,completed:group.every(l=>l.completed),unlocked:group.some(l=>l.unlocked),
   completedCount:group.filter(l=>l.completed).length};
 });
}
window.GrannyLevels={LEVELS,GOALS,getLevels,getWorlds,select,complete,record,getSelected,unlocked};
})();