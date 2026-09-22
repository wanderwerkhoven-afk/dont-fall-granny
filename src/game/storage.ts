export interface Preferences {
  reducedMotion: boolean;
}

const KEY = 'dfg.preferences';

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { reducedMotion: false };
    return { reducedMotion: Boolean(JSON.parse(raw).reducedMotion) };
  } catch {
    return { reducedMotion: false };
  }
}

export function savePreferences(preferences: Preferences): void {
  localStorage.setItem(KEY, JSON.stringify(preferences));
}
