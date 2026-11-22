/* Calm Storybook Worlds — one deterministic scene renderer, 2026.
 * One world coordinate per prop: no per-sprite modulo wrap or live randomness.
 * Decorative props are behind Granny and are never collision objects.
 */
(()=>{'use strict';
const INK='#392d44', IVORY='#fff5db', TAU=Math.PI*2;
const NAMES=['De rustige buurt','Het stadspark','De grote stad','De woestijn','De nacht','De snoepwereld','De ruimte','Winterwonderland','Neon 80’s','Piratenbaai','Halloweenland','De jungle','Het carnaval'];
const SIGNATURE=['Wandelaars achter de hekjes','Eenden op de vijver','Zacht oplichtende winkels','Langzame stofwolkjes','Warme ramen en vuurvliegjes','Zacht zwevende snoepjes','Een grote planeet','Sneeuw en ijskristallen','Arcade en neonlichten','Piratenboten en palmbomen','Spookhuizen en pompoenen','Tropische bladeren en tempels','Reuzenrad en kleurige tenten'];
const COLORS=['#badfd5','#b8d9ad','#a9b9d3','#f1c58e','#48486c','#f2c7df','#383456','#cae9f5','#5f2b89','#f2cc8e','#715178','#80b18b','#f1abc7'];
const THEMES=[
 {far:'#c7d9d2',mid:'#f3d4bf',near:'#7da78e',accent:'#f0ba85'},
 {far:'#b1d4b4',mid:'#82b6a1',near:'#528d72',accent:'#f1cc88'},
 {far:'#8696b2',mid:'#e6b6b6',near:'#796989',accent:'#ffd58b'},
 {far:'#eac39b',mid:'#d9a576',near:'#789675',accent:'#f8e2af'},
 {far:'#5c5b81',mid:'#6a607d',near:'#454762',accent:'#ffe2a3'},
 {far:'#f2d8e7',mid:'#e8b5d5',near:'#95c6b5',accent:'#ffe2a8'},
 {far:'#565576',mid:'#aaa0c9',near:'#7b83a6',accent:'#f4dea7'},
 {far:'#cee8f5',mid:'#b1d5e7',near:'#ecf9fe',accent:'#baf3ff'},
 {far:'#3f2a67',mid:'#713f8f',near:'#ae489d',accent:'#ff83ce'},
 {far:'#82d1d4',mid:'#e2c78b',near:'#65b2a1',accent:'#ffdf9b'},
 {far:'#504163',mid:'#745573',near:'#7d5a78',accent:'#f5ad77'},
 {far:'#9bcfa1',mid:'#70b58b',near:'#4e956c',accent:'#f7d98e'},
 {far:'#b6cce2',mid:'#e8a7c8',near:'#a990ce',accent:'#ffdf88'}
];
function draw(ctx,{tier,travel,W,ground,elapsed,reducedMotion,camera=null}){
 const zone=((tier%THEMES.length)+THEMES.length)%THEMES.length,p=THEMES[zone],t=reducedMotion?0:elapsed;
 const cameraX=!reducedMotion&&camera?Math.max(-5,Math.min(5,camera.parallaxX||0)):0;
 const cameraY=!reducedMotion&&camera?Math.max(-3,Math.min(3,camera.parallaxY||0)):0;
 const y=ground+cameraY,parallax=[.045,.12,.24,.35];
 const path=(points,color,weight=3)=>{
  ctx.beginPath();points.forEach(([x,y],j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=weight;ctx.lineJoin='round';ctx.stroke();
 };
 const round=(x,y,w,h,r,color,weight=3)=>{
  ctx.fillStyle=color;ctx.strokeStyle=INK;ctx.lineWidth=weight;
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();if(weight)ctx.stroke();
 };
 const circle=(x,y,r,color,weight=3)=>{
  ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=color;ctx.fill();
  if(weight){ctx.strokeStyle=INK;ctx.lineWidth=weight;ctx.stroke();}
 };
 const line=(x1,y1,x2,y2,color=INK,w=3)=>{
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.lineWidth=w;ctx.lineCap='round';ctx.strokeStyle=color;ctx.stroke();
 };
 const ellipse=(x,y,rx,ry,color)=>{
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=color;ctx.fill();
 };
 // Infinite strip derived from absolute coordinates. A repeated sprite keeps
 // its global index, size, baseline and animation phase as it crosses the screen.
 const strip=(spacing,factor,paint)=>{
  const displacement=travel*factor+cameraX*factor*2;
  const first=Math.floor(displacement/spacing)-2;
  const last=Math.ceil((displacement+W)/spacing)+2;
  for(let i=first;i<=last;i++)paint(i*spacing-displacement,i);
 };
 const hills=(factor,color,base,amplitude)=>{
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,y);
  for(let x=0;x<=W+12;x+=12)ctx.lineTo(x,y-base+Math.sin((x+travel*factor+cameraX*factor*2)/220)*amplitude);
  ctx.lineTo(W,y);ctx.closePath();ctx.fill();
 };
 const house=(x,base,body,lit=false)=>{
  round(x,base-127,146,128,13,body);
  path([[x-10,base-125],[x+73,base-174],[x+156,base-125]],zone===4?'#45405f':'#bc8e90');
  for(let k=0;k<2;k++){round(x+23+k*69,base-99,39,43,6,lit?IVORY:'#badbd7',2);
    line(x+42+k*69,base-98,x+42+k*69,base-58,'#776b7a',2);}
  round(x+64,base-57,30,58,7,zone===4?'#8f819b':'#c5a18c',2);
 };
 const tree=(x,base,shade)=>{
  round(x+47,base-68,13,70,6,'#937962',2);
  circle(x+53,base-105,48,shade);
  circle(x+24,base-88,24,shade,2);
  circle(x+80,base-86,26,shade,2);
  ellipse(x+39,base-116,16,6,'#ffffff50');
 };
 const walker=(x,base,i)=>{
  // Fixed lane and feet; only arms and legs swing gently over time.
  const step=reducedMotion?0:Math.sin(t*3.3+i*.8)*5;
  ellipse(x+26,base+3,26,5,'#332c4050');
  line(x+23,base-28,x+19-step,base,INK,5);
  line(x+28,base-28,x+34+step,base,INK,5);
  round(x+13,base-64,28,37,12,i%2?'#b98cb6':'#9bc4c6');
  circle(x+27,base-76,14,'#edb99d');
  circle(x+21,base-79,2,INK,0);circle(x+33,base-79,2,INK,0);
  line(x+14,base-48,x+7+step*.4,base-27,INK,4);
  line(x+43,base-48,x+49-step*.4,base-27,INK,4);
 };
 const duck=(x,base,i)=>{
  const bob=reducedMotion?0:Math.sin(t*1.2+i)*1.8;
  ellipse(x+35,base+1,45,6,'#ffffff50');
  ellipse(x+34,base-17+bob,31,16,IVORY);
  circle(x+53,base-35+bob,12,IVORY,2.5);
  path([[x+63,base-33+bob],[x+76,base-29+bob],[x+63,base-25+bob]],'#f4b966',2);
  circle(x+57,base-38+bob,2,INK,0);
  ctx.strokeStyle='#ffffffb8';ctx.lineWidth=1.5;ctx.beginPath();
  ctx.arc(x+34,base+1,50,Math.PI*.07,Math.PI*.92);ctx.stroke();
 };
 const car=(x,base,i)=>{
  round(x,base-46,126,41,15,i%2?'#edc081':'#a8cbcd');
  path([[x+24,base-46],[x+43,base-68],[x+91,base-68],[x+106,base-46]],i%2?'#edc081':'#a8cbcd');
  round(x+47,base-63,40,16,4,'#cee5e4',2);
  circle(x+25,base-4,11,INK,0);circle(x+100,base-4,11,INK,0);
  circle(x+25,base-4,5,'#faf1d8',0);circle(x+100,base-4,5,'#faf1d8',0);
 };
 ctx.save();ctx.beginPath();ctx.rect(0,0,W,ground);ctx.clip();
 // Far layer: broad unoutlined silhouettes create depth without noise.
 if(zone===6||zone===4){
  // Even tiny stars use world-indexed strips, never viewport modulo.
  strip(zone===6?180:215,.018,(x,i)=>{
   const yy=26+(((i%7)+7)%7)*Math.max(13,(y-165)/8);
   circle(x+38,yy,zone===6?1.8:1.5,IVORY,0);
  });
 }
 if(zone===0||zone===1||zone===3||zone===5||zone===7||zone===9)hills(parallax[0],p.far,90,13);
 else hills(parallax[0],p.far,72,8);
 // The signature focal element has a stable position with only gentle motion.
 if(zone===3)circle(W*.81,y*.24,41,'#fff0b2',0);
 if(zone===4)circle(W*.81,y*.19,34,'#ffe8c1',0);
 if(zone===5)circle(W*.79,y*.20,34,'#fff1d5',0);
 if(zone===6){
  circle(W*.76,y*.3,Math.min(78,y*.23),'#b5a7da');
  ctx.strokeStyle='#f5e0be';ctx.lineWidth=7;ctx.beginPath();
  ctx.ellipse(W*.76,y*.3,Math.min(99,y*.28),23,-.2,0,TAU);ctx.stroke();
  circle(W*.72,y*.27,11,'#e5d4f1',0);
 }
 // Middle layer: only one larger illustrated object every 330–400 world px.
 if(zone===0)strip(370,parallax[1],(x,i)=>house(x,y-18,i%2?'#efd5c7':'#f9e5c8'));
 if(zone===1)strip(365,parallax[1],(x,i)=>{tree(x,y-16,i%2?'#82b99a':'#a0c9a2');});
 if(zone===2)strip(335,parallax[1],(x,i)=>{
  round(x,y-218,164,218,12,i%2?'#8896b3':'#a4acc4');
  for(let j=0;j<2;j++)for(let k=0;k<3;k++)round(x+30+j*67,y-185+k*51,27,32,5,'#e3dfcf',1.5);
 });
 if(zone===3)hills(parallax[1],p.mid,53,22);
 if(zone===4)strip(390,parallax[1],(x,i)=>house(x,y-5,i%2?'#625a79':'#77708a',true));
 if(zone===5)strip(395,parallax[1],(x,i)=>{
  round(x+14,y-138,130,138,27,i%2?'#f1b6d0':'#e0c1e7');
  round(x+20,y-117,117,17,6,IVORY,0);
  round(x+20,y-66,117,13,6,IVORY,0);
 });
 if(zone===6)strip(430,parallax[1],(x,i)=>{if(i%2===0)circle(x+80,y-155,31,'#928ab8');});
 // Near layer: widely separated, consistent silhouettes behind the road.
 if(zone===0)strip(390,parallax[2],(x,i)=>tree(x,y+4,i%2?'#89b99b':'#9fc7a3'));
 if(zone===1){
  strip(480,parallax[2],(x,i)=>{ellipse(x+95,y-5,114,26,'#7ebeca');duck(x+31,y-11,i);});
 }
 if(zone===2)strip(490,parallax[2],(x,i)=>{
  round(x+18,y-115,156,112,12,i%2?'#eab5b5':'#c8b3cd');
  round(x+25,y-107,140,23,7,IVORY,1.5);
  round(x+64,y-98,61,11,4,'#ab83ab',0);
  round(x+38,y-65,34,44,7,'#bcd9d7',2);
  round(x+102,y-65,34,44,7,'#bcd9d7',2);
 });
 if(zone===3)strip(510,parallax[2],(x,i)=>{
  round(x+59,y-92,20,92,9,'#84a88b');
  round(x+38,y-70,21,15,7,'#84a88b');
  round(x+79,y-49,20,15,7,'#84a88b');
  ellipse(x+66,y-92,6,26,'#b0d0a3');
 });
 if(zone===4)strip(460,parallax[2],(x,i)=>tree(x,y+13,i%2?'#484a65':'#5a5879'));
 if(zone===5)strip(425,parallax[2],(x,i)=>{
  round(x+76,y-118,11,118,6,IVORY);
  circle(x+82,y-136,43,i%2?'#ffb7cd':'#b1d8c8');
  circle(x+67,y-151,11,'#ffffff80',0);
 });
 if(zone===6)strip(530,parallax[2],(x,i)=>{
  path([[x+10,y-7],[x+83,y-81-(i%2)*12],[x+146,y-7]],i%2?'#928bb8':'#77789b');
  circle(x+91,y-52,6,'#aaa7cc',0);
 });
 // Bring back the layered detail of the early world backgrounds, without
 // their modulo-wrapped props (which used to pop or overlap at the viewport edge).
 // Every ornament is decorative, has a persistent world-space index and stays
 // behind Granny and gameplay obstacles.
 if(zone===0){
  strip(295,.18,(x,i)=>{
   const base=y-15;
   round(x+8,base-82,63,82,6,i%2?'#dcb7a6':'#b8ccc2',2);
   path([[x+2,base-82],[x+40,base-110],[x+77,base-82]],'#ad7a79',2);
   for(let j=0;j<2;j++)round(x+18+j*30,base-61,18,21,3,IVORY,1.5);
  });
  strip(235,.31,(x,i)=>{
   const b=y+3;line(x,b,x,b-49,'#806e63',4);
   circle(x,b-62,22,i%2?'#85b898':'#a3c9a6',2);
  });
 }
 if(zone===1){
  strip(225,.17,(x,i)=>{
   const b=y-12,h=78+(Math.abs(i)%3)*16;
   line(x+14,b,x+14,b-h*.65,'#6a7661',5);
   for(let j=0;j<3;j++)path([[x-13+j*3,b-h*(.25+j*.19)],[x+14,b-h*(.91+j*.06)],[x+41-j*3,b-h*(.25+j*.19)]],j%2?'#4e9976':'#68a881',2);
  });
  strip(585,.28,(x,i)=>{round(x+15,y-20,120,8,3,'#ecd5ad',2);for(let j=0;j<3;j++)round(x+25+j*45,y-20,7,21,2,'#c1a889',1);});
 }
 if(zone===2){
  strip(278,.075,(x,i)=>{
   const h=145+(Math.abs(i*37)%74);
   round(x+5,y-h,74,h,3,i%2?'#8d9fb9':'#a9b8c9',1.5);
   for(let j=0;j<3;j++)for(let k=0;k<4;k++)round(x+16+j*19,y-h+16+k*29,9,13,1,'#ffe5ae',0);
  });
  strip(275,.3,(x,i)=>{
   line(x+32,y,x+32,y-87,'#6a6a83',5);
   circle(x+32,y-91,12,'#fff0bb',2);
  });
 }
 if(zone===3){
  strip(325,.14,(x,i)=>{
   const b=y-54;
   path([[x,b],[x+52,b-76-(Math.abs(i)%3)*12],[x+109,b]],'#c98c62',1.5);
   path([[x+23,b-18],[x+52,b-62],[x+79,b-18]],'#e2ac78',0);
  });
  strip(330,.32,(x,i)=>{
   const b=y+3,h=54+(Math.abs(i)%3)*11;
   line(x+31,b,x+31,b-h,'#5e956f',11);
   line(x+31,b-h*.44,x+7,b-h*.44,'#5e956f',8);
   line(x+7,b-h*.44,x+7,b-h*.78,'#5e956f',8);
   line(x+31,b-h*.64,x+51,b-h*.64,'#5e956f',8);
   line(x+51,b-h*.64,x+51,b-h*.89,'#5e956f',8);
  });
 }
 if(zone===4){
  strip(245,.15,(x,i)=>{
   path([[x,y],[x+27,y-95-(Math.abs(i)%3)*11],[x+66,y]],'#353350',2);
   round(x+25,y-42,14,24,2,'#ffda91',1);
  });
  strip(345,.34,(x,i)=>{circle(x+43,y-96-(Math.abs(i)%2)*28,2.8,'#ffe49b',0);});
 }
 if(zone===5){
  strip(295,.18,(x,i)=>{
   round(x+10,y-95,76,95,13,i%2?'#f2b1c8':'#d5a8da',2);
   round(x+18,y-82,60,16,5,IVORY,0);
   round(x+18,y-43,60,13,5,IVORY,0);
  });
  strip(310,.32,(x,i)=>{
   line(x+42,y,x+42,y-77,'#fff2db',7);
   circle(x+42,y-90,24,i%2?'#f8aabf':'#bfa8f1',2);
   circle(x+34,y-98,9,'#fff4d4',0);
  });
 }
 if(zone===6){
  strip(315,.13,(x,i)=>{
   round(x+14,y-80,76,80,20,i%2?'#817ca6':'#9c92bc',2);
   round(x+25,y-65,54,32,12,'#bce0e8',2);
   circle(x+32,y-9,7,'#c9c2e6',1);circle(x+73,y-9,7,'#c9c2e6',1);
  });
  strip(440,.28,(x,i)=>{
   circle(x+45,y-157-(Math.abs(i)%3)*14,8,'#f2e6ce',0);
   circle(x+49,y-160-(Math.abs(i)%3)*14,3,'#c8b8dd',0);
  });
 }
 // Three distinct phase-one worlds, with deterministic world-space props.
 if(zone===7){
  strip(350,.11,(x,i)=>{const b=y-6;
   path([[x,b],[x+68,b-142-(Math.abs(i)%3)*18],[x+142,b]],'#e7f6fb',2);
   path([[x+31,b-29],[x+68,b-142-(Math.abs(i)%3)*18],[x+109,b-29]],'#b7d8e9',0);
  });
  strip(420,.25,(x,i)=>{const b=y-5;
   round(x+59,b-90,15,90,5,'#9b7f78',2);
   for(let j=0;j<3;j++)path([[x+18+j*9,b-47-j*24],[x+66,b-158-j*5],[x+117-j*9,b-47-j*24]],j%2?'#a2cfcc':'#8db9c1',2);
   circle(x+66,b-164,6,'#f7fcff',0);
  });
  strip(215,.08,(x,i)=>{const yy=36+(Math.abs(i*37)%150);circle(x+35,yy,2.7,'#fff',0);});
 }
 if(zone===8){
  strip(260,.12,(x,i)=>{const b=y-12,h=95+(Math.abs(i)%4)*28;
   round(x+12,b-h,90,h,5,i%2?'#473069':'#624081',2);
   for(let j=0;j<3;j++)round(x+26+j*23,b-h+16,12,26,3,j%2?'#f77cc3':'#66e2ef',0);
  });
  strip(400,.3,(x,i)=>{const b=y-8;
   round(x+40,b-108,113,108,9,'#4c276b',3);
   round(x+51,b-91,89,39,7,'#69e4e8',2);
   line(x+52,b-44,x+140,b-44,'#f574c4',5);
   circle(x+90,b-23,11,'#ffbbdc',2);
  });
  strip(190,.06,(x,i)=>circle(x+31,32+(Math.abs(i*27)%115),2.2,i%2?'#ff9eda':'#8dffff',0));
 }
 if(zone===9){
  hills(.10,'#75c4b9',52,13);
  strip(410,.16,(x,i)=>{const b=y-9;
   round(x+15,b-39,175,39,8,'#9b6e4e',2);
   line(x+100,b-42,x+100,b-173,'#6e5347',6);
   path([[x+101,b-163],[x+101,b-61],[x+183,b-81]],'#fff3d2',2);
   path([[x+111,b-174],[x+159,b-174],[x+138,b-155]],'#30233b',2);
   line(x+15,b-28,x+190,b-28,'#e7bb7b',4);
  });
  strip(460,.3,(x,i)=>{const b=y-6;
   line(x+60,b,x+60,b-139,'#896956',9);
   for(let j=0;j<4;j++)path([[x+61,b-128+j*10],[x+6+j*4,b-162+j*7],[x+43,b-101]],'#5fae86',2);
   for(let j=0;j<4;j++)path([[x+61,b-128+j*10],[x+116-j*4,b-163+j*7],[x+80,b-101]],'#72c5a1',2);
   round(x+135,b-35,65,35,7,'#b48657',2);
   line(x+146,b-23,x+185,b-23,'#f5d392',3);
  });
 }
 // Phase two foreground scenery: deterministic strips, no collision geometry.
 if(zone===10){
  strip(420,.13,(x,i)=>{const b=y-8;
   round(x+25,b-108,130,106,9,i%2?'#54435e':'#6b506a',2);
   path([[x+18,b-106],[x+91,b-166],[x+166,b-106]],'#3b314c');
   round(x+54,b-72,30,39,5,'#f5bb76',2);round(x+100,b-72,25,39,5,'#f7b17b',2);
  });
  strip(360,.30,(x,i)=>{const b=y-6;
   line(x+61,b,x+61,b-100,'#4f3d56',8);
   circle(x+43,b-114,35,'#5b5273');circle(x+77,b-128,30,'#4f4967');
   circle(x+98,b-16,12,'#e4a367');
  });
  strip(290,.07,(x,i)=>circle(x+12,42+Math.abs(i*19)%105,2,'#f9dbba',0));
 }
 if(zone===11){
  strip(380,.13,(x,i)=>{const b=y-6;round(x+37,b-136,24,136,8,'#54765b',2);
   for(let k=0;k<3;k++){circle(x+26+k*27,b-130-(k%2)*27,40,k%2?'#4f9b6e':'#64ad75',2);}
  });
  strip(500,.31,(x,i)=>{const b=y-4;round(x+21,b-88,116,84,6,'#b8a075',2);
   round(x+36,b-75,87,11,2,'#d9c493',2);round(x+58,b-47,43,43,4,'#756b58',2);
   for(let k=0;k<3;k++)line(x+150+k*12,b-144,x+142+k*9,b-37,'#4e9b65',4);
  });
 }
 if(zone===12){
  strip(480,.12,(x,i)=>{const b=y-5;
   circle(x+112,b-127,70,'#f2d5e5',2);
   for(let k=0;k<8;k++){const a=k*Math.PI/4;circle(x+112+Math.cos(a)*55,b-127+Math.sin(a)*55,8,k%2?'#e47dba':'#72c4db',2);}
   line(x+112,b-127,x+112,b,'#886f98',6);
  });
  strip(390,.30,(x,i)=>{const b=y-5;
   path([[x+5,b-18],[x+86,b-130],[x+169,b-18]],i%2?'#f6c27e':'#ed8ab7');
   for(let k=0;k<4;k++)line(x+21+k*39,b-22,x+21+k*39,b-55,'#fdf0cd',3);
   round(x+24,b-18,129,18,4,'#a585c3',2);
  });
 }
 // Signature actors have exactly one fixed lane, sparse spacing and smooth cycles.
 if(zone===0)strip(760,parallax[3],(x,i)=>{walker(x+56,y-6,i);
  round(x+4,y-25,112,8,3,'#fae6d0',2);for(let n=0;n<3;n++)round(x+14+n*42,y-25,8,29,3,'#f7e3ce',2);
 });
 if(zone===2)strip(860,parallax[3],(x,i)=>car(x+40,y-1,i));
 if(zone===3)strip(820,parallax[3],(x,i)=>{
  const dx=reducedMotion?0:Math.sin(t*.65+i)*10;
  ellipse(x+45+dx,y-20,51,13,'#ffedc2a6');
 });
 if(zone===4)strip(850,parallax[3],(x,i)=>{
  const yy=y-115+(reducedMotion?0:Math.sin(t*.9+i)*5);
  circle(x+70,yy,4,'#ffe18b',0);
  circle(x+91,yy-25,2.7,'#ffe18b',0);
 });
 if(zone===5)strip(840,parallax[3],(x,i)=>{
  const yy=y-150+(reducedMotion?0:Math.sin(t*.8+i)*7);
  circle(x+66,yy,12,'#ffe1a3');circle(x+96,yy+38,6,'#fff0ce');
 });
 ctx.restore();
}
function installMap(getProgress,pause,onSelect){
 const hudButton=document.getElementById('worldMapHudButton');
 const triggers=[hudButton].filter(Boolean);
 const allTriggers=()=>[document.getElementById('worldMapButton'),hudButton].filter(Boolean);
 const modal=document.getElementById('worldMapModal');
 const close=document.getElementById('worldMapClose');
 const list=document.getElementById('worldMapRoute');
 const summary=document.getElementById('worldMapSummary');
 const bar=document.getElementById('worldMapProgress');
 if(!hudButton||!modal||!close||!list)return;
 let previousFocus=null;
 function refresh(){
  const {score,best,currentTier,startTierOffset}=getProgress();
  const index=Math.min(NAMES.length-1,Math.max(0,currentTier%NAMES.length));
  const campaign=window.GrannyLevels?.getLevels()||[];
  const worlds=window.GrannyLevels?.getWorlds()||[];
  bar.style.width=(campaign.filter(l=>l.completed).length/Math.max(1,campaign.length)*100).toFixed(2)+'%';
  summary.textContent=campaign.filter(l=>l.completed).length+'/'+campaign.length+' levels behaald · Deze run: '+Math.floor(score)+' m';
  const artwork=[
   '<rect x="7" y="57" width="126" height="44" rx="9" fill="#8ac58e"/><path d="M15 62V39L37 22L59 39V62Z" fill="#fbd2b4" stroke="#352b49" stroke-width="4"/><path d="M7 40L37 17L67 40" fill="none" stroke="#352b49" stroke-width="5" stroke-linejoin="round"/><rect x="28" y="43" width="16" height="19" rx="3" fill="#97cee0"/><path d="M77 62V33L103 16L126 33V62" fill="#ffe7c6" stroke="#352b49" stroke-width="4"/><path d="M70 35L103 12L133 35" fill="none" stroke="#352b49" stroke-width="5"/><path d="M8 78H134M20 70V92M53 70V92M86 70V92M119 70V92" stroke="#fff0da" stroke-width="6"/>',
   '<path d="M0 80Q35 51 75 77T150 74V103H0Z" fill="#7ebd95"/><path d="M19 85V43M113 83V40" stroke="#4b7354" stroke-width="8"/><circle cx="19" cy="33" r="25" fill="#6cae78" stroke="#352b49" stroke-width="4"/><circle cx="113" cy="34" r="28" fill="#94ca86" stroke="#352b49" stroke-width="4"/><ellipse cx="76" cy="90" rx="40" ry="11" fill="#88cbd4"/><ellipse cx="71" cy="84" rx="15" ry="9" fill="#fff6ce" stroke="#352b49" stroke-width="3"/><circle cx="83" cy="77" r="7" fill="#fff6ce"/><path d="M88 77L97 80L88 83" fill="#f8be66"/>',
   '<rect x="9" y="23" width="38" height="76" rx="4" fill="#8190b4" stroke="#352b49" stroke-width="4"/><rect x="51" y="9" width="40" height="91" rx="4" fill="#626f99" stroke="#352b49" stroke-width="4"/><rect x="95" y="33" width="40" height="66" rx="4" fill="#c28fae" stroke="#352b49" stroke-width="4"/><path d="M21 39H33M21 53H33M63 24H76M63 39H76M107 52H124" stroke="#ffe5a8" stroke-width="6"/><rect x="35" y="78" width="84" height="24" rx="9" fill="#f3bf73" stroke="#352b49" stroke-width="4"/><circle cx="51" cy="99" r="7" fill="#352b49"/><circle cx="101" cy="99" r="7" fill="#352b49"/>',
   '<circle cx="119" cy="24" r="17" fill="#ffedaa"/><path d="M0 80Q29 43 65 78Q105 28 150 78V103H0Z" fill="#d89c66"/><path d="M0 92Q48 63 85 93T150 88V104H0Z" fill="#e7ba7d"/><path d="M64 94V42M64 68H43V54M64 58H84V42" fill="none" stroke="#518668" stroke-width="10" stroke-linecap="round"/><path d="M15 98L29 84L42 98" fill="#c58e6c" stroke="#352b49" stroke-width="3"/>',
   '<rect x="0" y="67" width="150" height="37" fill="#3e3a63"/><circle cx="119" cy="25" r="19" fill="#fff1b9"/><path d="M12 69V45L36 27L60 45V69M75 69V38L105 20L136 38V69" fill="#595477" stroke="#2b274a" stroke-width="4"/><rect x="24" y="47" width="15" height="16" rx="3" fill="#ffd68e"/><rect x="96" y="43" width="14" height="18" rx="3" fill="#ffd68e"/><circle cx="16" cy="17" r="3" fill="#ffe28c"/><circle cx="72" cy="22" r="3" fill="#ffe28c"/><circle cx="128" cy="68" r="4" fill="#ffe28c"/>',
   '<path d="M0 84Q31 48 73 83T150 70V105H0Z" fill="#e8a4d0"/><rect x="17" y="47" width="47" height="56" rx="13" fill="#f4b0c1" stroke="#352b49" stroke-width="4"/><path d="M18 58H63M18 73H63" stroke="#fff0e2" stroke-width="8"/><path d="M107 97V54" stroke="#fff2da" stroke-width="8"/><circle cx="107" cy="39" r="23" fill="#ffb6d0" stroke="#352b49" stroke-width="4"/><path d="M96 31Q110 46 122 29" fill="none" stroke="#fff2da" stroke-width="6"/><circle cx="72" cy="20" r="7" fill="#ffdf9c"/>',
   '<circle cx="110" cy="42" r="37" fill="#a99acf" stroke="#352b49" stroke-width="4"/><ellipse cx="110" cy="42" rx="51" ry="14" transform="rotate(-22 110 42)" fill="none" stroke="#ffe6ba" stroke-width="6"/><circle cx="42" cy="27" r="9" fill="#fff5d7"/><path d="M23 90L42 58L62 90Z" fill="#78799f" stroke="#352b49" stroke-width="4"/><circle cx="22" cy="20" r="3" fill="#fff"/><circle cx="68" cy="12" r="3" fill="#fff"/><circle cx="132" cy="91" r="3" fill="#fff"/>',
   '<path d="M0 91L31 31L61 80L89 20L140 92" fill="#dfedf8" stroke="#4d6f8a" stroke-width="4"/><path d="M31 31L21 51L41 51ZM89 20L76 46L102 46Z" fill="#fff"/><path d="M118 92V47M104 75L118 43L133 75" stroke="#4f9c8c" stroke-width="8"/>',
   '<rect width="150" height="105" fill="#342052"/><path d="M0 100L71 32L150 100" fill="none" stroke="#ff72d3" stroke-width="4"/><path d="M0 100L52 48L150 100" fill="none" stroke="#6ceef5" stroke-width="4"/><circle cx="107" cy="30" r="19" fill="#f78cbf"/><rect x="16" y="49" width="48" height="56" fill="#62458b" stroke="#67ddec" stroke-width="4"/>',
   '<rect width="150" height="105" fill="#a3e5e4"/><path d="M0 90Q25 69 55 86T150 82V105H0" fill="#67b8aa"/><path d="M18 89H127L115 101H32Z" fill="#ac7955" stroke="#392d44" stroke-width="4"/><path d="M70 89V15L117 73H70Z" fill="#fff2cc" stroke="#392d44" stroke-width="3"/><path d="M70 15L111 20L88 35Z" fill="#433044"/>',
   '<rect width="150" height="105" fill="#59436d"/><circle cx="113" cy="20" r="15" fill="#f7d194"/><path d="M10 94V50L35 21L63 50V94M67 94V45L99 15L130 45V94" fill="#785873" stroke="#392d44" stroke-width="4"/><rect x="29" y="56" width="16" height="24" fill="#ffcf9a"/><path d="M6 100Q75 77 146 100" fill="#bc845e"/>',
   '<rect width="150" height="105" fill="#a4d7aa"/><circle cx="34" cy="28" r="29" fill="#5caa72"/><circle cx="114" cy="25" r="36" fill="#4a9869"/><path d="M29 103V37M117 105V32" stroke="#7a7251" stroke-width="10"/><rect x="50" y="58" width="61" height="45" rx="6" fill="#c9ac79"/><rect x="69" y="74" width="23" height="29" fill="#676956"/>',
   '<rect width="150" height="105" fill="#f0c8df"/><circle cx="107" cy="44" r="34" fill="none" stroke="#9166b0" stroke-width="5"/><path d="M107 9V79M72 44H142" stroke="#9166b0" stroke-width="4"/><path d="M75 105L107 54L140 105" fill="none" stroke="#9166b0" stroke-width="6"/><path d="M10 91L39 28L70 91Z" fill="#ffcf7e" stroke="#392d44" stroke-width="3"/><path d="M24 91V62M53 91V62" stroke="#f9eece" stroke-width="6"/>'
  ];
  list.className='world-map-route world-map-illustrated';
  list.innerHTML='<svg class="world-map-winding-road" viewBox="0 0 100 2200" preserveAspectRatio="none" aria-hidden="true"><path d="M25 76 C82 126 81 185 56 230 S9 344 45 400 S87 509 56 563 S8 673 48 735 S86 858 51 919 S17 1039 70 1095 S82 1278 40 1390 S20 1490 68 1595 S84 1740 33 1870 S15 2000 69 2140" fill="none" stroke="#352b49" stroke-width="18" stroke-linecap="round"/><path d="M25 76 C82 126 81 185 56 230 S9 344 45 400 S87 509 56 563 S8 673 48 735 S86 858 51 919 S17 1039 70 1095 S82 1278 40 1390 S20 1490 68 1595 S84 1740 33 1870 S15 2000 69 2140" fill="none" stroke="#fff1cb" stroke-width="12" stroke-linecap="round" stroke-dasharray="3 3"/></svg>'+
  NAMES.map((name,i)=>{
    const world=worlds[i]||{levels:[],unlocked:i===0,completed:false,completedCount:0};
    const unlocked=world.unlocked,active=i===index,visited=world.completed;
    const art='<svg class="world-map-scene" viewBox="0 0 150 105" role="img" aria-label="'+name+' illustratie">'+artwork[i]+'</svg>';
    const status=active?'HIER BEN JE':visited?'WERELD BEHAALD':unlocked?'SPEELBAAR':'VERGRENDELD';
    const stages='<div class="world-map-level-grid" aria-label="Levels '+name+'">'+world.levels.map(l=>
      '<button type="button" class="world-map-level'+(l.completed?' is-done':'')+(l.index===window.GrannyLevels.getSelected()?' is-selected':'')+'" data-level="'+l.index+'" '+(!l.unlocked?'disabled aria-disabled="true"':'')+
      ' aria-label="'+name+', level '+l.number+', doel '+l.goal+' meter">'+
      '<b>'+(l.completed?'✓':l.number)+'</b><small>'+l.goal+' m</small></button>'
    ).join('')+'</div>';
    return '<li class="world-map-island world-map-zone-'+i+(active?' is-current':'')+(unlocked?' is-unlocked':' is-locked')+'"><div class="world-map-landscape">'+art+'<span class="world-map-step-number">'+(i+1)+'</span></div><div class="world-map-island-copy"><div class="world-map-island-status">'+status+'</div><strong>'+name+'</strong><small>'+SIGNATURE[i]+'</small><span class="world-map-meters">'+world.completedCount+' / 7 LEVELS</span></div>'+stages+(active?'<div class="world-map-granny-marker" aria-label="Granny is hier">OMA <span>●</span></div>':'')+'</li>';
  }).join('');
  list.querySelectorAll('[data-level]:not([disabled])').forEach(el=>el.addEventListener('click',()=>{
   const target=Number(el.dataset.level);
   if(onSelect?.(target)!==false)hide();
  }));
 }
 function open(){
  if(modal.hidden===false)return;
  previousFocus=document.activeElement;
  if(getProgress().state==='playing')pause();
  refresh();modal.hidden=false;allTriggers().forEach(el=>el.setAttribute('aria-expanded','true'));close.focus();
 }
 function hide(){
  modal.hidden=true;allTriggers().forEach(el=>el.setAttribute('aria-expanded','false'));
  if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus();
 }
 triggers.forEach(el=>el.addEventListener('click',open));
 const menuMapButton=document.getElementById('worldMapButton');
 menuMapButton?.addEventListener('click',open);
 document.getElementById('menuContent')?.addEventListener('click',event=>{
  if(event.target.closest('#worldMapButton'))open();
 });
 close.addEventListener('click',hide);
 modal.addEventListener('click',event=>{if(event.target===modal)hide();});
 document.addEventListener('keydown',event=>{
  if(modal.hidden)return;
  if(event.key==='Escape'){event.preventDefault();hide();}
  if(event.key==='Tab'){
   const focusables=[close,...modal.querySelectorAll('button:not([disabled])')].filter((el,i,arr)=>arr.indexOf(el)===i);
   if(event.shiftKey&&document.activeElement===focusables[0]){event.preventDefault();focusables.at(-1).focus();}
   else if(!event.shiftKey&&document.activeElement===focusables.at(-1)){event.preventDefault();focusables[0].focus();}
  }
 },true);
}
window.GrannyStorybook={draw,installMap,NAMES,SIGNATURE,COLORS};
})();
