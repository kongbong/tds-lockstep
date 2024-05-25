import GameScene from "../scenes/gameScene";
import SimulationShip from '../simulation/simulationShip';
import Particle from './particle';

// Ship represents the player or enemy main object
// it is just visual representation and it is simulated by SimulationShip
export default class Ship extends Phaser.GameObjects.Sprite {
  gameScene: GameScene;
  simulationShip: SimulationShip;

  constructor(scene: GameScene, simulationShip: SimulationShip) {
    super(scene, simulationShip.x, simulationShip.y, "ship1_1");
    scene.add.existing(this);
    this.gameScene = scene;
    this.simulationShip = simulationShip;

    this.tint = Math.random() * 0xffffff;    
    this.scene.events.on("update", this.update, this);
  }

  update() {
    this.x = this.simulationShip.x;
    this.y = this.simulationShip.y;
    this.angle = this.simulationShip.angle;
    
    if (Phaser.Math.Between(1, 4) > 1) {
      this.gameScene.thrust.add(
        new Particle(this.scene, this.x, this.y, 0xffffff, 10)
      );
    }
  }
}