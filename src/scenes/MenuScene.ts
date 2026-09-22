import Phaser from 'phaser';
import { COLORS, CSS } from '../game/theme';
import { GADGETS, OUTFITS } from '../game/content';
import {
  loadProfile,
  saveProfile,
  spendOnGadget,
  spendOnOutfit
} from '../game/ProfileStore';
import { loadPreferences, savePreferences } from '../game/storage';

type MenuPage = 'home' | 'clothes' | 'gadgets';

export class MenuScene extends Phaser.Scene {
  private preferences = loadPreferences();
  private profile = loadProfile();
  private page: MenuPage = 'home';
  private contentLayer?: Phaser.GameObjects.Container;
  private tabTexts: Partial<Record<MenuPage, Phaser.GameObjects.Text>> = {};
  private walletText!: Phaser.GameObjects.Text;

  constructor() {
    super('menu');
  }

  create(): void {
    this.preferences = loadPreferences();
    this.profile = loadProfile();

    this.cameras.main.setBackgroundColor(COLORS.deepPlum);
    this.drawBackdrop();

    this.add.text(540, 92, "DON'T TRIP GRANDMA!", {
      fontFamily: 'Arial Black, Arial',
      fontSize: '60px',
      color: CSS.cream,
      stroke: CSS.plum,
      strokeThickness: 10
    }).setOrigin(0.5);

    const granny = this.add.image(
      540,
      360,
      'granny-' + this.profile.selectedOutfit
    ).setScale(1.48);

    if (!this.preferences.reducedMotion) {
      this.tweens.add({
        targets: granny,
        y: granny.y - 14,
        duration: 1300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }

    this.add.rectangle(
      540,
      1055,
      920,
      1170,
      COLORS.cream,
      1
    ).setStrokeStyle(8, COLORS.plum).setDepth(2);

    this.add.text(540, 590, 'Oma gaat wandelen!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '48px',
      color: CSS.plum
    }).setOrigin(0.5).setDepth(3);

    this.createTabs();

    this.walletText = this.add.text(
      540,
      770,
      '🪙 ' + this.profile.coins + ' munten',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '31px',
        color: '#624b26'
      }
    ).setOrigin(0.5).setDepth(4);

    this.renderPage();

    const reduced = this.add.text(
      540,
      1770,
      'Reduced motion: ' + (this.preferences.reducedMotion ? 'AAN' : 'UIT'),
      {
        fontFamily: 'Arial',
        fontSize: '26px',
        color: CSS.cream,
        backgroundColor: CSS.plum,
        padding: { x: 22, y: 14 }
      }
    ).setOrigin(0.5).setDepth(5).setInteractive({ useHandCursor: true });

    reduced.on('pointerup', () => {
      this.preferences.reducedMotion = !this.preferences.reducedMotion;
      savePreferences(this.preferences);
      reduced.setText(
        'Reduced motion: ' +
        (this.preferences.reducedMotion ? 'AAN' : 'UIT')
      );
    });
  }

  private drawBackdrop(): void {
    const g = this.add.graphics();
    g.fillStyle(0x241f42);
    g.fillRect(0, 0, 1080, 1920);
    g.fillStyle(0x473454, 0.95);
    g.fillCircle(125, 230, 280);
    g.fillCircle(1010, 460, 380);
    g.fillStyle(0xffe2a0, 0.28);
    g.fillEllipse(540, 365, 470, 300);
  }

