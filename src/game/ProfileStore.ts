import { GADGETS, OUTFITS } from './content';

export interface PlayerProfile {
  coins: number;
  ownedOutfits: string[];
  selectedOutfit: string;
  ownedGadgets: string[];
}

const KEY = 'dfg.profile';

const DEFAULT_PROFILE: PlayerProfile = {
  coins: 0,
  ownedOutfits: ['classic'],
  selectedOutfit: 'classic',
  ownedGadgets: []
};

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE, ownedOutfits: ['classic'], ownedGadgets: [] };
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    return {
      coins: Number(parsed.coins ?? 0),
      ownedOutfits: Array.isArray(parsed.ownedOutfits)
        ? parsed.ownedOutfits
        : ['classic'],
      selectedOutfit: String(parsed.selectedOutfit ?? 'classic'),
      ownedGadgets: Array.isArray(parsed.ownedGadgets)
        ? parsed.ownedGadgets
        : []
    };
  } catch {
    return { ...DEFAULT_PROFILE, ownedOutfits: ['classic'], ownedGadgets: [] };
  }
}

export function saveProfile(profile: PlayerProfile): void {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function spendOnOutfit(profile: PlayerProfile, outfitId: string): boolean {
  const outfit = OUTFITS.find((item) => item.id === outfitId);
  if (!outfit) return false;

  if (!profile.ownedOutfits.includes(outfit.id)) {
    if (profile.coins < outfit.cost) return false;
    profile.coins -= outfit.cost;
    profile.ownedOutfits.push(outfit.id);
  }

  profile.selectedOutfit = outfit.id;
  saveProfile(profile);
  return true;
}

export function spendOnGadget(profile: PlayerProfile, gadgetId: string): boolean {
  const gadget = GADGETS.find((item) => item.id === gadgetId);
  if (!gadget) return false;
  if (profile.ownedGadgets.includes(gadget.id)) return true;
  if (profile.coins < gadget.cost) return false;

  profile.coins -= gadget.cost;
  profile.ownedGadgets.push(gadget.id);
  saveProfile(profile);
  return true;
}

export function addWalletCoins(profile: PlayerProfile, amount: number): void {
  profile.coins += Math.max(0, amount);
  saveProfile(profile);
}
