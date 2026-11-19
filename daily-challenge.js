/* Daily Granny Challenge: universal UTC date, versioned deterministic course.
 * All obstacle schedules are derived from seed and absolute travel distance,
 * not frame rate, prior local play, user upgrades or random game state.
 */
(()=>{'use strict';
const DURATION=75,VERSION=1,PREFIX='granny-daily-v1-';
function utcDate(date=new Date()){return new Date(date).toISOString().slice(0,10)}
function hash(str){let h=2166136261>>>0;for(const ch of str){h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0}return h>>>0}
function random(seed,index,salt=0){
 let x=(seed+Math.imul(index+1,0x9e3779b9)+Math.imul(salt+1,0x85ebca6b))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
}
const WORLD_TYPES=[
 ['cat','dog','plant','sock','slipper','basket'],
 ['dog','plant','basket','cat','log','mushroom'],
 ['car','cone','bike','pigeon','cat','dog','bin'],
 ['cactus','scorpion','rock','tumble'],
 ['bat','ghost','pumpkin','cat'],
 ['candybox','lollipop','donut','gum'],
 ['asteroid','alien','satellite','moonrock']
];
function course(date=utcDate()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Expected UTC YYYY-MM-DD date');
 const seed=hash('granny-daily-v'+VERSION+'|'+date),world=seed%7;
 return Object.freeze({date,seed,world,duration:DURATION,speed:285,version:VERSION,id:'D-'+date.replaceAll('-','')});
}
function obstacleAt(cfg,index){
 const pool=WORLD_TYPES[cfg.world],id=pool[Math.floor(random(cfg.seed,index,2)*pool.length)];
 let at=440;
 for(let k=0;k<index;k++)at+=620+Math.floor(random(cfg.seed,k,3)*240);
 return Object.freeze({index,id,at,attacking:false,multiplier:1});
}
class DailyChallenge{
 constructor(){this.active=false;this.finished=false;this.index=0;this.elapsed=0;this.config=null;this.reason='';}
 start(date=utcDate()){this.config=course(date);this.index=0;this.elapsed=0;this.finished=false;this.active=true;this.reason='';return this.config;}
 advance(dt){if(!this.active)return false;this.elapsed=Math.min(this.config.duration,this.elapsed+Math.max(0,dt));return this.elapsed>=this.config.duration;}
 due(travel){
  if(!this.active)return [];
  const rows=[];
  while(this.index<150){
   const next=obstacleAt(this.config,this.index);
   if(next.at>travel)break;
   rows.push(next);this.index++;
  }
  return rows;
 }
 finish(reason='completed'){if(!this.active)return false;this.reason=reason;this.active=false;this.finished=true;return true;}
 get remaining(){return this.active?Math.max(0,this.config.duration-this.elapsed):0;}
}
function record(storage,config,result){
 const key=PREFIX+config.date;
 let previous={attempts:0,bestScore:0,bestDistance:0};
 try{previous={...previous,...JSON.parse(storage.getItem(key)||'{}')}}catch(e){}
 const best=Number(result.points)>Number(previous.bestScore);
 const data={date:config.date,seed:config.seed,world:config.world,
  attempts:previous.attempts+1,bestScore:Math.max(previous.bestScore,result.points),
  bestDistance:Math.max(previous.bestDistance,result.distance),
  lastScore:result.points,lastDistance:result.distance,completed:!!(previous.completed||result.completed)};
 try{storage.setItem(key,JSON.stringify(data))}catch(e){}
 return {...data,newRecord:best};
}
function read(storage,date=utcDate()){
 try{return JSON.parse(storage.getItem(PREFIX+date)||'null')}catch(e){return null}
}
function points({distance=0,nearMisses=0,perfectSaves=0}={}){
 return Math.floor(distance)+Math.floor(nearMisses)*25+Math.floor(perfectSaves)*50;
}
function resultText(config,result){
 return 'DAILY GRANNY CHALLENGE · '+config.date+'\n'+
 'Score: '+result.points+' punten · '+result.distance+' m\n'+
 'Near Misses: '+result.nearMisses+' · Perfect Saves: '+result.perfectSaves+'\n'+
 (result.completed?'75/75 seconden voltooid!':'Oma struikelde na '+Math.floor(result.seconds)+' sec.')+
 '\nZelfde parcours voor iedereen · '+config.id+'\nhttps://wanderwerkhoven-afk.github.io/dont-fall-granny/';
}
function cardCanvas(config,result){
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=630;const g=canvas.getContext('2d');
 g.fillStyle='#cce7d9';g.fillRect(0,0,1200,630);
 g.fillStyle='#fff5df';g.beginPath();g.roundRect(44,44,1112,542,40);g.fill();
 g.strokeStyle='#392d44';g.lineWidth=10;g.stroke();
 g.fillStyle='#392d44';g.textAlign='left';
 g.font='900 28px system-ui';g.fillText('DON’T TRIP GRANDMA!',94,118);
 g.fillStyle='#825e80';g.font='800 24px system-ui';g.fillText('DAILY GRANNY CHALLENGE · '+config.date,94,166);
 g.fillStyle='#392d44';g.font='1000 104px system-ui';g.fillText(result.points+' PT',86,320);
 g.font='900 34px system-ui';g.fillText(result.distance+' meter',94,389);
 g.font='700 24px system-ui';g.fillText(result.nearMisses+' Near Misses   ·   '+result.perfectSaves+' Perfect Saves',94,442);
 g.fillStyle='#ffcf70';g.beginPath();g.roundRect(88,478,1020,69,20);g.fill();
 g.strokeStyle='#392d44';g.lineWidth=3;g.stroke();
 g.fillStyle='#392d44';g.font='800 24px system-ui';g.fillText(result.completed?'UITGESPEELD · 75 SECONDEN':'RUN VOLTOOID · '+Math.floor(result.seconds)+' SEC',113,522);
 g.textAlign='right';g.font='900 22px system-ui';g.fillText(config.id,1084,522);
 return canvas;
}
window.GrannyDaily={DURATION,VERSION,utcDate,hash,random,course,obstacleAt,DailyChallenge,record,read,points,resultText,cardCanvas};
})();