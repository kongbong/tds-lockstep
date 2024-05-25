import FrameData from "../network/frameData";
import { ObjectType, SimulationObjectInterface } from "./simulationObjectInterface";
import SimulationWorld from "./simulationWorld";

const lifeTime = 1;
const velocityScale = 500;

export default class SimulationProjectile implements SimulationObjectInterface {
  id: string;
  x: number;
  y: number;
  angle: number;
  velocity: Phaser.Math.Vector2;
  timeLeft: number;
  objType: ObjectType;
  world: SimulationWorld;
  
  constructor(id: string, x: number, y: number, angle: number, simulationWorld: SimulationWorld) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = angle;

    const rotation = Phaser.Math.DegToRad(this.angle);
    this.velocity = new Phaser.Math.Vector2(Math.cos(rotation), Math.sin(rotation));
    this.velocity.scale(velocityScale);
    
    this.timeLeft = lifeTime;
    this.objType = ObjectType.Projectile;
    this.world = simulationWorld;
  }
    
  update(frameData: FrameData) {
    const deltaTime = frameData.duration;
    this.timeLeft -= deltaTime / 1000;
    if (this.timeLeft < 0) {
      // time to die
      this.world.removeObj(this.id);
      return;
    }
    this.x += this.velocity.x * deltaTime / 1000;
    this.y += this.velocity.y * deltaTime / 1000;
  }
}