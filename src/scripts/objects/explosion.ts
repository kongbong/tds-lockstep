import { DrawDepth } from "./drawDepth";

export default class Explosion {
  scene: Phaser.Scene;
  radius: number;
  x: number;
  y: number;
  lights: Phaser.GameObjects.PointLight[];

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number = 5, min: number = 5, max: number = 7) {
    this.scene = scene;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.lights = Array(Phaser.Math.Between(min, max))
      .fill(0)
      .map((_, i) => {
        const offsetX =
          this.x + Phaser.Math.Between(-this.radius / 2, this.radius / 2);
        const offsetY =
          this.y + Phaser.Math.Between(-this.radius / 2, -this.radius / 2);
        const color = Phaser.Math.Between(0xff0000, 0xffffcc);
        const radius = Phaser.Math.Between(this.radius / 2, this.radius);
        const intensity = Phaser.Math.Between(0.3, 0.8);
        const light = scene.lights.addPointLight(
          offsetX,
          offsetY,
          color,
          radius,
          intensity
        );
        light.depth = DrawDepth.EXPLOSION;
        return light;
      });
    this.init();
  }

  /*
  This adds a simple effect to the explosion to shrink the lights.
  */
  init() {
    this.scene.tweens.add({
      targets: this.lights,
      duration: Phaser.Math.Between(600, 1000),
      scale: { from: 1, to: 0 },
    });
  }
}