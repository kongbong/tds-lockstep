import FrameData from "../networkdata/frameData";
import { ObjectType, SimulationObjectInterface } from "./simulationObjectInterface";
import SimulationWorld from "./simulationWorld";
import PhysicsBody from "./physicsBody";
import { SimulationShip } from "./simulationShip";

const lifeTime = 1;
const velocityScale = 500;

export default class SimulationProjectile implements SimulationObjectInterface {  
  world: SimulationWorld;
  physicsBody: PhysicsBody;
    
  id: string;
  x: number;
  y: number;
  angle: number;
  objType: ObjectType;
  isRecycle: boolean = true;

  playerId: string;
  velocity: Phaser.Math.Vector2;
  timeLeft: number;
  hitted: boolean = false;
  isMyProjectile: boolean = false;
    
  constructor(
    playerId: string, 
    x: number, 
    y: number, 
    angle: number,
    isMyProjectile: boolean) {
    this.playerId = playerId;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.isMyProjectile = isMyProjectile;

    const rotation = Phaser.Math.DegToRad(this.angle);
    this.velocity = new Phaser.Math.Vector2(Math.cos(rotation), Math.sin(rotation));
    this.velocity.scale(velocityScale);
    
    this.timeLeft = lifeTime;
    this.objType = ObjectType.Projectile;    
  }
  
  onAddToSimulationWorld(world: SimulationWorld, id: string) {
    this.id = id;
    this.world = world;

    this.physicsBody = new PhysicsBody(this.world.physics.world, this.x, this.y);    
    this.world.physics.world.add(this.physicsBody);

    this.physicsBody.setCircle(20);
    this.physicsBody.setCollideWorldBounds(true, undefined, undefined, true);
    this.physicsBody.setVelocity(this.velocity.x, this.velocity.y);
    this.physicsBody.simulationObject = this;

    const enemyShips = Array<PhysicsBody>(...this.world.getObjsByType(ObjectType.Ship)
      .map((obj) => obj as SimulationShip)
      .filter((ship) => ship.playerId !== this.playerId)
      .map((ship) => ship.physicsBody));

    this.world.physics.add.overlap(
      this.physicsBody, 
      enemyShips, 
      (body1: any, body2: any) => {
        this.onHitProjectile(body1.simulationObject, body2.simulationObject);
        return this.onHitProjectile;
      }, 
      () => !this.hitted, 
      this);
  }

  onHitProjectile(projectile: any, ship: any) {
    console.log("hitProjectile", projectile, ship);
    this.hitted = true;
    this.world.removeObj(projectile.id);
    
    const shiObj = ship as SimulationShip;
    shiObj.hit(this.playerId);
  }
  
  setId(id: string): void {
    this.id = id;
  }
  
  destroy() {
    this.world.physics.world.remove(this.physicsBody);
  }
    
  update(frameData: FrameData) {
    const deltaTime = frameData.duration;
    this.timeLeft -= deltaTime / 1000;
    if (this.timeLeft < 0) {
      // time to die
      this.world.removeObj(this.id);
      return;
    }
  }

  postUpdate(): void {
    this.x = this.physicsBody.position.x;
    this.y = this.physicsBody.position.y;
  }
}