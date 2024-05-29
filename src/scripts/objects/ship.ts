import GameScene from "../scenes/gameScene";
import { SimulationShip } from '../simulation/simulationShip';
import Particle from './particle';
import { DrawDepth } from './drawDepth';
import Explosion from './explosion';

// Ship represents the player or enemy main object
// it is just visual representation and it is simulated by SimulationShip
export default class Ship extends Phaser.GameObjects.Sprite {
  gameScene: GameScene;
  simulationShip: SimulationShip;
  died: boolean = false;

  constructor(scene: GameScene, simulationShip: SimulationShip) {
    super(scene, simulationShip.x, simulationShip.y, "ship1_1");
    scene.add.existing(this);
    this.gameScene = scene;
    this.simulationShip = simulationShip;
    // this will always draw on top.
    this.depth = DrawDepth.SHIP;

    this.simulationShip.onHit = this.onHit.bind(this);
    this.simulationShip.onDie.push(this.onDie.bind(this));

    this.tint = Math.random() * 0xffffff;    
    this.scene.events.on("update", this.update, this);
  }

  update() {    
    if (this.died) return;
    const lastX = this.x;
    const lastY = this.y;
    this.x = this.simulationShip.x;
    this.y = this.simulationShip.y;
    this.angle = this.simulationShip.angle;
    
    if ((lastX !== this.x || lastY !== this.y) && Phaser.Math.Between(1, 4) > 1) {
      this.gameScene.thrust.add(
        new Particle(this.scene, this.x, this.y, 0xffffff, 10)
      );
    }
  }

  onHit() {
    const explosion = this.scene.add
      .circle(this.x, this.y, 5)
      .setStrokeStyle(10, 0xffffff);
    explosion.depth = DrawDepth.EXPLOSION;
    this.scene.tweens.add({
      targets: explosion,
      radius: { from: 5, to: 20 },
      alpha: { from: 1, to: 0 },
      duration: 250,
      onComplete: () => {
        explosion.destroy();
      }
    });
  }

  onDie() {    
    // ship died
    // play explosion animation
    this.gameScene.audios.explosion.play();
    this.died = true;
    new Explosion(this.scene, this.x, this.y, 70);
  }
}