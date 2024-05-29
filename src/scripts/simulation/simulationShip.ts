import FrameData from "../networkdata/frameData";
import { ObjectType, SimulationObjectInterface } from "./simulationObjectInterface";
import SimulationWorld from './simulationWorld';
import SimulationProjectile from './simulationProjectile';
import PhysicsBody from "./physicsBody";

const fireRate = 3;
export const MaxHP = 5;

// This is ship gameObject class is simulated by deterministic.
export class SimulationShip implements SimulationObjectInterface {
  onHit: ()=>void;
  onDie: ((killerId: string)=>void)[] = [];

  world: SimulationWorld;  
  playerId: string;
  physicsBody: PhysicsBody;
  
  id: string;
  x: number;
  y: number;
  angle: number = 0;
  objType: ObjectType;

  hp: number = MaxHP;

  isLocal: boolean;
  fireTime: number = 0;
  died: boolean = false;

  constructor(playerId: string, x: number, y: number, angle: number, isLocal: boolean) {
    this.playerId = playerId;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.isLocal = isLocal;
    this.objType = ObjectType.Ship;    
  }

  onAddToSimulationWorld(world: SimulationWorld, id: string) {
    this.id = id;
    this.world = world;

    // if the ship is revived then already has physicsBody
    this.physicsBody = new PhysicsBody(this.world.physics.world, this.x, this.y);
    this.world.physics.world.add(this.physicsBody);
    this.physicsBody.setCircle(20);
    this.physicsBody.rotation = this.angle;
    this.physicsBody.setCollideWorldBounds(true, undefined, undefined, undefined);
    this.physicsBody.simulationObject = this;
  }  

  destroy() {
    console.log("destory ship");
    this.world.physics.world.disableBody(this.physicsBody);
  }

  update(frameData: FrameData) {
    if (this.died) return;

    const deltaTime = frameData.duration;
    const inputData = frameData.inputDatas.find((inputData) => inputData.id === this.playerId);
    if (!inputData) return;

    let angularVelocity = 0;

    if (inputData.left) {
      angularVelocity = -150;
    } else if (inputData.right) {
      angularVelocity = 150;
    } else {
      angularVelocity = 0;
    }
    this.physicsBody.setAngularVelocity(angularVelocity);

    if (inputData.up) {
      const rotation = Phaser.Math.DegToRad(this.angle);      
      this.physicsBody.setVelocity(Math.cos(rotation) * 300, Math.sin(rotation) * 300);
    } else {
      this.physicsBody.setVelocity(0, 0);
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
  }

  postUpdate() {
    this.x = this.physicsBody.position.x;
    this.y = this.physicsBody.position.y;
    this.angle = this.physicsBody.rotation;
  }

  // fire a projectile
  fire() { 
    const rad = Phaser.Math.DegToRad(this.angle);
    const startX = this.x + Math.cos(rad) * 30;
    const startY = this.y + Math.sin(rad) * 30;

    this.world.addObj(new SimulationProjectile(
      this.playerId, 
      startX, 
      startY, 
      this.angle, 
      this.isLocal));
  }

  // hit the damage
  hit(shooterId: string) {
    this.hp--;
    if (this.hp === 0) {
      // blow up
      this.Die(shooterId);
    } else {
      this.onHit();
    }
  }

  Die(shooterId: string) {
    this.died = true;
    this.world.physics.world.disableBody(this.physicsBody);
    this.onDie.forEach((onDie) => onDie(shooterId));
    this.world.removeObj(this.id);
  }
}