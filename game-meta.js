(()=>{
'use strict';
const achievements=[
 {id:'first-run',icon:'👟',name:'Op pad',description:'Voltooi je eerste run.',reward:15,check:s=>s.runs>=1},
 {id:'perfect-10',icon:'✨',name:'Stalen zenuwen',description:'Maak 10 PERFECT SAVES.',reward:40,check:s=>s.perfects>=10},
 {id:'near-25',icon:'⚡',name:'Rakelings',description:'Maak 25 near misses.',reward:50,check:s=>s.nearMisses>=25},
 {id:'coin-250',icon:'🪙',name:'Spaaroma',description:'Verzamel in totaal 250 munten.',reward:60,check:s=>s.coinsCollected>=250},
 {id:'tier-5',icon:'🌙',name:'Wereldreiziger',description:'Bereik Tier 5.',reward:75,check:s=>s.maxTier>=5},
 {id:'combo-10',icon:'🔥',name:'Niet te stoppen',description:'Bouw een combo van 10.',reward:80,check:s=>s.bestCombo>=10},
 {id:'distance-5000',icon:'🏁',name:'Lange adem',description:'Leg in totaal 5.000 meter af.',reward:100,check:s=>s.totalDistance>=5000},
 {id:'collector-3',icon:'🎀',name:'Verzamelaar',description:'Bezit 3 extra accessoires.',reward:55,check:s=>s.accessoriesOwned>=3}
];
const missionPool=[
 {id:'coins-20',event:'coins',goal:20,icon:'🪙',label:'Pak 20 munten',reward:20},
 {id:'perfect-3',event:'perfect',goal:3,icon:'✨',label:'Maak 3 PERFECT SAVES',reward:25},
 {id:'near-5',event:'near',goal:5,icon:'⚡',label:'Maak 5 near misses',reward:25},
 {id:'distance-1000',event:'distance',goal:1000,icon:'🏁',label:'Loop 1.000 meter',reward:30},
 {id:'tier-3',event:'tier',goal:3,icon:'🌍',label:'Bereik Tier 3',reward:30}
];
const weeklyPool=[
 {id:'week-coins-120',event:'coins',goal:120,icon:'💰',label:'Pak 120 munten',reward:90},
 {id:'week-perfect-15',event:'perfect',goal:15,icon:'💫',label:'Maak 15 PERFECT SAVES',reward:100},
 {id:'week-distance-5000',event:'distance',goal:5000,icon:'🗺️',label:'Loop 5.000 meter',reward:110}
];
const unlocks=[
 {distance:500,icon:'🌳',label:'Stadspark',detail:'Meer natuur + vaker snoepjes'},
 {distance:1000,icon:'🏙️',label:'Grote stad',detail:'Sneller verkeer'},
 {distance:1500,icon:'🌵',label:'Woestijn',detail:'Windvlagen veranderen het tempo'},
 {distance:2000,icon:'🌙',label:'Nacht',detail:'Near misses leveren extra focus'},
 {distance:2500,icon:'🍬',label:'Snoepwereld',detail:'Munten zijn extra veel waard'},
 {distance:3000,icon:'🚀',label:'Ruimte',detail:'Lagere zwaartekracht'}
];
const cosmetics=[
 {id:'cane-classic',type:'cane',icon:'🦯',name:'Klassieke wandelstok',cost:0},
 {id:'cane-gold',type:'cane',icon:'✨',name:'Gouden wandelstok',cost:180},
 {id:'glasses-heart',type:'glasses',icon:'💗',name:'Hartjesbril',cost:220},
 {id:'glasses-star',type:'glasses',icon:'⭐',name:'Sterrenbril',cost:300},
 {id:'companion-duck',type:'companion',icon:'🐥',name:'Wandel-eendje',cost:350},
 {id:'companion-cat',type:'companion',icon:'🐈',name:'Trouwe kat',cost:450}
];
const worldRules=[
 {id:'neighborhood',label:'Rustige start',speed:1,gravity:1850,jump:-690,coinValue:1,candyRate:1,attackBonus:0},
 {id:'park',label:'Picknickbonus · vaker snoep',speed:.99,gravity:1850,jump:-690,coinValue:1,candyRate:.78,attackBonus:0},
 {id:'city',label:'Spitsuur · sneller verkeer',speed:1.06,gravity:1850,jump:-690,coinValue:1,candyRate:1,attackBonus:.18},
 {id:'desert',label:'Woestijnwind · golvend tempo',speed:1,gravity:1780,jump:-675,coinValue:1,candyRate:1.05,attackBonus:0,wind:true},
 {id:'night',label:'Nachtfocus · near miss bonus',speed:1.02,gravity:1850,jump:-690,coinValue:1,candyRate:1,attackBonus:.05,focusBonus:.01},
 {id:'candy',label:'Sugar rush · dubbele munten',speed:1.04,gravity:1850,jump:-700,coinValue:2,candyRate:.9,attackBonus:.05},
 {id:'space',label:'Lage zwaartekracht',speed:1.03,gravity:1320,jump:-585,coinValue:1,candyRate:1.1,attackBonus:.08}
];
window.GrannyMeta={version:'V.1.1.0.0',achievements,missionPool,weeklyPool,unlocks,cosmetics,worldRules};
})();