export type RunState =
  | 'running'
  | 'recovering'
  | 'fallen'
  | 'rescue'
  | 'gameover';

export type BalanceState =
  | 'stable'
  | 'unstable'
  | 'critical'
  | 'fallen';

export interface RunSnapshot {
  distance: number;
  coins: number;
  nearMisses: number;
  bestDistance: number;
}
