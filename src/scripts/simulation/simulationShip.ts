import FrameData from "../input/frameData";
import { ObjectType, SimulationObjectInterface } from "./simulationObjectInterface";
import SimulationWorld from './simulationWorld';
import SimulationProjectile from './simulationProjectile';

const fireRate = 3;

// This is ship gameObject class is simulated by deterministic.
export default class SimulationShip implements SimulationObjectInterface {
  world: SimulationWorld;
  id: string;
  playerId: string;
  x: number;
  y: number;
  angle: number;
  velocity: Phaser.Math.Vector2;
  angularVelocity: number;
  isLocal: boolean;
  objType: ObjectType;
  fireTime: number = 0;

  constructor(playerId: string, x: number, y: number, angle: number, isLocal: boolean, world: SimulationWorld) {
    this.world = world;
    this.playerId = playerId;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.velocity = new Phaser.Math.Vector2(0, 0);
    this.angularVelocity = 0;
    this.isLocal = isLocal;
    this.objType = ObjectType.Ship;
  }
  
  setId(id: string): void {
    this.id = id;
  }

  update(frameData: FrameData) {
    const deltaTime = frameData.duration;
    const inputData = frameData.inputDatas.find((inputData) => inputData.id === this.playerId);
    if (!inputData) return;

    if (inputData.left) {
      this.angularVelocity = -150;
    } else if (inputData.right) {
      this.angularVelocity = 150;
    } else {
      this.angularVelocity = 0;
    }

    if (inputData.up) {
      const rotation = Phaser.Math.DegToRad(this.angle);
      this.velocity.x = Math.cos(rotation) * 300;
      this.velocity.y = Math.sin(rotation) * 300;
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;    
    }

    this.fireTime -= deltaTime / 1000;
    if (inputData.fire) {      
      if (this.fireTime < 0) {
        this.fireTime = 1 / fireRate;
        // fire
        this.fire();
      }
    } else {
      if (this.fireTime < 0) {
        this.fireTime = 0;
      }
    }

    this.x += this.velocity.x * deltaTime / 1000;
    this.y += this.velocity.y * deltaTime / 1000;
    this.angle += this.angularVelocity * deltaTime / 1000;
  }

  // fire a projectile
  fire() { 
    const rad = Phaser.Math.DegToRad(this.angle);
    const startX = this.x + Math.cos(rad) * 30;
    const startY = this.y + Math.sin(rad) * 30;

    this.world.addObj(new SimulationProjectile(startX, startY, this.angle, this.world));
  }
}