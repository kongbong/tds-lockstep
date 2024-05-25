import GameScene from "../scenes/gameScene";

export default class Minimap {
  gameScene: GameScene;
  x: number;
  y: number;
  radius: number;
  circle: Phaser.GameObjects.Arc;
  enemyCircles: Phaser.GameObjects.Arc[];

  constructor(scene: GameScene, x: number, y: number, radius: number, color: number) {
    this.gameScene = scene;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.enemyCircles = [];
    
    this.circle = this.gameScene.add
      .circle(x, y, radius, color, 0.3)
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  // update enemies point in the minimap
  update() {
    if (!this.gameScene.playerShip) return;

    let i = 0;
    this.gameScene.enemyShips.forEach((enemy) => {
      let distance = Phaser.Math.Distance.Between(
        this.gameScene.playerShip.x,
        this.gameScene.playerShip.y,
        enemy.x,
        enemy.y
      );
      const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
      distance /= 10;
      if (distance > this.radius) distance = this.radius;

      const x = this.x + Math.cos(angle) * distance;
      const y = this.y + Math.sin(angle) * distance;
      
      if (i < this.enemyCircles.length) {
        this.enemyCircles[i].setPosition(x, y);
        this.enemyCircles[i].setScale(1);
      } else {
        this.enemyCircles[i] = this.gameScene.add
          .circle(x, y, 5, 0xff0000)
          .setOrigin(0.5)
          .setScrollFactor(0);
      }
      i++;
    });

    for (let j = i; j < this.enemyCircles.length; j++) {
      this.enemyCircles[j].setScale(0);
    }
  }

  destroy() {
    this.circle.destroy();
    this.enemyCircles.forEach((circle) => circle.destroy());
  }
}