  private createTabs(): void {
    const tabs: Array<{ page: MenuPage; label: string; x: number }> = [
      { page: 'home', label: '🏠 START', x: 285 },
      { page: 'clothes', label: '👗 KLEDING', x: 540 },
      { page: 'gadgets', label: '🛠 GADGETS', x: 795 }
    ];

    for (const tab of tabs) {
      const bg = this.add.rectangle(
        tab.x,
        690,
        228,
        70,
        tab.page === this.page ? COLORS.mustard : 0xffffff
      ).setStrokeStyle(5, COLORS.plum).setDepth(4)
        .setInteractive({ useHandCursor: true });

      const text = this.add.text(tab.x, 690, tab.label, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '22px',
        color: CSS.plum
      }).setOrigin(0.5).setDepth(5);

      this.tabTexts[tab.page] = text;

      bg.on('pointerup', () => {
        this.page = tab.page;
        this.scene.restart();
        this.events.once(Phaser.Scenes.Events.CREATE, () => {
          this.page = tab.page;
        });
      });

      bg.setData('page', tab.page);
    }
  }

  private renderPage(): void {
    this.contentLayer?.destroy(true);
    this.contentLayer = this.add.container(0, 0).setDepth(6);

    if (this.page === 'home') {
      this.renderHome();
      return;
    }

    if (this.page === 'clothes') {
      this.renderOutfits();
      return;
    }

    this.renderGadgets();
  }

  private renderHome(): void {
    const intro = this.add.text(
      540,
      925,
      'Ren, verzamel munten en ontgrendel oma’s outfits\n' +
      'en zeldzame voertuigen.',
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: CSS.plum,
        align: 'center',
        lineSpacing: 12
      }
    ).setOrigin(0.5);

    const details = this.add.text(
      540,
      1110,
      'Spring over katten, hondjes, geraniums, sokken,\n' +
      'rollators en steeds gekkere obstakels.\n' +
      'Pak 🍬 voor een beschermschild.',
      {
        fontFamily: 'Arial',
        fontSize: '27px',
        color: '#65546b',
        align: 'center',
        lineSpacing: 10
      }
    ).setOrigin(0.5);

    const play = this.createButton(
      540,
      1435,
      720,
      130,
      'START HET SPEL →',
      COLORS.mustard,
      () => {
        saveProfile(this.profile);
        this.scene.start('game', {
          reducedMotion: this.preferences.reducedMotion,
          selectedOutfit: this.profile.selectedOutfit,
          ownedGadgets: this.profile.ownedGadgets
        });
      }
    );

    this.contentLayer?.add([intro, details, play]);
  }

  private renderOutfits(): void {
    const items: Phaser.GameObjects.GameObject[] = [];
    const startY = 885;

    OUTFITS.forEach((outfit, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = col === 0 ? 330 : 750;
      const y = startY + row * 220;

      const card = this.add.rectangle(
        x,
        y,
        360,
        190,
        0xffffff,
        1
      ).setStrokeStyle(4, COLORS.plum);

      const preview = this.add.image(
        x - 112,
        y,
        'granny-' + outfit.id
      ).setScale(0.52);

      const name = this.add.text(
        x + 28,
        y - 52,
        outfit.name,
        {
          fontFamily: 'Arial Black, Arial',
          fontSize: '23px',
          color: CSS.plum
        }
      ).setOrigin(0.5);

      const owned = this.profile.ownedOutfits.includes(outfit.id);
      const selected = this.profile.selectedOutfit === outfit.id;
      const label = selected
        ? '✓ AANGETROKKEN'
        : owned
          ? 'AANTREKKEN'
          : '🪙 ' + outfit.cost;

      const button = this.createButton(
        x + 50,
        y + 48,
        205,
        54,
        label,
        selected ? COLORS.mint : COLORS.mustard,
        () => {
          if (spendOnOutfit(this.profile, outfit.id)) {
            this.scene.restart();
          }
        },
        18
      );

      items.push(card, preview, name, button);
    });

    this.contentLayer?.add(items);
  }

  private renderGadgets(): void {
    const items: Phaser.GameObjects.GameObject[] = [];
    const startY = 980;

    GADGETS.forEach((gadget, index) => {
      const x = index === 0 ? 330 : 750;
      const card = this.add.rectangle(
        x,
        startY,
        360,
        330,
        0xffffff,
        1
      ).setStrokeStyle(4, COLORS.plum);

      const icon = this.add.image(
        x,
        startY - 92,
        gadget.id === 'plane' ? 'vehicle-plane' : 'vehicle-booster'
      ).setScale(gadget.id === 'plane' ? 0.78 : 0.85);

      const name = this.add.text(x, startY, gadget.name, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '27px',
        color: CSS.plum
      }).setOrigin(0.5);

      const description = this.add.text(
        x,
        startY + 55,
        gadget.description,
        {
          fontFamily: 'Arial',
          fontSize: '19px',
          color: '#65546b',
          align: 'center',
          wordWrap: { width: 300 }
        }
      ).setOrigin(0.5);

      const owned = this.profile.ownedGadgets.includes(gadget.id);
      const button = this.createButton(
        x,
        startY + 128,
        220,
        58,
        owned ? '✓ GEKOCHT' : '🪙 ' + gadget.cost,
        owned ? COLORS.mint : COLORS.mustard,
        () => {
          if (spendOnGadget(this.profile, gadget.id)) {
            this.scene.restart();
          }
        },
        19
      );

      items.push(card, icon, name, description, button);
    });

    const note = this.add.text(
      540,
      1390,
      'Tijdens een run kan een gekocht voertuig zeldzaam verschijnen.',
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#65546b',
        align: 'center'
      }
    ).setOrigin(0.5);

    const backPlay = this.createButton(
      540,
      1510,
      560,
      92,
      'START RUN',
      COLORS.mustard,
      () => this.scene.start('game', {
        reducedMotion: this.preferences.reducedMotion,
        selectedOutfit: this.profile.selectedOutfit,
        ownedGadgets: this.profile.ownedGadgets
      }),
      28
    );

    this.contentLayer?.add([...items, note, backPlay]);
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
      color: CSS.plum
    }).setOrigin(0.5);

    const zone = this.add.zone(0, 0, width, height)
      .setInteractive({ useHandCursor: true });

    const container = this.add.container(x, y, [bg, text, zone]);

    zone.on('pointerup', () => {
      if (this.preferences.reducedMotion) {
        callback();
        return;
      }

      this.tweens.add({
        targets: container,
        scale: 0.97,
        duration: 75,
        yoyo: true,
        onComplete: callback
      });
    });

    return container;
  }
}
