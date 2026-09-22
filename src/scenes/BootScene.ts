import Phaser from 'phaser';
import { COLORS } from '../game/theme';
import { OBSTACLES, OUTFITS } from '../game/content';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    for (const outfit of OUTFITS) {
      this.createGrannyTexture(
        'granny-' + outfit.id,
        outfit.color,
        outfit.hair
      );
    }

    this.createCoinTexture();
    this.createCandyTexture();
    this.createVehicleTextures();
    this.createObstacleTextures();
    this.scene.start('menu');
  }

  private createGrannyTexture(
    key: string,
    coatColor: number,
    hairColor: number
  ): void {
    const g = this.add.graphics();

    g.fillStyle(0x30263f, 0.18);
    g.fillEllipse(90, 211, 92, 18);

    g.lineStyle(12, COLORS.plum);
    g.lineBetween(64, 167, 56, 205);
    g.lineBetween(116, 167, 124, 205);

    g.fillStyle(coatColor);
    g.fillRoundedRect(37, 94, 106, 100, 34);
    g.fillRoundedRect(45, 96, 90, 72, 28);

    g.lineStyle(13, 0xf1c8aa);
    g.lineBetween(44, 119, 19, 157);
    g.lineBetween(136, 119, 159, 153);

    g.lineStyle(8, 0x8c6749);
    g.lineBetween(158, 151, 158, 205);

    g.fillStyle(0xf1c8aa);
    g.fillCircle(90, 69, 48);

    g.fillStyle(hairColor);
    g.fillEllipse(88, 35, 88, 39);
    g.fillCircle(48, 63, 18);
    g.fillCircle(132, 61, 18);
    g.fillCircle(137, 38, 18);

    g.fillStyle(0xe2f3ef);
    g.fillRoundedRect(55, 62, 33, 21, 7);
    g.fillRoundedRect(94, 62, 33, 21, 7);
    g.lineStyle(6, COLORS.plum);
    g.strokeRoundedRect(55, 62, 33, 21, 7);
    g.strokeRoundedRect(94, 62, 33, 21, 7);
    g.lineBetween(88, 72, 94, 72);

    g.fillStyle(COLORS.plum);
    g.fillCircle(72, 72, 5);
    g.fillCircle(111, 72, 5);

    g.lineStyle(4, 0xad6d75);
    g.beginPath();
    g.arc(91, 93, 17, 0.2, Math.PI - 0.2);
    g.strokePath();

    g.fillStyle(COLORS.mustard);
    g.fillRoundedRect(35, 199, 55, 16, 8);
    g.fillRoundedRect(104, 199, 55, 16, 8);

    g.generateTexture(key, 180, 220);
    g.destroy();
  }

  private createCoinTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(0xf8ad2c);
    g.fillCircle(36, 36, 31);
    g.fillStyle(0xffe17a);
    g.fillCircle(36, 36, 24);
    g.lineStyle(5, 0xa76b1c);
    g.strokeCircle(36, 36, 24);
    g.generateTexture('coin', 72, 72);
    g.destroy();
  }

  private createCandyTexture(): void {
    const text = this.add.text(0, 0, '🍬', {
      fontFamily: 'Arial',
      fontSize: '62px'
    });
    text.setOrigin(0.5);

    const rt = this.add.renderTexture(0, 0, 82, 82);
    rt.draw(text, 41, 41);
    rt.saveTexture('candy');
    text.destroy();
    rt.destroy();
  }

  private createVehicleTextures(): void {
    const plane = this.add.graphics();
    plane.fillStyle(0xd8e9f0);
    plane.fillRoundedRect(8, 38, 170, 34, 16);
    plane.fillStyle(0x6ea4c6);
    plane.fillRoundedRect(70, 9, 61, 34, 10);
    plane.fillStyle(0xe49b60);
    plane.fillRoundedRect(35, 65, 116, 16, 7);
    plane.fillStyle(0xf6cb69);
    plane.fillCircle(20, 55, 16);
    plane.generateTexture('vehicle-plane', 188, 92);
    plane.destroy();

    const booster = this.add.graphics();
    booster.fillStyle(0x6655a5);
    booster.fillRoundedRect(7, 18, 146, 54, 18);
    booster.fillStyle(0xa2bce1);
    booster.fillRoundedRect(29, 28, 105, 22, 9);
    booster.fillStyle(0x33364e);
    booster.fillCircle(24, 69, 17);
    booster.fillCircle(137, 69, 17);
    booster.fillStyle(0xf6b353);
    booster.fillTriangle(5, 28, -25, 38, 5, 48);
    booster.fillTriangle(-8, 35, -42, 46, -8, 55);
    booster.generateTexture('vehicle-booster', 180, 90);
    booster.destroy();
  }

  private createObstacleTextures(): void {
    for (const definition of Object.values(OBSTACLES)) {
      const width = Math.max(80, definition.width + 24);
      const height = Math.max(80, definition.height + 24);

      const rt = this.add.renderTexture(0, 0, width, height);
      const shadow = this.add.ellipse(
        width / 2,
        height - 8,
        Math.max(46, definition.width * 0.8),
        11,
        0x30263f,
        0.18
      );

      const emoji = this.add.text(
        width / 2,
        height / 2 - 3,
        definition.emoji ?? '⚠️',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(72, definition.height + 10) + 'px'
        }
      ).setOrigin(0.5);

      rt.draw(shadow);
      rt.draw(emoji);
      rt.saveTexture('obstacle-' + definition.id);

      shadow.destroy();
      emoji.destroy();
      rt.destroy();
    }
  }
}
