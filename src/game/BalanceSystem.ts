import Phaser from 'phaser';
import type { BalanceState } from './types';

export class BalanceSystem extends Phaser.Events.EventEmitter {
  value = 1;
  state: BalanceState = 'stable';

  private readonly unstableThreshold = 0.55;
  private readonly criticalThreshold = 0.22;

  update(deltaSeconds: number, recovering: boolean): void {
    if (this.state === 'fallen') return;

    const recoveryMultiplier =
      this.state === 'critical'
        ? 0.25
        : this.state === 'unstable'
          ? 0.6
          : 1;

    const statePenalty = recovering ? 0.35 : 1;
    this.add(0.115 * recoveryMultiplier * statePenalty * deltaSeconds);
  }

  impact(amount: number): void {
    if (this.state === 'fallen') return;
    this.add(-Math.max(0, amount));
  }

  recover(amount: number): void {
    if (this.state === 'fallen') return;
    this.add(Math.abs(amount));
  }

  reset(): void {
    this.value = 1;
    this.setState('stable');
    this.emit('change', this.value);
  }

  private add(delta: number): void {
    const previous = this.value;
    this.value = Phaser.Math.Clamp(this.value + delta, 0, 1);

    if (Math.abs(previous - this.value) > 0.0001) {
      this.emit('change', this.value);
    }

    this.evaluate();
  }

  private evaluate(): void {
    const next: BalanceState =
      this.value <= 0
        ? 'fallen'
        : this.value <= this.criticalThreshold
          ? 'critical'
          : this.value <= this.unstableThreshold
            ? 'unstable'
            : 'stable';

    this.setState(next);

    if (next === 'fallen') {
      this.emit('fallen');
    }
  }

  private setState(next: BalanceState): void {
    if (this.state === next) return;
    const previous = this.state;
    this.state = next;
    this.emit('state', previous, next);
  }
}
