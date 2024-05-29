import { GameModeType } from "../gamemodes/gameModeInfo";
import SceneEffect from "../objects/scene_effect";

export default class MainMenuScene extends Phaser.Scene {
  selectBar: Phaser.GameObjects.Graphics;
  selected: number = 0;
  width: number;
  height: number;
  center_width: number;
  center_height: number;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
    
  constructor() {
    super({ key: 'MainMenu' });
  }

  create() {
    this.width = +this.sys.game.config.width;
    this.height = +this.sys.game.config.height;
    this.center_width = this.width / 2;
    this.center_height = this.height / 2;
    this.add
    .bitmapText(
      this.center_width,
      this.center_height - 70,
      "wendy",
      "Single Player",
      100
    )
    .setOrigin(0.5);

    this.add
    .bitmapText(
      this.center_width,
      this.center_height + 70,
      "wendy",
      "Multi Player",
      100
    )
    .setOrigin(0.5);

    this.selectBar = this.add.graphics();        
    this.cursor = this.input.keyboard.createCursorKeys();
    this.drawSelectBar();

    const space = this.add
    .bitmapText(this.center_width, 690, "wendy", "Press SPACE to start", 60)
    .setOrigin(0.5)
    .setDropShadow(3, 4, 0x222222, 0.7);
    this.tweens.add({
      targets: space,
      duration: 300,
      alpha: {from: 0, to: 1},
      repeat: -1,
      yoyo: true,
    });
    
    this.input.keyboard.on(
      "keydown-SPACE",
      () => this.transitionToChange(),
      this
    );
  }

  update() {
    let changed = false;
    if (this.cursor.up.isDown) {
      if (this.selected === 1) {
        this.selected = 0;
        changed = true;
      }
    }
    if (this.cursor.down.isDown) {
      if (this.selected === 0) {
        this.selected = 1;
        changed = true;
      }
    } 

    if (changed) {
      this.drawSelectBar();      
    }
  }

  drawSelectBar() {
    this.selectBar.clear();
    this.selectBar.lineStyle(5, 0xff0000, 1);
    this.selectBar.strokeRectShape(
      new Phaser.Geom.Rectangle(
        this.center_width - 260, 
        this.center_height - 110 + (this.selected * 140), 
        520,  
        90)
    );
  }
  
  transitionToChange() {
    new SceneEffect(this).simpleClose(this.startGame.bind(this));
  }
  
  startGame() {
    this.scene.start("transition", {
        next: "GameScene",
        data: {
          gameModeType: this.selected === 0 ? GameModeType.LOCAL : GameModeType.ONLINE_PVP
        }
    });
  }
}