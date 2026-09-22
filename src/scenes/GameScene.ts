import Phaser from 'phaser';
import { BalanceSystem } from '../game/BalanceSystem';
import { RunData } from '../game/RunData';
import {
  GADGETS,
  OBSTACLES,
  OUTFITS,
  TIERS,
  type ObstacleDefinition
} from '../game/content';
import {
  addWalletCoins,
  loadProfile,
  saveProfile,
  type PlayerProfile
} from '../game/ProfileStore';
import { COLORS, CSS } from '../game/theme';
import type { RunState } from '../game/types';

type VehicleMode = 'plane' | 'booster' | null;

interface Hazard extends Phaser.Physics.Arcade.Sprite {
  definition?: ObstacleDefinition;
  hitRegistered?: boolean;
  countedNearMiss?: boolean;
  attacking?: boolean;
  charging?: boolean;
  chargeX?: number;
}

interface GameSceneData {
  reducedMotion?: boolean;
  selectedOutfit?: string;
  ownedGadgets?: string[];
}

export class GameScene extends Phaser.Scene {
  private state: RunState = 'running';
  private reducedMotion = false;
  private selectedOutfit = 'classic';
  private ownedGadgets: string[] = [];
  private profile: PlayerProfile = loadProfile();

  private granny!: Phaser.Physics.Arcade.Sprite;
  private vehicleSprite?: Phaser.GameObjects.Image;
  private hazards!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;
  private candies!: Phaser.Physics.Arcade.Group;

  private balance = new BalanceSystem();
  private runData = new RunData();

  private backgroundGraphics!: Phaser.GameObjects.Graphics;
  private worldSpeed = 450;
  private elapsedSeconds = 0;
  private travel = 0;
  private currentTier = 0;
  private tierLabel!: Phaser.GameObjects.Text;
  private tierFlash?: Phaser.GameObjects.Container;

  private nextHazardDistance = 520;
  private hazardTravel = 0;
  private nextCoinDistance = 420;
  private coinTravel = 0;
  private nextCandyDistance = 1200;
  private candyTravel = 0;

  private shield = false;
  private invulnerableSeconds = 0;
  private boostSeconds = 0;

  private vehicle: VehicleMode = null;
  private vehicleSeconds = 0;
  private vehicleCooldown = 25;
  private vehicleVelocity = 0;
  private vehicleLane = 1;

  private distanceText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private balanceText!: Phaser.GameObjects.Text;
  private balanceFill!: Phaser.GameObjects.Rectangle;
  private shieldText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private nearMissText!: Phaser.GameObjects.Text;

  private jumpButton!: Phaser.GameObjects.Container;
  private pauseButton!: Phaser.GameObjects.Container;
  private recoverButton!: Phaser.GameObjects.Container;
  private recoveryText!: Phaser.GameObjects.Text;

  private recoveryDeadline = 0;
  private rescueDeadline = 0;
  private rescueLayer?: Phaser.GameObjects.Container;
  private gameOverLayer?: Phaser.GameObjects.Container;
  private rescueTimerGraphics?: Phaser.GameObjects.Graphics;

  private readonly groundY = 1500;

  constructor() {
    super('game');
  }

  init(data: GameSceneData): void {
    this.reducedMotion = Boolean(data.reducedMotion);
    this.profile = loadProfile();
    this.selectedOutfit =
      data.selectedOutfit ??
      this.profile.selectedOutfit ??
      'classic';
    this.ownedGadgets =
      data.ownedGadgets ??
      this.profile.ownedGadgets ??
      [];
  }

