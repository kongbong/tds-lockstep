import GameScene from "../scenes/gameScene";
import { MaxHP } from "../simulation/simulationShip";

export default class HpBar {
  scene: GameScene;
  x: number;
  y: number;
  width:number;
  height:number;

  backgoundBar: Phaser.GameObjects.Graphics;
  hpBar: Phaser.GameObjects.Graphics;

  constructor(scene: GameScene, x: number, y: number, width:number, height:number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.backgoundBar = this.scene.add.graphics();
    this.backgoundBar.setScrollFactor(0);
    this.backgoundBar.fillStyle(0xd40000, 1);
    this.backgoundBar.fillRect(x, y, width, height);

    this.hpBar = this.scene.add.graphics();
    this.hpBar.setScrollFactor(0);
  }

  update() {
    if (this.scene.playerShip) {
      const hp = this.scene.playerShip.simulationShip.hp;      
      this.hpBar.clear();
      this.hpBar.fillStyle(0x00ff00, 1);
      this.hpBar.fillRect(this.x + 5, this.y + 5, this.width * hp / MaxHP - 10, this.height - 10);
    } else {
      this.hpBar.clear();
    }
  }
}