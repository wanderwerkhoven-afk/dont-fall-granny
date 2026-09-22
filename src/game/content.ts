export interface TierDefinition {
  name: string;
  icon: string;
  sky: [number, number, number];
  hill: number;
  near: number;
  road: [number, number, number];
  building: number;
  tree: number;
  sun: number;
  obstacleIds: string[];
}

export interface OutfitDefinition {
  id: string;
  name: string;
  cost: number;
  color: number;
  hair: number;
}

export interface GadgetDefinition {
  id: 'plane' | 'booster';
  name: string;
  cost: number;
  description: string;
  duration: number;
}

export interface ObstacleDefinition {
  id: string;
  width: number;
  height: number;
  emoji?: string;
  damage: number;
  heavy?: boolean;
  charging?: boolean;
  multiplier?: number;
}

export const TIERS: TierDefinition[] = [
  {
    name: 'De rustige buurt',
    icon: '🏡',
    sky: [0xc7e9ed, 0xe0f5e9, 0xeaf5dc],
    hill: 0xb7d8c6,
    near: 0xc5ddc4,
    road: [0xf6d7ae, 0xf7dfbd, 0xe8c69d],
    building: 0xc9dbcb,
    tree: 0xa6cdb0,
    sun: 0xffe5a2,
    obstacleIds: ['cat', 'dog', 'plant', 'sock', 'walker', 'slipper', 'basket']
  },
  {
    name: 'Het stadspark',
    icon: '🌳',
    sky: [0x9edbc8, 0xd6f4bb, 0xf3efc5],
    hill: 0x80ba8a,
    near: 0xa3d293,
    road: [0xd8bd9c, 0xf0d9b1, 0xc9a981],
    building: 0xa5c3a1,
    tree: 0x4eaa75,
    sun: 0xffdb80,
    obstacleIds: ['dog', 'plant', 'basket', 'cat', 'log', 'mushroom']
  },
  {
    name: 'De grote stad',
    icon: '🏙️',
    sky: [0x91b6df, 0xd1d6ec, 0xf4e2d7],
    hill: 0xa7b7cb,
    near: 0xb7c3d4,
    road: [0xb7afbd, 0xd6c9ce, 0xa99ea9],
    building: 0x7189ac,
    tree: 0x668f96,
    sun: 0xfff0b7,
    obstacleIds: ['car', 'cone', 'bike', 'pigeon', 'cat', 'dog', 'bin']
  },
  {
    name: 'De woestijn',
    icon: '🌵',
    sky: [0xf8ad77, 0xffd2a0, 0xffe8b5],
    hill: 0xdcaa72,
    near: 0xefc88b,
    road: [0xdca16d, 0xf3ca8c, 0xcb8b62],
    building: 0xc98d69,
    tree: 0xaaaf70,
    sun: 0xfff0a0,
    obstacleIds: ['cactus', 'scorpion', 'rock', 'tumble']
  },
  {
    name: 'De nacht',
    icon: '🌙',
    sky: [0x20274f, 0x4e4479, 0xa37b99],
    hill: 0x575477,
    near: 0x696287,
    road: [0x756a85, 0x9c849b, 0x554e70],
    building: 0x424569,
    tree: 0x4a6374,
    sun: 0xfff5cb,
    obstacleIds: ['bat', 'ghost', 'pumpkin', 'cat']
  },
  {
    name: 'De snoepwereld',
    icon: '🍬',
    sky: [0xe7b6e9, 0xffd3e8, 0xfff0d0],
    hill: 0xd7a5cc,
    near: 0xeac1d7,
    road: [0xe5afbc, 0xf8d5c9, 0xce98bd],
    building: 0xd5a7d8,
    tree: 0xf2a5c5,
    sun: 0xfff1b8,
    obstacleIds: ['candybox', 'lollipop', 'donut', 'gum']
  },
  {
    name: 'De ruimte',
    icon: '🚀',
    sky: [0x10152f, 0x26224d, 0x4b376e],
    hill: 0x443c73,
    near: 0x62518b,
    road: [0x71618c, 0x9b83ac, 0x50456e],
    building: 0x3e3c71,
    tree: 0x7771b0,
    sun: 0xf1e4ff,
    obstacleIds: ['asteroid', 'alien', 'satellite', 'moonrock']
  }
];

