import InputData from "../input/inputData";
import InputGetterInterface from "../input/inputGetterInterface";

// This is ship gameObject class is simulated by deterministic.
export default class SimulationShip {
  id: string;
  x: number;
  y: number;
  angle: number;
  velocity: Phaser.Math.Vector2;
  angularVelocity: number;
  isPlayer: boolean;
  inputDataGetter: InputGetterInterface;

  constructor(id: string, x: number, y: number, angle: number, isPlayer: boolean, inputDataGetter: InputGetterInterface) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.velocity = new Phaser.Math.Vector2(0, 0);
    this.angularVelocity = 0;
    this.isPlayer = isPlayer;
    this.inputDataGetter = inputDataGetter;
  }

  update(deltaTime: number) {
    const inputData = this.inputDataGetter.getInputFrame(this.id);
    if (!inputData) return;

    if (inputData.left) {
      this.angularVelocity = -150;
    } else if (inputData.right) {
      this.angularVelocity = 150;
    } else {
      this.angularVelocity = 0;
    }

    if (inputData.up) {
      let rotation = Phaser.Math.DegToRad(this.angle);
      this.velocity.x = Math.cos(rotation) * 300;
      this.velocity.y = Math.sin(rotation) * 300;
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;    
    }

    this.x += this.velocity.x * deltaTime / 1000;
    this.y += this.velocity.y * deltaTime / 1000;
    this.angle += this.angularVelocity * deltaTime / 1000;
  }
}