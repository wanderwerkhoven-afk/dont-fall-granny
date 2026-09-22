import Phaser from 'phaser';
import { BalanceSystem } from '../game/BalanceSystem';
import { RunData } from '../game/RunData';
import { COLORS, CSS } from '../game/theme';
import type { RunState } from '../game/types';

interface Hazard extends Phaser.Physics.Arcade.Sprite {
  hitRegistered?: boolean;
  countedNearMiss?: boolean;
  movingBaseY?: number;
  movingPhase?: number;
  moving?: boolean;
}

interface GameSceneData {
  reducedMotion?: boolean;
}

export class GameScene extends Phaser.Scene {
  private state: RunState = 'running';
  private reducedMotion = false;

  private granny!: Phaser.Physics.Arcade.Sprite;
  private hazards!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;

  private balance = new BalanceSystem();
  private runData = new RunData();

  private worldSpeed = 510;
  private nextHazardAt = 0;
  private nextCoinAt = 0;

  private distanceText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private balanceText!: Phaser.GameObjects.Text;
  private balanceFill!: Phaser.GameObjects.Rectangle;
  private nearMissText!: Phaser.GameObjects.Text;

  private jumpButton!: Phaser.GameObjects.Container;
  private recoverButton!: Phaser.GameObjects.Container;
  private recoveryText!: Phaser.GameObjects.Text;

  private recoveryDeadline = 0;
  private rescueDeadline = 0;
  private rescueLayer?: Phaser.GameObjects.Container;
  private gameOverLayer?: Phaser.GameObjects.Container;

  private readonly groundY = 1565;

  constructor() {
    super('game');
  }

  init(data: GameSceneData): void {
    this.reducedMotion = Boolean(data.reducedMotion);
  }

