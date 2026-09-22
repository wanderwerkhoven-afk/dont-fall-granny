import Phaser from 'phaser';
import { COLORS } from '../game/theme';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.createGrannyTexture();
    this.createCoinTexture();
    this.createObstacleTextures();
    this.scene.start('menu');
  }

  private createGrannyTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.dustyPink);
    g.fillRoundedRect(38, 92, 104, 112, 38);
    g.fillStyle(COLORS.cream);
    g.fillCircle(90, 72, 47);
    g.fillStyle(0xf4f0e8);
    g.fillCircle(56, 43, 24);
    g.fillCircle(82, 31, 26);
    g.fillCircle(112, 38, 25);
    g.fillCircle(132, 57, 20);
    g.lineStyle(9, COLORS.plum, 1);
    g.strokeCircle(70, 75, 22);
    g.strokeCircle(112, 75, 22);
    g.lineBetween(90, 75, 94, 75);
    g.fillStyle(COLORS.plum);
    g.fillCircle(70, 76, 5);
    g.fillCircle(112, 76, 5);
    g.lineStyle(5, COLORS.plum);
    g.beginPath();
    g.arc(91, 93, 17, 0.25, Math.PI - 0.25);
    g.strokePath();
    g.fillStyle(COLORS.mustard);
    g.fillRoundedRect(25, 188, 54, 20, 10);
    g.fillRoundedRect(101, 188, 54, 20, 10);
    g.generateTexture('granny', 180, 220);
    g.destroy();
  }

  private createCoinTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.mustard);
    g.fillCircle(36, 36, 31);
    g.lineStyle(7, 0xffe3a3, 1);
    g.strokeCircle(36, 36, 25);
    g.fillStyle(COLORS.plum);
    g.fillCircle(36, 36, 8);
    g.generateTexture('coin', 72, 72);
    g.destroy();
  }

  private createObstacleTextures(): void {
    const trip = this.add.graphics();
    trip.fillStyle(COLORS.mustard);
    trip.fillRoundedRect(0, 4, 150, 32, 12);
    trip.lineStyle(6, COLORS.plum);
    trip.lineBetween(15, 8, 33, 31);
    trip.lineBetween(65, 8, 83, 31);
    trip.lineBetween(115, 8, 133, 31);
    trip.generateTexture('hazard-trip', 150, 40);
    trip.destroy();

    const heavy = this.add.graphics();
    heavy.fillStyle(COLORS.dustyPink);
    heavy.fillRoundedRect(6, 8, 104, 150, 20);
    heavy.fillStyle(COLORS.plum);
    heavy.fillRect(18, 22, 80, 18);
    heavy.fillRect(18, 58, 80, 18);
    heavy.fillRect(18, 94, 80, 18);
    heavy.generateTexture('hazard-heavy', 116, 166);
    heavy.destroy();

    const moving = this.add.graphics();
    moving.fillStyle(COLORS.mint);
    moving.fillRoundedRect(8, 0, 82, 126, 28);
    moving.fillStyle(COLORS.cream);
    moving.fillCircle(49, 35, 16);
    moving.fillCircle(49, 91, 16);
    moving.lineStyle(7, COLORS.plum);
    moving.strokeCircle(49, 35, 16);
    moving.strokeCircle(49, 91, 16);
    moving.generateTexture('hazard-moving', 98, 126);
    moving.destroy();
  }
}