  create(): void {
    this.resetRunState();

    this.backgroundGraphics = this.add.graphics().setDepth(-20);
    this.createGranny();
    this.createGroups();
    this.createHUD();
    this.createControls();
    this.bindSystems();

    this.physics.add.collider(
      this.granny,
      this.hazards,
      (_granny, raw) => this.hitHazard(raw as Hazard)
    );

    this.physics.add.overlap(
      this.granny,
      this.coins,
      (_granny, raw) =>
        this.collectCoin(raw as Phaser.Physics.Arcade.Sprite)
    );

    this.physics.add.overlap(
      this.granny,
      this.candies,
      (_granny, raw) =>
        this.collectCandy(raw as Phaser.Physics.Arcade.Sprite)
    );

    this.input.keyboard?.on('keydown-SPACE', () => this.primaryAction());
    this.input.keyboard?.on('keydown-UP', () => this.primaryAction());
    this.input.keyboard?.on('keydown-W', () => this.primaryAction());
    this.input.keyboard?.on('keydown-DOWN', () => this.secondaryVehicleAction());
    this.input.keyboard?.on('keydown-S', () => this.secondaryVehicleAction());
    this.input.keyboard?.on('keydown-E', () => this.tryRecover());
    this.input.keyboard?.on('keydown-P', () => this.togglePause());

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < 1380) {
        this.primaryAction();
      }
    });

    this.drawWorld();
  }

  update(time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 0.035);

    if (this.state === 'running' || this.state === 'recovering') {
      this.elapsedSeconds += dt;
      this.worldSpeed =
        445 +
        this.elapsedSeconds * 3.2 +
        Math.max(0, this.elapsedSeconds - 35) * 0.9;

      const recoveryMultiplier =
        this.state === 'recovering' ? 0.48 : 1;

      const speed =
        this.vehicle === 'booster'
          ? this.worldSpeed * 1.72
          : this.worldSpeed * recoveryMultiplier;

      this.travel += speed * dt;
      this.runData.addDistance(speed * dt * 0.0105);
      this.balance.update(dt, this.state === 'recovering');

      this.invulnerableSeconds = Math.max(
        0,
        this.invulnerableSeconds - dt
      );
      this.boostSeconds = Math.max(0, this.boostSeconds - dt);

      this.updateTier();
      this.updateVehicle(dt);
      this.updateHazards(speed, dt);
      this.updateCoins(speed, dt);
      this.updateCandies(speed, dt);
      this.spawnContent(speed, dt);
      this.drawWorld();
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

  private resetRunState(): void {
    this.state = 'running';
    this.worldSpeed = 445;
    this.elapsedSeconds = 0;
    this.travel = 0;
    this.currentTier = 0;

    this.nextHazardDistance = 520;
    this.hazardTravel = 0;
    this.nextCoinDistance = 420;
    this.coinTravel = 0;
    this.nextCandyDistance = 1200;
    this.candyTravel = 0;

    this.shield = false;
    this.invulnerableSeconds = 0;
    this.boostSeconds = 0;

    this.vehicle = null;
    this.vehicleSeconds = 0;
    this.vehicleCooldown = 25;
    this.vehicleVelocity = 0;
    this.vehicleLane = 1;

    this.balance = new BalanceSystem();
    this.runData = new RunData();
    this.runData.reset();
  }

  private createGranny(): void {
    const texture = this.textures.exists(
      'granny-' + this.selectedOutfit
    )
      ? 'granny-' + this.selectedOutfit
      : 'granny-classic';

    this.granny = this.physics.add
      .sprite(205, this.groundY - 108, texture)
      .setScale(0.84)
      .setDepth(15)
      .setCollideWorldBounds(true);

    const body = this.granny.body as Phaser.Physics.Arcade.Body;
    body.setSize(88, 174);
    body.setOffset(46, 35);

    const ground = this.add.rectangle(
      540,
      this.groundY + 105,
      1080,
      210,
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

    this.candies = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
  }

  private createHUD(): void {
    const pill = (
      x: number,
      width: number,
      label: string
    ): Phaser.GameObjects.Container => {
      const bg = this.add.rectangle(
        0,
        0,
        width,
        88,
        0xfffaf2,
        0.94
      ).setStrokeStyle(4, COLORS.plum);

      const small = this.add.text(0, -20, label, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '17px',
        color: '#7e7180'
      }).setOrigin(0.5);

      return this.add.container(x, 100, [bg, small]).setDepth(40);
    };

    pill(175, 245, 'MUNTEN');
    pill(540, 245, 'AFSTAND');
    pill(905, 245, 'RECORD');

    this.coinText = this.add.text(175, 115, '🪙 ' + this.profile.coins, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '31px',
      color: CSS.plum
    }).setOrigin(0.5).setDepth(41);

    this.distanceText = this.add.text(540, 115, '0 m', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '31px',
      color: CSS.plum
    }).setOrigin(0.5).setDepth(41);

    this.bestText = this.add.text(
      905,
      115,
      Math.floor(this.runData.bestDistance) + ' m',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '31px',
        color: CSS.plum
      }
    ).setOrigin(0.5).setDepth(41);

    this.tierLabel = this.add.text(540, 245, 'TIER 1\nDE RUSTIGE BUURT', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: CSS.plum,
      align: 'center'
    }).setOrigin(0.5).setDepth(30).setAlpha(0.82);

    this.balanceText = this.add.text(540, 335, 'STABLE', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '23px',
      color: CSS.cream,
      stroke: CSS.plum,
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(35);

    this.add.rectangle(
      540,
      382,
      440,
      20,
      COLORS.plum,
      0.7
    ).setDepth(34);

    this.balanceFill = this.add
      .rectangle(322, 382, 436, 14, COLORS.mustard, 1)
      .setOrigin(0, 0.5)
      .setDepth(35);

    this.shieldText = this.add.text(55, 235, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: CSS.plum,
      backgroundColor: CSS.cream,
      padding: { x: 18, y: 12 }
    }).setDepth(42).setVisible(false);

    this.statusText = this.add.text(
      540,
      1815,
      'Pak snoepjes om een beschermschild te verdienen.',
      {
        fontFamily: 'Arial',
        fontSize: '25px',
        color: CSS.plum,
        backgroundColor: '#fffaf2dd',
        padding: { x: 16, y: 9 }
      }
    ).setOrigin(0.5).setDepth(45);

    this.nearMissText = this.add.text(540, 470, 'NEAR MISS!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '42px',
      color: CSS.mustard,
      stroke: CSS.plum,
      strokeThickness: 8
    }).setOrigin(0.5).setDepth(45).setAlpha(0);
  }

  private createControls(): void {
    this.pauseButton = this.createButton(
      180,
      1690,
      270,
      92,
      '⏸ PAUZE',
      COLORS.cream,
      () => this.togglePause(),
      25
    );

    this.jumpButton = this.createButton(
      760,
      1690,
      500,
      118,
      '↑ SPRING!',
      COLORS.dustyPink,
      () => this.primaryAction(),
      35
    );

    this.recoverButton = this.createButton(
      540,
      1640,
      620,
      120,
      'RED GRANNY!',
      COLORS.mustard,
      () => this.tryRecover(),
      34
    ).setVisible(false);

    this.recoveryText = this.add.text(540, 1515, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '44px',
      color: CSS.white,
      stroke: CSS.plum,
      strokeThickness: 8
    }).setOrigin(0.5).setDepth(60).setVisible(false);
  }

  private bindSystems(): void {
    this.runData.on('distance', (distance: number) => {
      const rounded = Math.floor(distance);
      this.distanceText.setText(rounded + ' m');
      this.bestText.setText(
        Math.max(
          rounded,
          Math.floor(this.runData.bestDistance)
        ) + ' m'
      );
    });

    this.runData.on('nearMiss', () => {
      this.showNearMissFeedback();
    });

    this.balance.on('change', (value: number) => {
      this.balanceFill.width = 436 * value;
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

  private spawnContent(speed: number, dt: number): void {
    if (this.vehicle !== 'plane') {
      this.hazardTravel += speed * dt;

      if (this.hazardTravel >= this.nextHazardDistance) {
        this.spawnHazard();
        this.hazardTravel = 0;

        const flightTime = (2 * 780) / 2300;
        const minimum = speed * (flightTime + 0.42) + 125;
        const close = Math.random() < 0.43;

        this.nextHazardDistance =
          minimum +
          (close
            ? Phaser.Math.Between(0, 100)
            : Phaser.Math.Between(130, 280));
      }
    }

    this.coinTravel += speed * dt;
    if (this.coinTravel >= this.nextCoinDistance) {
      this.spawnCoinLine();
      this.coinTravel = 0;
      this.nextCoinDistance = Phaser.Math.Between(1050, 1750);
    }

    this.candyTravel += speed * dt;
    if (this.candyTravel >= this.nextCandyDistance) {
      this.spawnCandy();
      this.candyTravel = 0;
      this.nextCandyDistance = Phaser.Math.Between(1550, 2350);
    }
  }

  private spawnHazard(): void {
    const tier = TIERS[this.currentTier % TIERS.length];

    const available = tier.obstacleIds.filter(
      (id) => this.elapsedSeconds > 12 || id !== 'walker'
    );

    const id = Phaser.Utils.Array.GetRandom(available);
    const definition = OBSTACLES[id];
    if (!definition) return;

    const y =
      this.vehicle === 'plane'
        ? Phaser.Math.Between(650, 1280)
        : this.groundY - definition.height / 2;

    const hazard = this.hazards.create(
      1160,
      y,
      'obstacle-' + definition.id
    ) as Hazard;

    hazard.definition = definition;
    hazard.attacking =
      definition.charging &&
      Math.random() <
        (definition.id === 'car' ? 0.72 : 0.55);
    hazard.charging = false;
    hazard.chargeX =
      1080 - (definition.id === 'car' ? 210 : 130);

    hazard.setDisplaySize(
      definition.width + 24,
      definition.height + 24
    );

    const body = hazard.body as Phaser.Physics.Arcade.Body;
    body.setSize(
      definition.width * 0.72,
      definition.height * 0.72,
      true
    );

    hazard.setDepth(12);
    hazard.setImmovable(true);

    if (hazard.attacking) {
      const warning = this.add.text(
        hazard.x,
        hazard.y - definition.height * 0.8,
        '!',
        {
          fontFamily: 'Arial Black, Arial',
          fontSize: '38px',
          color: CSS.danger,
          backgroundColor: CSS.cream,
          padding: { x: 12, y: 4 }
        }
      ).setOrigin(0.5).setDepth(20);

      hazard.setData('warning', warning);
    }
  }

  private updateHazards(speed: number, dt: number): void {
    this.hazards.children.each((child) => {
      const hazard = child as Hazard;
      const definition = hazard.definition;

      if (!definition) return true;

      if (
        hazard.attacking &&
        !hazard.charging &&
        hazard.x <= (hazard.chargeX ?? 850)
      ) {
        hazard.charging = true;
      }

      const multiplier =
        hazard.charging
          ? definition.multiplier ?? 1
          : 1;

      hazard.x -= speed * multiplier * dt;

      if (this.vehicle === 'booster') {
        const laneY = [
          this.groundY - 190,
          this.groundY - 115,
          this.groundY - 40
        ];
        hazard.y = laneY[
          Phaser.Math.Clamp(
            Number(hazard.getData('lane') ?? 1),
            0,
            2
          )
        ];
      }

      const warning = hazard.getData(
        'warning'
      ) as Phaser.GameObjects.Text | undefined;

      if (warning) {
        warning.setPosition(
          hazard.x,
          hazard.y - definition.height * 0.8
        );

        if (hazard.charging) {
          warning.destroy();
          hazard.setData('warning', undefined);
        }
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
        warning?.destroy();
        hazard.destroy();
      }

      return true;
    });
  }

  private hitHazard(hazard: Hazard): void {
    if (
      (this.state !== 'running' && this.state !== 'recovering') ||
      hazard.hitRegistered ||
      this.vehicle === 'plane'
    ) {
      return;
    }

    hazard.hitRegistered = true;

    if (
      this.invulnerableSeconds > 0 ||
      this.boostSeconds > 0
    ) {
      return;
    }

    if (this.shield) {
      this.shield = false;
      this.invulnerableSeconds = 1.25;
      this.updateShieldHUD();
      this.statusText.setText(
        '🍬 Snoepje gebruikt! Je bent weer kwetsbaar.'
      );
      return;
    }

    const definition = hazard.definition;
    const damage = definition?.damage ?? 0.3;

    this.balance.impact(damage);

    if (this.balance.state !== 'fallen') {
      this.beginRecovery(
        definition?.heavy ? 780 : 1120
      );
    }

    if (!this.reducedMotion) {
      this.cameras.main.shake(100, 0.006);
    }
  }

  private spawnCoinLine(): void {
    const count = Math.random() < 0.35 ? 5 : 3;
    const arc = Math.random() < 0.7;

    for (let i = 0; i < count; i++) {
      const x = 1140 + i * 90;
      const progress = i / Math.max(1, count - 1);
      const y = arc
        ? this.groundY -
          190 -
          Math.sin(progress * Math.PI) * 85
        : this.groundY - 155;

      const coin = this.coins.create(
        x,
        y,
        'coin'
      ) as Phaser.Physics.Arcade.Sprite;

      coin.setScale(0.68);
      coin.setDepth(11);
      coin.setData(
        'phase',
        Phaser.Math.FloatBetween(0, Math.PI * 2)
      );
      coin.setData('baseY', y);
    }
  }

  private updateCoins(speed: number, dt: number): void {
    this.coins.children.each((child) => {
      const coin = child as Phaser.Physics.Arcade.Sprite;
      coin.x -= speed * dt;

      if (!this.reducedMotion) {
        const phase =
          Number(coin.getData('phase') ?? 0) + dt * 5;

        coin.setData('phase', phase);
        coin.y =
          Number(coin.getData('baseY')) +
          Math.sin(phase) * 10;
        coin.angle += dt * 150;
      }

      if (coin.x < -100) {
        coin.destroy();
      }

      return true;
    });
  }

  private collectCoin(
    coin: Phaser.Physics.Arcade.Sprite
  ): void {
    this.runData.addCoin(1);
    addWalletCoins(this.profile, 1);
    this.coinText.setText('🪙 ' + this.profile.coins);

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: this.coinText,
        scale: 1.2,
        duration: 90,
        yoyo: true
      });
    }

    coin.destroy();
  }

  private spawnCandy(): void {
    const candy = this.candies.create(
      1140,
      this.groundY - 205,
      'candy'
    ) as Phaser.Physics.Arcade.Sprite;

    candy.setScale(0.85);
    candy.setDepth(11);
    candy.setData('phase', 0);
  }

  private updateCandies(speed: number, dt: number): void {
    this.candies.children.each((child) => {
      const candy = child as Phaser.Physics.Arcade.Sprite;
      candy.x -= speed * dt;

      const phase =
        Number(candy.getData('phase') ?? 0) + dt * 5;

      candy.setData('phase', phase);

      if (!this.reducedMotion) {
        candy.y += Math.sin(phase) * 0.55;
        candy.angle = Math.sin(phase * 0.7) * 9;
      }

      if (candy.x < -100) {
        candy.destroy();
      }

      return true;
    });
  }

  private collectCandy(
    candy: Phaser.Physics.Arcade.Sprite
  ): void {
    this.shield = true;
    this.updateShieldHUD();

    this.statusText.setText(
      '🍬 Snoepje gepakt! Eén botsing wordt opgevangen.'
    );

    candy.destroy();
  }

  private updateShieldHUD(): void {
    this.shieldText
      .setVisible(this.shield)
      .setText(this.shield ? '🍬 SCHILD ACTIEF' : '');
  }

  private updateTier(): void {
    const nextTier = Math.floor(
      this.runData.distance / 500
    );

    if (nextTier === this.currentTier) return;

    this.currentTier = nextTier;
    const tier = TIERS[
      this.currentTier % TIERS.length
    ];

    this.tierLabel.setText(
      'TIER ' +
      (this.currentTier + 1) +
      '\n' +
      tier.name.toUpperCase()
    );

    this.showTierFlash(tier.icon + ' ' + tier.name);
  }

  private showTierFlash(label: string): void {
    this.tierFlash?.destroy(true);

    const bg = this.add.rectangle(
      540,
      790,
      800,
      180,
      COLORS.cream,
      0.96
    ).setStrokeStyle(6, COLORS.plum);

    const text = this.add.text(
      540,
      790,
      'NIEUWE TIER\n' + label,
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '37px',
        color: CSS.plum,
        align: 'center'
      }
    ).setOrigin(0.5);

    this.tierFlash = this.add.container(
      0,
      0,
      [bg, text]
    ).setDepth(70);

    this.time.delayedCall(2400, () => {
      this.tierFlash?.destroy(true);
      this.tierFlash = undefined;
    });
  }

  private drawWorld(): void {
    const g = this.backgroundGraphics;
    const tier = TIERS[
      this.currentTier % TIERS.length
    ];

    g.clear();

    const stripeHeight = 315;
    tier.sky.forEach((color, index) => {
      g.fillStyle(color, 1);
      g.fillRect(
        0,
        index * stripeHeight,
        1080,
        stripeHeight + 1
      );
    });

    g.fillStyle(tier.sun, 1);
    g.fillCircle(845, 315, 62);

    this.drawHills(g, tier.hill, 1080, 220, 0.055);
    this.drawHills(g, tier.near, 1190, 125, 0.12);

    const scroll = (factor: number, spacing: number): number =>
      -((this.travel * factor) % spacing);

    if (this.currentTier % TIERS.length === 2) {
      for (let x = scroll(0.13, 180) - 180; x < 1260; x += 180) {
        const height = 230 + ((x + 400) % 160);
        g.fillStyle(tier.building, 1);
        g.fillRect(x, this.groundY - 420 - height, 125, height);
        g.fillStyle(0xfce4a4, 0.85);

        for (let wx = 0; wx < 3; wx++) {
          for (let wy = 0; wy < 5; wy++) {
            g.fillRect(
              x + 18 + wx * 34,
              this.groundY - 395 - height + wy * 38,
              16,
              20
            );
          }
        }
      }
    } else {
      for (let x = scroll(0.22, 220) - 180; x < 1260; x += 220) {
        this.drawSceneryObject(g, x, tier);
      }
    }

    g.fillStyle(tier.road[0], 1);
    g.fillRect(0, this.groundY - 20, 1080, 440);

    g.fillStyle(tier.road[1], 1);
    g.fillRect(0, this.groundY + 60, 1080, 360);

    g.fillStyle(COLORS.plum, 0.8);
    g.fillRect(0, this.groundY - 20, 1080, 6);

    const markerShift = -((this.travel * 0.9) % 150);
    g.fillStyle(tier.road[2], 0.72);

    for (let x = markerShift - 150; x < 1230; x += 150) {
      g.fillRoundedRect(x, this.groundY + 52, 60, 8, 4);
    }
  }

  private drawHills(
    g: Phaser.GameObjects.Graphics,
    color: number,
    baseline: number,
    depth: number,
    factor: number
  ): void {
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(0, baseline);

    for (let x = 0; x <= 1080; x += 30) {
      const offset = this.travel * factor;
      const y =
        baseline -
        depth -
        Math.sin((x + offset) / 135) *
          depth *
          0.28 -
        Math.cos((x + offset) / 67) *
          depth *
          0.11;

      g.lineTo(x, y);
    }

    g.lineTo(1080, baseline);
    g.closePath();
    g.fillPath();
  }

  private drawSceneryObject(
    g: Phaser.GameObjects.Graphics,
    x: number,
    tier: (typeof TIERS)[number]
  ): void {
    const zone = this.currentTier % TIERS.length;

    if (zone === 3) {
      g.fillStyle(tier.tree, 1);
      g.fillRoundedRect(x + 50, 1110, 18, 170, 8);
      g.fillRoundedRect(x + 12, 1160, 60, 18, 8);
      g.fillRoundedRect(x + 62, 1130, 62, 18, 8);
      return;
    }

    if (zone === 4 || zone === 6) {
      g.fillStyle(tier.building, 1);
      g.fillRoundedRect(x, 1080, 130, 220, 28);
      g.fillStyle(0xffcf81, 0.9);
      g.fillRoundedRect(x + 52, 1160, 24, 42, 6);
      return;
    }

    if (zone === 5) {
      g.fillStyle(tier.building, 1);
      g.fillRoundedRect(x, 1110, 120, 190, 18);
      g.fillStyle(0xfff3dd, 1);
      g.fillRoundedRect(x + 13, 1140, 94, 24, 12);
      g.fillRoundedRect(x + 20, 1195, 80, 18, 9);
      return;
    }

    g.fillStyle(tier.building, 1);
    g.fillRoundedRect(x, 1115, 130, 185, 12);
    g.fillStyle(0xa16f73, 1);
    g.fillTriangle(
      x - 10,
      1115,
      x + 65,
      1038,
      x + 140,
      1115
    );
    g.fillStyle(0xfff3cb, 1);
    g.fillRoundedRect(x + 22, 1155, 26, 34, 3);
    g.fillRoundedRect(x + 80, 1155, 26, 34, 3);
  }

  private maybeActivateVehicle(dt: number): void {
    if (
      this.vehicle ||
      this.ownedGadgets.length === 0 ||
      this.state !== 'running'
    ) {
      return;
    }

    this.vehicleCooldown -= dt;

    if (this.vehicleCooldown > 0) return;

    const id = Phaser.Utils.Array.GetRandom(
      this.ownedGadgets
    );

    if (id !== 'plane' && id !== 'booster') {
      this.vehicleCooldown = 25;
      return;
    }

    const gadget = GADGETS.find(
      (item) => item.id === id
    );

    if (!gadget) return;

    this.vehicle = id;
    this.vehicleSeconds = gadget.duration;
    this.vehicleCooldown = Phaser.Math.Between(38, 68);
    this.invulnerableSeconds = gadget.duration + 1;

    this.hazards.clear(true, true);

    this.vehicleSprite?.destroy();
    this.vehicleSprite = this.add.image(
      this.granny.x,
      this.granny.y + 35,
      id === 'plane'
        ? 'vehicle-plane'
        : 'vehicle-booster'
    ).setDepth(14);

    if (id === 'plane') {
      this.vehicleVelocity = -260;
      this.statusText.setText(
        '✈️ Vliegtuig! Tik om te fladderen.'
      );
      this.jumpButton.getAt(1)?.setData('label', 'FLAP');
    } else {
      this.vehicleLane = 1;
      this.statusText.setText(
        '🚀 Booster! Tik om van baan te wisselen.'
      );
    }
  }

  private updateVehicle(dt: number): void {
    this.maybeActivateVehicle(dt);

    if (!this.vehicle) return;

    this.vehicleSeconds -= dt;

    if (this.vehicle === 'plane') {
      this.vehicleVelocity += 1120 * dt;
      this.granny.y = Phaser.Math.Clamp(
        this.granny.y + this.vehicleVelocity * dt,
        610,
        this.groundY - 110
      );
    } else {
      const lanes = [
        this.groundY - 250,
        this.groundY - 180,
        this.groundY - 110
      ];

      this.granny.y = Phaser.Math.Linear(
        this.granny.y,
        lanes[this.vehicleLane],
        Math.min(1, dt * 10)
      );

      this.boostSeconds = this.vehicleSeconds;
    }

    this.vehicleSprite?.setPosition(
      this.granny.x,
      this.granny.y + 45
    );

    if (this.vehicleSeconds <= 0) {
      this.endVehicle();
    }
  }

  private endVehicle(): void {
    this.vehicle = null;
    this.vehicleSeconds = 0;
    this.vehicleSprite?.destroy();
    this.vehicleSprite = undefined;

    this.granny.setY(this.groundY - 110);
    this.granny.setVelocity(0, 0);
    this.invulnerableSeconds = 2;
    this.boostSeconds = 0;

    this.statusText.setText(
      'Oma is weer te voet!'
    );
  }

  private primaryAction(): void {
    if (this.state === 'recovering') {
      this.tryRecover();
      return;
    }

    if (this.vehicle === 'plane') {
      this.vehicleVelocity = -430;
      return;
    }

    if (this.vehicle === 'booster') {
      this.vehicleLane = Math.max(
        0,
        this.vehicleLane - 1
      );
      return;
    }

    this.tryJump();
  }

  private secondaryVehicleAction(): void {
    if (this.vehicle === 'booster') {
      this.vehicleLane = Math.min(
        2,
        this.vehicleLane + 1
      );
    }
  }

  private tryJump(): void {
    if (this.state !== 'running' || this.vehicle) {
      return;
    }

    const body = this.granny.body as Phaser.Physics.Arcade.Body;

    if (!body.blocked.down) return;

    this.granny.setVelocityY(-780);

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: this.granny,
        angle: -7,
        duration: 145,
        yoyo: true
      });
    }
  }

  private beginRecovery(durationMs: number): void {
    if (this.state === 'recovering') return;

    this.state = 'recovering';
    this.recoveryDeadline = this.time.now + durationMs;

    this.recoverButton.setVisible(true);
    this.recoveryText.setVisible(true);
    this.jumpButton.setVisible(false);
    this.pauseButton.setVisible(false);

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
    this.pauseButton.setVisible(true);
    this.cameras.main.setZoom(1);
  }

  private failRecovery(): void {
    if (this.state !== 'recovering') return;
    this.balance.impact(1);
  }

  private beginFall(): void {
    if (
      this.state === 'fallen' ||
      this.state === 'rescue'
    ) {
      return;
    }

    this.state = 'fallen';

    this.recoverButton.setVisible(false);
    this.recoveryText.setVisible(false);
    this.jumpButton.setVisible(false);
    this.pauseButton.setVisible(false);

    this.vehicleSprite?.destroy();
    this.vehicleSprite = undefined;
    this.vehicle = null;

    this.granny.setVelocity(0, -160);

    this.tweens.add({
      targets: this.granny,
      angle: 82,
      duration: this.reducedMotion ? 0 : 280,
      ease: 'Back.out'
    });

    this.time.delayedCall(
      this.reducedMotion ? 0 : 330,
      () => this.openRescue()
    );
  }

  private openRescue(): void {
    this.state = 'rescue';
    this.rescueDeadline = this.time.now + 10000;

    const shade = this.add.rectangle(
      540,
      960,
      1080,
      1920,
      COLORS.deepPlum,
      0.65
    );

    const card = this.add.rectangle(
      540,
      1010,
      900,
      720,
      COLORS.cream,
      1
    );

    this.rescueTimerGraphics = this.add.graphics();

    const title = this.add.text(
      540,
      765,
      'Oei, oma struikelt!',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '54px',
        color: CSS.plum
      }
    ).setOrigin(0.5);

    const body = this.add.text(
      540,
      885,
      Math.floor(this.runData.distance) +
        ' meter afgelegd · ' +
        this.runData.coins +
        ' munten verzameld.\n' +
        'Je hebt 10 seconden om een keuze te maken.',
      {
        fontFamily: 'Arial',
        fontSize: '29px',
        color: CSS.plum,
        align: 'center',
        lineSpacing: 10,
        wordWrap: { width: 760 }
      }
    ).setOrigin(0.5);

    const countdown = this.add.text(
      540,
      1060,
      '⏳ Nog 10 seconden',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '31px',
        color: CSS.plum,
        backgroundColor: '#fff0d7',
        padding: { x: 20, y: 12 }
      }
    ).setOrigin(0.5).setName('rescue-countdown');

    const revive = this.createButton(
      390,
      1250,
      330,
      92,
      '❤️ VERDER · 10 🪙',
      COLORS.mustard,
      () => this.revive(false),
      22
    );

    const boost = this.createButton(
      690,
      1250,
      330,
      92,
      '⚡ BOOST · 6 🪙',
      COLORS.dustyPink,
      () => this.revive(true),
      22
    );

    const home = this.createButton(
      540,
      1395,
      520,
      80,
      '← TERUG NAAR BEGIN',
      COLORS.cream,
      () => this.scene.start('menu'),
      23
    );

    this.rescueLayer = this.add.container(
      0,
      0,
      [
        shade,
        card,
        this.rescueTimerGraphics,
        title,
        body,
        countdown,
        revive,
        boost,
        home
      ]
    ).setDepth(120);
  }

  private updateRescueCountdown(time: number): void {
    if (!this.rescueLayer) return;

    const remaining = Math.max(
      0,
      this.rescueDeadline - time
    );

    const countdown = this.rescueLayer.getByName(
      'rescue-countdown'
    ) as Phaser.GameObjects.Text | null;

    countdown?.setText(
      '⏳ Nog ' +
      Math.ceil(remaining / 1000) +
      ' seconden'
    );

    this.drawRescuePerimeter(remaining / 10000);

    if (remaining <= 0) {
      this.finishRun();
    }
  }

  private drawRescuePerimeter(progress: number): void {
    if (!this.rescueTimerGraphics) return;

    const g = this.rescueTimerGraphics;
    g.clear();

    const left = 90;
    const top = 650;
    const width = 900;
    const height = 720;
    const perimeter = 2 * (width + height);
    let remaining = perimeter * Phaser.Math.Clamp(
      progress,
      0,
      1
    );

    g.lineStyle(12, COLORS.danger, 1);
    g.beginPath();
    g.moveTo(left, top);

    const segments = [
      { length: width, dx: width, dy: 0 },
      { length: height, dx: 0, dy: height },
      { length: width, dx: -width, dy: 0 },
      { length: height, dx: 0, dy: -height }
    ];

    let x = left;
    let y = top;

    for (const segment of segments) {
      if (remaining <= 0) break;

      const ratio = Math.min(
        1,
        remaining / segment.length
      );

      x += segment.dx * ratio;
      y += segment.dy * ratio;
      g.lineTo(x, y);

      remaining -= segment.length;
    }

    g.strokePath();
  }

  private revive(boost: boolean): void {
    if (this.state !== 'rescue') return;

    const cost = boost ? 6 : 10;

    if (
      this.profile.coins < cost ||
      this.time.now >= this.rescueDeadline
    ) {
      return;
    }

    this.profile.coins -= cost;
    saveProfile(this.profile);
    this.coinText.setText('🪙 ' + this.profile.coins);

    this.rescueLayer?.destroy(true);
    this.rescueLayer = undefined;
    this.rescueTimerGraphics = undefined;

    this.hazards.children.each((child) => {
      const hazard = child as Hazard;

      if (
        Math.abs(
          hazard.x - this.granny.x
        ) < 300
      ) {
        hazard.destroy();
      }

      return true;
    });

    this.balance.reset();
    this.state = 'running';
    this.granny.setAngle(0);
    this.granny.setVelocity(0, 0);
    this.granny.setY(this.groundY - 110);

    this.invulnerableSeconds = boost ? 6 : 3.5;
    this.boostSeconds = boost ? 6 : 0;

    this.jumpButton.setVisible(true);
    this.pauseButton.setVisible(true);

    this.statusText.setText(
      boost
        ? '⚡ Turbo: 6 seconden bescherming en extra meters!'
        : '❤️ Extra leven: 3,5 seconden bescherming!'
    );
  }

  private finishRun(): void {
    if (this.state === 'gameover') return;

    this.state = 'gameover';
    this.rescueLayer?.destroy(true);
    this.rescueLayer = undefined;

    const snapshot = this.runData.snapshot();

    const shade = this.add.rectangle(
      540,
      960,
      1080,
      1920,
      COLORS.deepPlum,
      0.91
    );

    const panel = this.add.rectangle(
      540,
      980,
      860,
      820,
      COLORS.cream,
      1
    ).setStrokeStyle(8, COLORS.plum);

    const title = this.add.text(
      540,
      665,
      'RUN VOORBIJ',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '70px',
        color: CSS.plum
      }
    ).setOrigin(0.5);

    const score = this.add.text(
      540,
      835,
      Math.floor(snapshot.distance) + ' m',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '116px',
        color: CSS.danger
      }
    ).setOrigin(0.5);

    const details = this.add.text(
      540,
      1045,
      '🪙 ' +
      snapshot.coins +
      ' deze run\n' +
      snapshot.nearMisses +
      ' near misses\n' +
      'Record: ' +
      Math.floor(snapshot.bestDistance) +
      ' m',
      {
        fontFamily: 'Arial',
        fontSize: '34px',
        color: CSS.plum,
        align: 'center',
        lineSpacing: 14
      }
    ).setOrigin(0.5);

    const replay = this.createButton(
      540,
      1285,
      650,
      118,
      'OPNIEUW',
      COLORS.mustard,
      () => this.scene.restart({
        reducedMotion: this.reducedMotion,
        selectedOutfit: this.selectedOutfit,
        ownedGadgets: this.ownedGadgets
      }),
      34
    );

    const home = this.createButton(
      540,
      1435,
      500,
      82,
      'NAAR HOME',
      COLORS.cream,
      () => this.scene.start('menu'),
      25
    );

    this.gameOverLayer = this.add.container(
      0,
      0,
      [shade, panel, title, score, details, replay, home]
    ).setDepth(140);
  }

  private togglePause(): void {
    if (this.state === 'running') {
      this.state = 'gameover';
      this.physics.pause();

      const shade = this.add.rectangle(
        540,
        960,
        1080,
        1920,
        COLORS.deepPlum,
        0.55
      );

      const panel = this.add.rectangle(
        540,
        960,
        760,
        430,
        COLORS.cream,
        1
      ).setStrokeStyle(7, COLORS.plum);

      const title = this.add.text(
        540,
        845,
        'Even uitrusten ☕',
        {
          fontFamily: 'Arial Black, Arial',
          fontSize: '50px',
          color: CSS.plum
        }
      ).setOrigin(0.5);

      const resume = this.createButton(
        540,
        1015,
        520,
        95,
        'VERDER WANDELEN →',
        COLORS.mustard,
        () => {
          pauseLayer.destroy(true);
          this.physics.resume();
          this.state = 'running';
        },
        27
      );

      const pauseLayer = this.add.container(
        0,
        0,
        [shade, panel, title, resume]
      ).setDepth(150);
    }
  }

  private showNearMissFeedback(): void {
    this.nearMissText
      .setAlpha(1)
      .setScale(0.85)
      .setY(470);

    if (this.reducedMotion) {
      this.time.delayedCall(
        650,
        () => this.nearMissText.setAlpha(0)
      );
      return;
    }

    this.tweens.add({
      targets: this.nearMissText,
      alpha: 0,
      scale: 1.15,
      y: 430,
      duration: 720,
      ease: 'Cubic.out'
    });
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    callback: () => void,
    fontSize = 30
  ): Phaser.GameObjects.Container {
    const bg = this.add.rectangle(
      0,
      0,
      width,
      height,
      color
    ).setStrokeStyle(5, COLORS.plum);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: fontSize + 'px',
      color: CSS.plum,
      align: 'center'
    }).setOrigin(0.5);

    const zone = this.add.zone(
      0,
      0,
      width,
      height
    ).setInteractive({ useHandCursor: true });

    const container = this.add.container(
      x,
      y,
      [bg, text, zone]
    ).setDepth(80);

    zone.on('pointerup', callback);
    return container;
  }
}
