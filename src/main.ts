import Phaser from 'phaser';
import './styles.css';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#211934',
  width: 1080,
  height: 1920,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1080,
    height: 1920
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 2300 },
      debug: false
    }
  },
  render: {
    antialias: true,
    roundPixels: false
  },
  scene: [BootScene, MenuScene, GameScene]
});

window.addEventListener('resize', () => {
  game.scale.refresh();
});