  create(): void {
    this.state = 'running';
    this.worldSpeed = 510;
    this.nextHazardAt = this.time.now + 1500;
    this.nextCoinAt = this.time.now + 650;
    this.balance = new BalanceSystem();
    this.runData = new RunData();
    this.runData.reset();

    this.cameras.main.setBackgroundColor(COLORS.sky);
    this.createEnvironment();
    this.createGranny();
    this.createGroups();
    this.createHUD();
    this.createControls();
    this.bindSystems();

    this.physics.add.collider(this.granny, this.hazards, (_granny, raw) => {
      this.hitHazard(raw as Hazard);
    });

    this.physics.add.overlap(this.granny, this.coins, (_granny, raw) => {
      this.collectCoin(raw as Phaser.Physics.Arcade.Sprite);
    });

    this.input.keyboard?.on('keydown-SPACE', () => this.tryJump());
    this.input.keyboard?.on('keydown-UP', () => this.tryJump());
    this.input.keyboard?.on('keydown-E', () => this.tryRecover());

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.state === 'running' && pointer.y < 1380) {
        this.tryJump();
      }
    });
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000;

    if (this.state === 'running' || this.state === 'recovering') {
      const multiplier = this.state === 'recovering' ? 0.48 : 1;
      const speed = this.worldSpeed * multiplier;

      this.runData.addDistance(speed * dt * 0.0095);
      this.balance.update(dt, this.state === 'recovering');

      this.updateHazards(speed, dt);
      this.updateCoins(speed, dt);

      if (time >= this.nextHazardAt) {
        this.spawnHazard();
        this.nextHazardAt = time + Phaser.Math.Between(1150, 1850);
      }

      if (time >= this.nextCoinAt) {
        this.spawnCoinLine();
        this.nextCoinAt = time + Phaser.Math.Between(1900, 3000);
      }
    }

    if (this.state === 'recovering') {
      const remaining = Math.max(0, this.recoveryDeadline - time);
      this.recoveryText.setText(
        'HERSTEL! ' + (remaining / 1000).toFixed(1) + 's'
      );

      if (remaining <= 0) {
        this.failRecovery();
      }
    }

    if (this.state === 'rescue') {
      this.updateRescueCountdown(time);
    }
  }

  private createEnvironment(): void {
    const g = this.add.graphics();

    g.fillStyle(0xb9dce9);
    g.fillRect(0, 0, 1080, 1130);
    g.fillStyle(0x6f946a);
    g.fillRect(0, 1130, 1080, 530);
    g.fillStyle(COLORS.asphalt);
    g.fillRect(0, 1390, 1080, 330);
    g.fillStyle(0xd9d2c5);
    g.fillRect(0, 1360, 1080, 45);

    for (let i = 0; i < 5; i++) {
      const x = 70 + i * 235;
      const y = 870 + (i % 2) * 50;
      const houseColor = i % 2 === 0 ? COLORS.cream : 0xf2c7cb;

      g.fillStyle(houseColor);
      g.fillRoundedRect(x, y, 190, 285, 24);
      g.fillStyle(COLORS.plum);
      g.fillTriangle(x - 15, y + 30, x + 95, y - 80, x + 205, y + 30);
      g.fillStyle(0x91c4d3);
      g.fillRect(x + 32, y + 95, 52, 65);
      g.fillRect(x + 108, y + 95, 52, 65);
    }

    for (let i = 0; i < 10; i++) {
      g.fillStyle(0xf3e6c9, 0.5);
      g.fillRoundedRect(i * 150 - 60, 1532, 88, 12, 6);
    }

    this.add.text(38, 46, 'DON’T FALL GRANNY', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: CSS.plum
    }).setDepth(20);
  }

  private createGranny(): void {
    this.granny = this.physics.add
      .sprite(230, this.groundY - 110, 'granny')
      .setScale(0.9)
      .setDepth(10)
      .setCollideWorldBounds(true);

    const body = this.granny.body as Phaser.Physics.Arcade.Body;
    body.setSize(92, 178);
    body.setOffset(44, 32);

    const ground = this.add.rectangle(
      540,
      this.groundY + 86,
      1080,
      190,
      0x000000,
      0
    );

    this.physics.add.existing(ground, true);
    this.physics.add.collider(this.granny, ground);
  }

  private createGroups(): void {
    this.hazards = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    this.coins = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
  }

  private createHUD(): void {
    this.distanceText = this.add.text(45, 105, '0 m', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '46px',
      color: CSS.white
    }).setDepth(30);

    this.coinText = this.add.text(1015, 105, '● 0', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '42px',
      color: CSS.mustard
    }).setOrigin(1, 0).setDepth(30);

    this.balanceText = this.add.text(540, 116, 'STABLE', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '25px',
      color: CSS.cream
    }).setOrigin(0.5, 0).setDepth(30);

    this.add.rectangle(540, 173, 470, 22, COLORS.plum, 0.68).setDepth(30);

    this.balanceFill = this.add
      .rectangle(307, 173, 466, 16, COLORS.mustard, 1)
      .setOrigin(0, 0.5)
      .setDepth(31);

    this.nearMissText = this.add.text(540, 255, 'NEAR MISS!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '42px',
      color: CSS.mustard,
      stroke: CSS.plum,
      strokeThickness: 8
    }).setOrigin(0.5).setAlpha(0).setDepth(35);
  }

  private createControls(): void {
    this.jumpButton = this.createRoundButton(
      875,
      1690,
      126,
      'JUMP',
      COLORS.mustard,
      () => this.tryJump()
    );

    this.recoverButton = this.createWideButton(
      540,
      1665,
      560,
      125,
      'RED GRANNY!',
      COLORS.dustyPink,
      () => this.tryRecover()
    );

    this.recoverButton.setVisible(false);

    this.recoveryText = this.add.text(540, 1510, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '44px',
      color: CSS.white,
      stroke: CSS.plum,
      strokeThickness: 8
    }).setOrigin(0.5).setDepth(50).setVisible(false);
  }

  private bindSystems(): void {
    this.runData.on('distance', (distance: number) => {
      this.distanceText.setText(Math.floor(distance) + ' m');
    });

    this.runData.on('coins', (coins: number) => {
      this.coinText.setText('● ' + coins);

      if (!this.reducedMotion && coins > 0) {
        this.tweens.add({
          targets: this.coinText,
          scale: 1.22,
          duration: 90,
          yoyo: true
        });
      }
    });

    this.runData.on('nearMiss', () => {
      this.showNearMissFeedback();
    });

    this.balance.on('change', (value: number) => {
      this.balanceFill.width = 466 * value;
    });

    this.balance.on('state', (_previous: string, current: string) => {
      this.balanceText.setText(current.toUpperCase());

      const color =
        current === 'critical'
          ? CSS.danger
          : current === 'unstable'
            ? CSS.dustyPink
            : CSS.cream;

      this.balanceText.setColor(color);
    });

    this.balance.on('fallen', () => {
      this.beginFall();
    });
  }

  private tryJump(): void {
    if (this.state !== 'running') return;

    const body = this.granny.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down) return;

    this.granny.setVelocityY(-890);

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: this.granny,
        angle: -7,
        duration: 150,
        yoyo: true
      });
    }
  }

  private hitHazard(hazard: Hazard): void {
    if (
      (this.state !== 'running' && this.state !== 'recovering') ||
      hazard.hitRegistered
    ) {
      return;
    }

    hazard.hitRegistered = true;

    const kind = String(hazard.getData('kind'));
    const damage =
      kind === 'heavy' ? 0.56 : kind === 'trip' ? 0.2 : 0.32;

    this.balance.impact(damage);

    if (this.balance.state !== 'fallen') {
      this.beginRecovery(kind === 'heavy' ? 780 : 1120);
    }

    if (!this.reducedMotion) {
      this.cameras.main.shake(100, 0.006);
    }
  }

  private beginRecovery(durationMs: number): void {
    if (this.state === 'recovering') return;

    this.state = 'recovering';
    this.recoveryDeadline = this.time.now + durationMs;
    this.recoverButton.setVisible(true);
    this.recoveryText.setVisible(true);
    this.jumpButton.setVisible(false);

    if (!this.reducedMotion) {
      this.cameras.main.setZoom(1.025);
    }
  }

  private tryRecover(): void {
    if (this.state !== 'recovering') return;

    this.balance.recover(0.28);
    this.state = 'running';
    this.recoverButton.setVisible(false);
    this.recoveryText.setVisible(false);
    this.jumpButton.setVisible(true);
    this.cameras.main.setZoom(1);

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: this.granny,
        scaleX: 1.02,
        scaleY: 0.82,
        duration: 90,
        yoyo: true
      });
    }
  }

  private failRecovery(): void {
    if (this.state !== 'recovering') return;
    this.balance.impact(1);
  }

  private beginFall(): void {
    if (this.state === 'fallen' || this.state === 'rescue') return;

    this.state = 'fallen';
    this.recoverButton.setVisible(false);
    this.recoveryText.setVisible(false);
    this.jumpButton.setVisible(false);
    this.granny.setVelocity(0, -180);

    this.tweens.add({
      targets: this.granny,
      angle: 82,
      duration: this.reducedMotion ? 0 : 280,
      ease: 'Back.out'
    });

    this.time.delayedCall(this.reducedMotion ? 0 : 330, () => {
      this.openRescue();
    });
  }

  private openRescue(): void {
    this.state = 'rescue';
    this.rescueDeadline = this.time.now + 10000;

    const shade = this.add.rectangle(
      540, 960, 1080, 1920, COLORS.deepPlum, 0.62
    );

    const card = this.add.rectangle(
      540, 1030, 890, 670, COLORS.cream, 1
    ).setStrokeStyle(12, COLORS.danger);

    const title = this.add.text(540, 805, 'OEI, GRANNY STRUIKELT!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '50px',
      color: CSS.plum,
      align: 'center'
    }).setOrigin(0.5);

    const status = this.add.text(
      540,
      925,
      'Je hebt 10 seconden om haar weer op weg te helpen.',
      {
        fontFamily: 'Arial',
        fontSize: '30px',
        color: CSS.plum,
        align: 'center',
        wordWrap: { width: 720 }
      }
    ).setOrigin(0.5);

    const countdown = this.add.text(540, 1055, '10.0', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '78px',
      color: CSS.danger
    }).setOrigin(0.5).setName('rescue-countdown');

    const rescueButton = this.createWideButton(
      540, 1225, 650, 120, 'HELP GRANNY OP', COLORS.mustard,
      () => this.rescueGranny()
    );

    const endButton = this.createWideButton(
      540, 1375, 480, 88, 'STOP DE RUN', COLORS.plum,
      () => this.finishRun()
    );

    const endText = endButton.getAt(1) as Phaser.GameObjects.Text;
    endText.setColor(CSS.cream);

    this.rescueLayer = this.add.container(0, 0, [
      shade,
      card,
      title,
      status,
      countdown,
      rescueButton,
      endButton
    ]);

    this.rescueLayer.setDepth(100);
  }

  private updateRescueCountdown(time: number): void {
    if (!this.rescueLayer) return;

    const remaining = Math.max(0, this.rescueDeadline - time);
    const countdown = this.rescueLayer.getByName(
      'rescue-countdown'
    ) as Phaser.GameObjects.Text | null;

    if (countdown) {
      countdown.setText((remaining / 1000).toFixed(1));
    }

    if (remaining <= 0) {
      this.finishRun();
    }
  }

  private rescueGranny(): void {
    if (this.state !== 'rescue') return;

    this.rescueLayer?.destroy(true);
    this.rescueLayer = undefined;

    this.balance.reset();
    this.state = 'running';
    this.granny.setAngle(0);
    this.granny.setVelocity(0, 0);
    this.granny.setY(this.groundY - 110);
    this.jumpButton.setVisible(true);
    this.cameras.main.setZoom(1);
  }

  private finishRun(): void {
    if (this.state === 'gameover') return;

    this.state = 'gameover';
    this.rescueLayer?.destroy(true);
    this.rescueLayer = undefined;

    const snapshot = this.runData.snapshot();

    const shade = this.add.rectangle(
      540, 960, 1080, 1920, COLORS.deepPlum, 0.9
    );

    const title = this.add.text(540, 515, 'RUN VOORBIJ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '78px',
      color: CSS.cream
    }).setOrigin(0.5);

    const score = this.add.text(
      540,
      750,
      Math.floor(snapshot.distance) + ' m',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '126px',
        color: CSS.mustard
      }
    ).setOrigin(0.5);

    const details = this.add.text(
      540,
      965,
      '● ' + snapshot.coins + ' coins\n' +
      snapshot.nearMisses + ' near misses\n' +
      'Beste afstand: ' + Math.floor(snapshot.bestDistance) + ' m',
      {
        fontFamily: 'Arial',
        fontSize: '38px',
        align: 'center',
        color: CSS.cream,
        lineSpacing: 16
      }
    ).setOrigin(0.5);

    const replay = this.createWideButton(
      540, 1265, 700, 130, 'OPNIEUW', COLORS.mustard,
      () => this.scene.restart({ reducedMotion: this.reducedMotion })
    );

    const home = this.createWideButton(
      540, 1435, 520, 95, 'NAAR HOME', COLORS.cream,
      () => this.scene.start('menu')
    );

    this.gameOverLayer = this.add.container(0, 0, [
      shade,
      title,
      score,
      details,
      replay,
      home
    ]);

    this.gameOverLayer.setDepth(200);
  }

  private spawnHazard(): void {
    const roll = Phaser.Math.Between(0, 99);
    const kind = roll < 44 ? 'trip' : roll < 76 ? 'heavy' : 'moving';
    const texture = 'hazard-' + kind;

    const y =
      kind === 'trip'
        ? this.groundY - 15
        : kind === 'heavy'
          ? this.groundY - 83
          : this.groundY - 63;

    const hazard = this.hazards.create(1180, y, texture) as Hazard;
    hazard.setData('kind', kind);
    hazard.setDepth(8);
    hazard.setImmovable(true);

    if (kind === 'moving') {
      hazard.moving = true;
      hazard.movingBaseY = y;
      hazard.movingPhase = Phaser.Math.FloatBetween(0, Math.PI * 2);
    }
  }

  private updateHazards(speed: number, dt: number): void {
    this.hazards.children.each((child) => {
      const hazard = child as Hazard;
      hazard.x -= speed * dt;

      if (hazard.moving && hazard.movingBaseY !== undefined) {
        hazard.movingPhase = (hazard.movingPhase ?? 0) + dt * 3.4;
        hazard.y =
          hazard.movingBaseY +
          Math.sin(hazard.movingPhase) * 95;
      }

      if (
        !hazard.countedNearMiss &&
        !hazard.hitRegistered &&
        hazard.x < this.granny.x - 85
      ) {
        hazard.countedNearMiss = true;
        this.runData.addNearMiss();
      }

      if (hazard.x < -180) {
        hazard.destroy();
      }

      return true;
    });
  }

  private spawnCoinLine(): void {
    const count = Phaser.Math.Between(3, 5);
    const arc = Phaser.Math.Between(0, 1) === 1;

    for (let i = 0; i < count; i++) {
      const x = 1150 + i * 105;
      const y = arc
        ? this.groundY - 220 -
          Math.sin((i / Math.max(1, count - 1)) * Math.PI) * 160
        : this.groundY - 175;

      const coin = this.coins.create(
        x,
        y,
        'coin'
      ) as Phaser.Physics.Arcade.Sprite;

      coin.setScale(0.82);
      coin.setDepth(7);
      coin.setData('phase', Phaser.Math.FloatBetween(0, Math.PI * 2));
      coin.setData('baseY', y);
    }
  }

  private updateCoins(speed: number, dt: number): void {
    this.coins.children.each((child) => {
      const coin = child as Phaser.Physics.Arcade.Sprite;
      coin.x -= speed * dt;

      if (!this.reducedMotion) {
        const phase = Number(coin.getData('phase') ?? 0) + dt * 4;
        coin.setData('phase', phase);
        coin.y = Number(coin.getData('baseY')) + Math.sin(phase) * 12;
        coin.angle += dt * 140;
      }

      if (coin.x < -100) {
        coin.destroy();
      }

      return true;
    });
  }

  private collectCoin(coin: Phaser.Physics.Arcade.Sprite): void {
    this.runData.addCoin(1);
    coin.destroy();
  }

  private showNearMissFeedback(): void {
    this.nearMissText.setAlpha(1).setScale(0.82);

    if (this.reducedMotion) {
      this.time.delayedCall(650, () => this.nearMissText.setAlpha(0));
      return;
    }

    this.tweens.add({
      targets: this.nearMissText,
      alpha: 0,
      scale: 1.14,
      y: this.nearMissText.y - 35,
      duration: 720,
      ease: 'Cubic.out',
      onComplete: () => {
        this.nearMissText.setY(255);
      }
    });
  }

  private createRoundButton(
    x: number,
    y: number,
    radius: number,
    label: string,
    color: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const bg = this.add.circle(0, 0, radius, color)
      .setStrokeStyle(8, COLORS.plum);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: CSS.plum
    }).setOrigin(0.5);

    const zone = this.add.zone(
      0, 0, radius * 2.25, radius * 2.25
    ).setInteractive();

    const container = this.add.container(
      x, y, [bg, text, zone]
    ).setDepth(60);

    zone.on('pointerup', callback);
    return container;
  }

  private createWideButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const bg = this.add.rectangle(
      0, 0, width, height, color
    ).setStrokeStyle(7, COLORS.plum);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: Math.min(42, height * 0.34) + 'px',
      color: CSS.plum
    }).setOrigin(0.5);

    const zone = this.add.zone(0, 0, width, height).setInteractive();

    const container = this.add.container(
      x, y, [bg, text, zone]
    ).setDepth(120);

    zone.on('pointerup', callback);
    return container;
  }
}
