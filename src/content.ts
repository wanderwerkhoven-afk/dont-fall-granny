export type SceneryKind = 'skyline' | 'houses' | 'fence' | 'buildings' | 'shops' | 'traffic' | 'trees' | 'pond' | 'leaves' | 'dunes' | 'cacti' | 'dust' | 'windows' | 'fireflies' | 'candy' | 'sweets' | 'stars' | 'planets' | 'debris';

export interface VisualLayer {
  kind: SceneryKind;
  factor: number;
  color: number;
}
export interface VisualTheme {
  sky: number;
  ground: number;
  far: VisualLayer;
  mid: VisualLayer;
  near: VisualLayer;
  foreground: VisualLayer;
  particles: 'none' | 'leaves' | 'dust' | 'fireflies' | 'sweets' | 'stars';
  signature: string;
}
export interface TierDefinition {
  id: string;
  name: string;
  startMeters: number;
  visualTheme: VisualTheme;
}
const layer = (kind: SceneryKind, factor: number, color: number): VisualLayer => ({kind, factor, color});
export const TIERS: readonly TierDefinition[] = [
  {id:'neighborhood',name:'DE BUURT',startMeters:0,visualTheme:{sky:0xb9dce9,ground:0x779b70,far:layer('skyline',.05,0x9fb8bb),mid:layer('houses',.12,0xf2c7cb),near:layer('trees',.28,0x7eaa7c),foreground:layer('fence',.65,0xffe8c6),particles:'none',signature:'wandelaars achter de hekjes'}},
  {id:'park',name:'HET PARK',startMeters:500,visualTheme:{sky:0xc5e9df,ground:0x7fa96d,far:layer('trees',.05,0x9bbf9e),mid:layer('pond',.12,0x78c6c6),near:layer('trees',.28,0x4d9475),foreground:layer('leaves',.65,0xf5c66b),particles:'leaves',signature:'eenden en vallende bladeren'}},
  {id:'city',name:'DE STAD',startMeters:1000,visualTheme:{sky:0x9eabc9,ground:0x83828c,far:layer('buildings',.05,0x65728f),mid:layer('shops',.12,0xf0a2ae),near:layer('traffic',.28,0xeabd73),foreground:layer('fence',.65,0x6b577c),particles:'none',signature:'neonwinkels en verkeer'}},
  {id:'desert',name:'DE WOESTIJN',startMeters:1500,visualTheme:{sky:0xf9c595,ground:0xd8a46d,far:layer('dunes',.05,0xe9b780),mid:layer('dunes',.12,0xd99367),near:layer('cacti',.28,0x729476),foreground:layer('dust',.65,0xf7d7a1),particles:'dust',signature:'stofwolken en hittegolven'}},
  {id:'night',name:'DE NACHT',startMeters:2000,visualTheme:{sky:0x292b54,ground:0x444d67,far:layer('stars',.05,0xdce8ff),mid:layer('houses',.12,0x645875),near:layer('windows',.28,0xffd589),foreground:layer('trees',.65,0x363e5c),particles:'fireflies',signature:'vuurvliegjes en verlichte ramen'}},
  {id:'candy',name:'DE SNOEPWERELD',startMeters:2500,visualTheme:{sky:0xffc7e2,ground:0xc9a0da,far:layer('candy',.05,0xffe5f1),mid:layer('sweets',.12,0xf28cb7),near:layer('candy',.28,0x8ed9cb),foreground:layer('sweets',.65,0xffe28b),particles:'sweets',signature:'zwevende snoepdeeltjes'}},
  {id:'space',name:'DE RUIMTE',startMeters:3000,visualTheme:{sky:0x161633,ground:0x494775,far:layer('stars',.05,0xffffff),mid:layer('planets',.12,0xc6a8f0),near:layer('debris',.28,0xa8b7d7),foreground:layer('stars',.65,0xffd786),particles:'stars',signature:'grote planeet en sterrenvelden'}}
];
export const getTierIndex = (meters: number): number => {
  for (let i=TIERS.length-1;i>=0;i--) if (meters>=TIERS[i].startMeters) return i;
  return 0;
};
