import Phaser from 'phaser';
import { COLORS, CSS } from '../game/theme';
import { loadPreferences, savePreferences } from '../game/storage';

export class MenuScene extends Phaser.Scene {
  private preferences = loadPreferences();

  constructor() {
    super('menu');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.deepPlum);
    this.drawBackdrop();

    this.add.text(540, 260, 'DON’T FALL\nGRANNY', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '108px',
      fontStyle: 'bold',
      color: CSS.cream,
      align: 'center',
      stroke: CSS.plum,
      strokeThickness: 10
    }).setOrigin(0.5);

    this.add.text(540, 475, 'Stay upright. Survive the chaos.', {
      fontFamily: 'Arial',
      fontSize: '38px',
      color: CSS.mustard
    }).setOrigin(0.5);

    const granny = this.add.image(540, 825, 'granny').setScale(2.25);

    if (!this.preferences.reducedMotion) {
      this.tweens.add({
        targets: granny,
        y: granny.y - 18,
        duration: 1450,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }

    this.createButton(
      540, 1285, 760, 150, 'PLAY', COLORS.mustard,
      () => this.scene.start('game', {
        reducedMotion: this.preferences.reducedMotion
      })
    );

    this.createButton(
      540, 1475, 620, 104, 'OUTFIT & GADGET', COLORS.cream,
      () => this.showLoadoutMessage()
    );

    const reduced = this.add.text(
      540,
      1655,
      'Reduced motion: ' + (this.preferences.reducedMotion ? 'AAN' : 'UIT'),
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: CSS.cream,
        backgroundColor: CSS.plum,
        padding: { x: 28, y: 18 }
      }
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });

    reduced.on('pointerup', () => {
      this.preferences.reducedMotion = !this.preferences.reducedMotion;
      savePreferences(this.preferences);
      reduced.setText(
        'Reduced motion: ' +
        (this.preferences.reducedMotion ? 'AAN' : 'UIT')
      );
    });

    this.add.text(540, 1810, 'Browser prototype • Phaser + TypeScript', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#b9aec8'
    }).setOrigin(0.5);
  }

  private drawBackdrop(): void {
    const g = this.add.graphics();
    g.fillStyle(0x2b2140);
    g.fillCircle(120, 260, 260);
    g.fillStyle(0x3b2d55);
    g.fillCircle(980, 540, 340);
    g.fillStyle(0x47355d);
    g.fillRoundedRect(90, 590, 900, 520, 90);
    g.fillStyle(COLORS.dustyPink, 0.15);
    g.fillCircle(865, 1200, 260);
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    callback: () => void
  ): void {
    const bg = this.add.rectangle(x, y, width, height, color, 1)
      .setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(7, COLORS.plum, 0.65);

    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: height > 120 ? '48px' : '32px',
      color: CSS.plum
    }).setOrigin(0.5);

    bg.on('pointerup', () => {
      if (this.preferences.reducedMotion) {
        callback();
        return;
      }

      this.tweens.add({
        targets: [bg, text],
        scaleX: 0.96,
        scaleY: 0.96,
        duration: 80,
        yoyo: true,
        onComplete: callback
      });
    });
  }

  private showLoadoutMessage(): void {
    const panel = this.add.rectangle(
      540, 1170, 820, 410, COLORS.cream, 0.98
    ).setStrokeStyle(8, COLORS.plum);

    const title = this.add.text(540, 1050, 'LOADOUT', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '54px',
      color: CSS.plum
    }).setOrigin(0.5);

    const body = this.add.text(
      540,
      1195,
      'De loadout blijft bewust klein tijdens de pivot.\n' +
      'Eerst maken we de core run echt goed.\n\n' +
      'Outfits en gadgets komen daarna.',
      {
        fontFamily: 'Arial',
        fontSize: '31px',
        align: 'center',
        color: CSS.plum,
        wordWrap: { width: 700 }
      }
    ).setOrigin(0.5);

    const close = this.add.text(540, 1320, 'SLUITEN', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '30px',
      color: CSS.cream,
      backgroundColor: CSS.plum,
      padding: { x: 34, y: 18 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    close.on('pointerup', () => {
      panel.destroy();
      title.destroy();
      body.destroy();
      close.destroy();
    });
  }
}
