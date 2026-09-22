import Phaser from 'phaser';
import type { RunSnapshot } from './types';

export class RunData extends Phaser.Events.EventEmitter {
  distance = 0;
  coins = 0;
  nearMisses = 0;
  bestDistance = Number(localStorage.getItem('dfg.bestDistance') ?? 0);

  addDistance(amount: number): void {
    if (amount <= 0) return;
    this.distance += amount;

    if (this.distance > this.bestDistance) {
      this.bestDistance = this.distance;
      localStorage.setItem('dfg.bestDistance', String(this.bestDistance));
    }

    this.emit('distance', this.distance);
  }

  addCoin(amount = 1): void {
    if (amount <= 0) return;
    this.coins += amount;
    this.emit('coins', this.coins);
  }

  addNearMiss(): void {
    this.nearMisses += 1;
    this.emit('nearMiss', this.nearMisses);
  }

  reset(): void {
    this.distance = 0;
    this.coins = 0;
    this.nearMisses = 0;
    this.emit('distance', 0);
    this.emit('coins', 0);
    this.emit('nearMiss', 0);
    this.emit('reset');
  }

  snapshot(): RunSnapshot {
    return {
      distance: this.distance,
      coins: this.coins,
      nearMisses: this.nearMisses,
      bestDistance: this.bestDistance
    };
  }
}