export const OUTFITS: OutfitDefinition[] = [
  { id: 'classic', name: 'Klassieke oma', cost: 0, color: 0xad78a4, hair: 0xe6e4e3 },
  { id: 'red', name: 'Rode jas', cost: 12, color: 0xe35d67, hair: 0xe6e4e3 },
  { id: 'sport', name: 'Sportieve oma', cost: 20, color: 0x3e8db7, hair: 0xf0e9d5 },
  { id: 'gold', name: 'Gouden outfit', cost: 40, color: 0xedb74c, hair: 0xfff3d0 },
  { id: 'night', name: 'Nachtloper', cost: 55, color: 0x6250a5, hair: 0xb4c4ec },
  { id: 'mint', name: 'Mintgroen', cost: 28, color: 0x4eb79b, hair: 0xf3e9e1 }
];

export const GADGETS: GadgetDefinition[] = [
  {
    id: 'plane',
    name: 'Vliegtuig',
    cost: 45,
    description: 'Zeldzame vlucht · tik om te fladderen · 9 sec.',
    duration: 9
  },
  {
    id: 'booster',
    name: 'Raketbooster',
    cost: 35,
    description: 'Turbo-run · wissel van baan · 8 sec.',
    duration: 8
  }
];

const obstacle = (
  id: string,
  width: number,
  height: number,
  emoji: string,
  damage: number,
  heavy = false,
  charging = false,
  multiplier = 1
): ObstacleDefinition => ({
  id,
  width,
  height,
  emoji,
  damage,
  heavy,
  charging,
  multiplier
});

export const OBSTACLES: Record<string, ObstacleDefinition> = {
  cat: obstacle('cat', 82, 58, '🐈', 0.26, false, true, 1.62),
  dog: obstacle('dog', 86, 62, '🐕', 0.28),
  plant: obstacle('plant', 68, 88, '🪴', 0.24),
  sock: obstacle('sock', 65, 36, '🧦', 0.18),
  walker: obstacle('walker', 98, 96, '🦽', 0.46, true),
  slipper: obstacle('slipper', 72, 38, '🥿', 0.18),
  basket: obstacle('basket', 74, 62, '🧺', 0.24),
  log: obstacle('log', 88, 54, '🪵', 0.28),
  mushroom: obstacle('mushroom', 66, 70, '🍄', 0.22),
  car: obstacle('car', 138, 74, '🚗', 0.58, true, true, 1.95),
  cone: obstacle('cone', 64, 82, '🚧', 0.26),
  bike: obstacle('bike', 96, 92, '🚲', 0.42, true),
  pigeon: obstacle('pigeon', 66, 52, '🐦', 0.2),
  bin: obstacle('bin', 68, 84, '🗑️', 0.35),
  cactus: obstacle('cactus', 72, 92, '🌵', 0.42, true),
  scorpion: obstacle('scorpion', 72, 46, '🦂', 0.28),
  rock: obstacle('rock', 74, 54, '🪨', 0.34),
  tumble: obstacle('tumble', 72, 60, '🌾', 0.24),
  bat: obstacle('bat', 72, 54, '🦇', 0.22),
  ghost: obstacle('ghost', 70, 82, '👻', 0.32),
  pumpkin: obstacle('pumpkin', 74, 68, '🎃', 0.34),
  candybox: obstacle('candybox', 70, 66, '🍫', 0.26),
  lollipop: obstacle('lollipop', 66, 88, '🍭', 0.28),
  donut: obstacle('donut', 72, 66, '🍩', 0.24),
  gum: obstacle('gum', 68, 58, '🧁', 0.24),
  asteroid: obstacle('asteroid', 76, 70, '☄️', 0.42, true),
  alien: obstacle('alien', 74, 76, '👾', 0.36),
  satellite: obstacle('satellite', 86, 82, '🛰️', 0.4, true),
  moonrock: obstacle('moonrock', 76, 56, '🪨', 0.32)
};
