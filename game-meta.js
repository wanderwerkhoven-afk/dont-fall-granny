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
 {distance:3000,icon:'🚀',label:'Ruimte',detail:'Lagere zwaartekracht'},
 {distance:3500,icon:'❄️',label:'Winterwonderland',detail:'IJzige obstakels'},
 {distance:4000,icon:'🕹️',label:'Neon 80’s',detail:'Retro arcade-chaos'},
 {distance:4500,icon:'🏴‍☠️',label:'Piratenbaai',detail:'Kisten, krabben en kanonskogels'},
 {distance:5000,icon:'🎃',label:'Halloweenland',detail:'Spookachtige hindernissen'},
 {distance:5500,icon:'🌴',label:'De jungle',detail:'Lianen en tropische beesten'},
 {distance:6000,icon:'🎡',label:'Het carnaval',detail:'Kermis, confetti en circus'}
];
const cosmetics=[
 {id:'cane-classic',type:'cane',icon:'🦯',name:'Klassieke wandelstok',cost:0},
 {id:'cane-gold',type:'cane',icon:'✨',name:'Gouden wandelstok',cost:4000,masteryUnlock:{world:0,star:1}},
 {id:'glasses-heart',type:'glasses',icon:'💗',name:'Hartjesbril',cost:7500,masteryUnlock:{world:5,star:0}},
 {id:'glasses-star',type:'glasses',icon:'⭐',name:'Sterrenbril',cost:8500,masteryUnlock:{world:4,star:1}},
 {id:'companion-duck',type:'companion',icon:'🦆',name:'Wandel-eendje',cost:5500,masteryUnlock:{world:1,star:1}},
 {id:'companion-cat',type:'companion',icon:'🐈',name:'Trouwe kat',cost:6800,masteryUnlock:{world:3,star:2}},
 {id:'cane-rose',type:'cane',icon:'🌹',name:'Rozenwandelstok',cost:4200},
 {id:'cane-crystal',type:'cane',icon:'💎',name:'Kristallen wandelstok',cost:12500},
 {id:'cane-rainbow',type:'cane',icon:'🌈',name:'Regenboogwandelstok',cost:15500},
 {id:'glasses-sun',type:'glasses',icon:'😎',name:'Zonnebril deluxe',cost:5500},
 {id:'glasses-moon',type:'glasses',icon:'🌙',name:'Maanbril',cost:8800},
 {id:'glasses-rainbow',type:'glasses',icon:'🌈',name:'Regenboogbril',cost:10500},
 {id:'companion-frog',type:'companion',icon:'🐸',name:'Kikker Karel',cost:6800},
 {id:'companion-dog',type:'companion',icon:'🐕',name:'Wandelhondje',cost:9200},
 {id:'companion-owl',type:'companion',icon:'🦉',name:'Uiltje Luna',cost:12500},
 {id:'companion-fox',type:'companion',icon:'🦊',name:'Vosje Vinnie',cost:14800},
 {id:'companion-unicorn',type:'companion',icon:'🦄',name:'Eenhoornvriend',cost:22000},
 {id:'glasses-snow',type:'glasses',icon:'🥽',name:'Sneeuwbril',cost:12500,masteryUnlock:{world:7,star:0}},
 {id:'cane-ice',type:'cane',icon:'❄️',name:'IJskristalstok',cost:17500,masteryUnlock:{world:7,star:1}},
 {id:'companion-husky',type:'companion',icon:'🐺',name:'Sneeuwhusky',cost:22000,masteryUnlock:{world:7,star:2}},
 {id:'glasses-retro',type:'glasses',icon:'🕶️',name:'Retro neonbril',cost:16000,masteryUnlock:{world:8,star:0}},
 {id:'cane-neon',type:'cane',icon:'⚡',name:'Neonwandelstok',cost:23000,masteryUnlock:{world:8,star:1}},
 {id:'companion-robot',type:'companion',icon:'🤖',name:'Arcadebot',cost:27500,masteryUnlock:{world:8,star:2}},
 {id:'glasses-pirate',type:'glasses',icon:'🏴‍☠️',name:'Piratenooglap',cost:17500,masteryUnlock:{world:9,star:0}},
 {id:'cane-hook',type:'cane',icon:'🪝',name:'Kapiteinshaak',cost:24500,masteryUnlock:{world:9,star:1}},
 {id:'companion-parrot',type:'companion',icon:'🦜',name:'Papegaai Polly',cost:30000,masteryUnlock:{world:9,star:2}},
 {id:'glasses-pumpkin',type:'glasses',icon:'🎃',name:'Pompoenbril',cost:18000,masteryUnlock:{world:10,star:0}},
 {id:'cane-ghost',type:'cane',icon:'👻',name:'Spookwandelstok',cost:26500,masteryUnlock:{world:10,star:1}},
 {id:'companion-bat',type:'companion',icon:'🦇',name:'Vleermuisvriend',cost:32000,masteryUnlock:{world:10,star:2}},
 {id:'glasses-leaf',type:'glasses',icon:'🍃',name:'Junglebril',cost:19000,masteryUnlock:{world:11,star:0}},
 {id:'cane-flower',type:'cane',icon:'🌺',name:'Tropenwandelstok',cost:28000,masteryUnlock:{world:11,star:1}},
 {id:'companion-monkey',type:'companion',icon:'🐒',name:'Aapje Momo',cost:34000,masteryUnlock:{world:11,star:2}},
 {id:'glasses-carnival',type:'glasses',icon:'🎭',name:'Carnavalsmasker',cost:21000,masteryUnlock:{world:12,star:0}},
 {id:'cane-confetti',type:'cane',icon:'🎉',name:'Confettistok',cost:30000,masteryUnlock:{world:12,star:1}},
 {id:'companion-clown',type:'companion',icon:'🤡',name:'Clownvriend',cost:36000,masteryUnlock:{world:12,star:2}},
 {id:'hat-none',type:'hat',icon:'◌',name:'Geen hoed',cost:0,hatStyle:'none',hatColor:'#ffffff',hatAccent:'#ffffff'},
 {id:'hat-beret',type:'hat',icon:'🎨',name:'Bordeaux baret',cost:4200,hatStyle:'beret',hatColor:'#b54f65',hatAccent:'#f6ce99'},
 {id:'hat-straw',type:'hat',icon:'👒',name:'Strohoed met lint',cost:5600,hatStyle:'straw',hatColor:'#e4bf78',hatAccent:'#ad5d77'},
 {id:'hat-sun',type:'hat',icon:'☀️',name:'Zomerzonnehoed',cost:7200,hatStyle:'sun',hatColor:'#ecca9d',hatAccent:'#f391ad'},
 {id:'hat-bow',type:'hat',icon:'🎀',name:'Strikjeshoed',cost:8900,hatStyle:'bow',hatColor:'#ca91cf',hatAccent:'#fff3c6'},
 {id:'hat-winter',type:'hat',icon:'🧶',name:'Warme wintermuts',cost:11500,hatStyle:'beanie',hatColor:'#83b8d9',hatAccent:'#fff9f0',masteryRequirement:{world:7,star:0}},
 {id:'hat-cowboy',type:'hat',icon:'🤠',name:'Cowboyhoed',cost:13500,hatStyle:'cowboy',hatColor:'#9e704c',hatAccent:'#f6d78a'},
 {id:'hat-neon',type:'hat',icon:'🧢',name:'Neon 80’s cap',cost:16500,hatStyle:'cap',hatColor:'#6d3d9c',hatAccent:'#80f5dc',masteryRequirement:{world:8,star:1}},
 {id:'hat-pirate',type:'hat',icon:'🏴‍☠️',name:'Piratensteek',cost:19000,hatStyle:'pirate',hatColor:'#3e405c',hatAccent:'#f5c37a',masteryRequirement:{world:9,star:0}},
 {id:'hat-witch',type:'hat',icon:'🧙',name:'Heksenhoed',cost:22500,hatStyle:'witch',hatColor:'#5c4174',hatAccent:'#f2b96c',masteryRequirement:{world:10,star:1}},
 {id:'hat-jungle',type:'hat',icon:'🌿',name:'Jungle safarihoed',cost:17000,hatStyle:'safari',hatColor:'#8b9365',hatAccent:'#e3c38f',masteryRequirement:{world:11,star:0}},
 {id:'hat-crown',type:'hat',icon:'👑',name:'Koninklijke kroon',cost:32000,hatStyle:'crown',hatColor:'#eac04b',hatAccent:'#fbe89b',masteryRequirement:{world:6,star:1}},
 {id:'hat-carnival',type:'hat',icon:'🎉',name:'Carnavalsprinses',cost:26500,hatStyle:'party',hatColor:'#ea79b1',hatAccent:'#fce88c',masteryRequirement:{world:12,star:1}}
];
const worldRules=[
 {id:'neighborhood',label:'Rustige start',speed:1,gravity:1850,jump:-690,coinValue:1,candyRate:1,attackBonus:0},
 {id:'park',label:'Picknickbonus · vaker snoep',speed:.99,gravity:1850,jump:-690,coinValue:1,candyRate:.78,attackBonus:0},
 {id:'city',label:'Spitsuur · sneller verkeer',speed:1.06,gravity:1850,jump:-690,coinValue:1,candyRate:1,attackBonus:.18},
 {id:'desert',label:'Woestijnwind · golvend tempo',speed:1,gravity:1780,jump:-675,coinValue:1,candyRate:1.05,attackBonus:0,wind:true},
 {id:'night',label:'Nachtfocus · near miss bonus',speed:1.02,gravity:1850,jump:-690,coinValue:1,candyRate:1,attackBonus:.05,focusBonus:.01},
 {id:'candy',label:'Sugar rush · dubbele munten',speed:1.04,gravity:1850,jump:-700,coinValue:2,candyRate:.9,attackBonus:.05},
 {id:'space',label:'Lage zwaartekracht',speed:1.03,gravity:1320,jump:-585,coinValue:1,candyRate:1.1,attackBonus:.08},
 {id:'winter',label:'IJzige route',speed:1.02,gravity:1820,jump:-675,coinValue:1,candyRate:1.05,attackBonus:.07},
 {id:'neon',label:'Arcade rush',speed:1.10,gravity:1850,jump:-700,coinValue:1,candyRate:1,attackBonus:.12},
 {id:'pirate',label:'Piratendek',speed:1.05,gravity:1850,jump:-690,coinValue:1,candyRate:.96,attackBonus:.10},
 {id:'halloween',label:'Spooknacht',speed:1.04,gravity:1810,jump:-690,coinValue:1,candyRate:1,attackBonus:.09},
 {id:'jungle',label:'Jungletocht',speed:1.06,gravity:1750,jump:-680,coinValue:1,candyRate:.95,attackBonus:.1},
 {id:'carnival',label:'Kermispret',speed:1.09,gravity:1850,jump:-695,coinValue:1,candyRate:.92,attackBonus:.12}
];
const tieredAchievements=[
 {id:'perfects',icon:'✨',name:'Stalen zenuwen',stat:'perfects',tiers:[10,50,150,500]},
 {id:'near-misses',icon:'⚡',name:'Rakelings',stat:'nearMisses',tiers:[25,100,300,750]},
 {id:'coins',icon:'🪙',name:'Muntenmagneet',stat:'coinsCollected',tiers:[250,1000,3000,7500]},
 {id:'distance',icon:'🏁',name:'Lange adem',stat:'totalDistance',tiers:[5000,20000,50000,100000]}
];
const difficultyModes={
 calm:{id:'calm',label:'Rustig',speed:.9,recovery:.12,reward:.85},
 normal:{id:'normal',label:'Normaal',speed:1,recovery:0,reward:1},
 chaos:{id:'chaos',label:'Chaos',speed:1.13,recovery:-.06,reward:1.35}
};
const rankLevels=[
 {level:1,name:'Buurtwandelaar',xp:0},{level:2,name:'Stoepheld',xp:250},{level:3,name:'Parkpro',xp:700},
 {level:4,name:'Stadsstapper',xp:1500},{level:5,name:'Wereldoma',xp:2800},{level:6,name:'Kosmische Granny',xp:5000}
];
const worldChallenges=[
 {id:'neighborhood-rush',label:'Hindernissenregen',icon:'🏡'},
 {id:'park-sprint',label:'Park sprint',icon:'🌳'},
 {id:'city-rush',label:'Spitsgolf',icon:'🏙️'},
 {id:'desert-storm',label:'Zandstorm',icon:'🌵'},
 {id:'night-scare',label:'Nachtvlucht',icon:'🌙'},
 {id:'sugar-rush',label:'Sugar Rush',icon:'🍬'},
 {id:'meteor-rain',label:'Meteorenregen',icon:'🚀'},
 {id:'ice-slide',label:'IJskou',icon:'❄️'},
 {id:'retro-rush',label:'Retro Rush',icon:'🕹️'},
 {id:'pirate-plunder',label:'Schattenjacht',icon:'🏴‍☠️'},
 {id:'haunted-rush',label:'Spookparade',icon:'🎃'},
 {id:'jungle-dash',label:'Junglekoorts',icon:'🌴'},
 {id:'carnival-chaos',label:'Kermischaos',icon:'🎡'}
];
const collectionSets=[
 {id:'golden-granny',name:'Gouden Granny',requires:['gold','cane-gold'],reward:'gold-trail'},
 {id:'star-style',name:'Sterrenstijl',requires:['midnight','glasses-star'],reward:'star-frame'}
];
window.GrannyMeta={version:'V.1.2.0.0',achievements,missionPool,weeklyPool,unlocks,cosmetics,worldRules,tieredAchievements,difficultyModes,rankLevels,worldChallenges,collectionSets};
})();