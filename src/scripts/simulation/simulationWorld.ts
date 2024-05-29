import { ObjectType, SimulationObjectInterface } from "./simulationObjectInterface";
import FrameDataGetter from "../networkdata/frameDataGetter";
import FrameData from "../networkdata/frameData";
import { ArcadePhysics } from "arcade-physics";
import { Body as PhysicsBody } from 'arcade-physics/lib/physics/arcade/Body';
import SimulationProjectile from "./simulationProjectile";
import Timer from "../timer/timer";

// each simution update time 10ms
const fixedUpdateTime = 10;

// Main Simulation Black Box
// It is doing simulation of the game world with Deterministic simulation
// suing frameData from the server
export default class SimulationWorld {
  onAddObj: (obj: SimulationObjectInterface) => void;
  onRemoveObj: (id: string) => void;
  
  physics: ArcadePhysics;
  timer: Timer;

  frameGetter: FrameDataGetter;
  isStarted: boolean = false;
  lastObjId: number = 0;

  worldSimulationTime: number = 0;
  acculatedTime: number = 0;

  objs: any = {};
  objTypeMap: any = {}; 

  constructor(frameGetter: FrameDataGetter) {
    this.frameGetter = frameGetter;  

    this.initPhysicsWorld();    
  }

  initPhysicsWorld() {
    this.physics = new ArcadePhysics({
      gravity: { x: 0, y: 0 },
      width: 10000,
      height: 10000,
    });
    this.physics.world.on("worldbounds", this.onWorldBounds.bind(this));    
  }

  onWorldBounds(body: any) {
    const physicsBody = body as PhysicsBody;
    if (physicsBody) {
      const obj = body.simulationObject;
      if (obj instanceof SimulationProjectile) {
        this.removeObj(obj.id);
      }
    }
  }

  // Start Simulation
  start() {
    this.isStarted = true;
    this.worldSimulationTime = 0;
    this.timer = new Timer(this.worldSimulationTime);
  }   

  newObjId(): string {
    this.lastObjId++;
    return this.lastObjId.toString();
  }

  addObj(obj: SimulationObjectInterface) {
    obj.onAddToSimulationWorld(this, this.newObjId());
    this.objs[obj.id] = obj;
    this.onAddObj(obj);
    
    if (!this.objTypeMap[obj.objType]) {
      this.objTypeMap[obj.objType] = {};
    }
    this.objTypeMap[obj.objType][obj.id] = obj;
  }

  removeObj(objId: string) {
    const obj = this.objs[objId];
    if (obj) {
      delete this.objTypeMap[obj.objType][objId];
      obj.destroy();
      delete this.objs[objId];
      this.onRemoveObj(objId);
    }    
  }

  getObjsByType(objType: ObjectType): SimulationObjectInterface[] {
    return Object.values(this.objTypeMap[objType]);
  }
   
  // Simulation update
  update(deltaTime: number) {
    if (!this.isStarted) return;

    this.acculatedTime += deltaTime;

    // if remain frame is so long then we need to simulate until single frame is remained.
    while (this.frameGetter.getRemainTime() > 100) {
      this.runSingleUpdate(fixedUpdateTime);
    }

    while (this.acculatedTime > fixedUpdateTime) {
      this.acculatedTime -= this.runSingleUpdate(fixedUpdateTime);
    }

    this.physics.world.postUpdate();
    this.postUpdateObjs();
  }

  runSingleUpdate(dt: number): number {
    const frameData = this.frameGetter.getFrameData(dt);
    if (!frameData) {
      return dt;
    }
    this.worldSimulationTime += frameData.duration;
    this.timer.update(frameData.duration);

    this.updateObjs(frameData);
    this.physics.world.update(this.worldSimulationTime, dt);   
    
    this.frameGetter.advanceTime(frameData.duration);
    return frameData.duration;
  }

  updateObjs(frameData: FrameData) {    
    for (const objId in this.objs) {
      const obj = this.objs[objId];
      if (obj) {
        obj.update(frameData);
      }
    }
  }

  postUpdateObjs() {
    for (const objId in this.objs) {
      const obj = this.objs[objId];
      if (obj) {
        obj.postUpdate();
      }
    }
  }
}