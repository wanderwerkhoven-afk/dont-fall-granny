/* Storybook level campaign — persistent, sequential unlocks. */
(()=>{'use strict';
const KEY='granny-levels-v1';
const LEVELS=[
 {id:'neighborhood',name:'De rustige buurt',goal:400},
 {id:'park',name:'Het stadspark',goal:500},
 {id:'city',name:'De grote stad',goal:650},
 {id:'desert',name:'De woestijn',goal:750},
 {id:'night',name:'De nacht',goal:900},
 {id:'candy',name:'De snoepwereld',goal:1050},
 {id:'space',name:'De ruimte',goal:1200}
];
let completed=[],selected=0,bests={};
try{
 const data=JSON.parse(localStorage.getItem(KEY)||'null');
 if(data){
  completed=Array.isArray(data.completed)?data.completed.filter(x=>Number.isInteger(x)&&x>=0&&x<LEVELS.length):[];
  bests=data.bests&&typeof data.bests==='object'?data.bests:{};
  selected=Number.isInteger(data.selected)?data.selected:0;
 }
}catch(_){}
function unlocked(index){return index===0||completed.includes(index-1);}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({completed,selected,bests}));}catch(_){}}
function select(index){if(!Number.isInteger(index)||index<0||index>=LEVELS.length||!unlocked(index))return false;selected=index;persist();return true;}
function complete(index,meters){
 if(index<0||index>=LEVELS.length)return false;
 const first=!completed.includes(index);
 if(first)completed.push(index);
 bests[index]=Math.max(Number(bests[index]||0),meters);
 completed.sort((a,b)=>a-b);
 if(index+1<LEVELS.length&&unlocked(index+1))selected=index+1;
 persist();return first;
}
function record(index,meters){bests[index]=Math.max(Number(bests[index]||0),meters);persist();}
function getSelected(){return selected;}
function getLevels(){return LEVELS.map((l,i)=>({...l,index:i,unlocked:unlocked(i),completed:completed.includes(i),best:Number(bests[i]||0)}));}
window.GrannyLevels={LEVELS,getLevels,select,complete,record,getSelected,unlocked};
})();