import { SimulationObjectInterface } from "./simulationObjectInterface";
import FrameDataGetter from "../input/frameDataGetter";
import FrameData from "../input/frameData";

// each simution update time 10ms
const fixedUpdateTime = 10;

// Main Simulation Black Box
// It is doing simulation of the game world with Deterministic simulation
// suing frameData from the server
export default class SimulationWorld {
  onAddObj: (obj: SimulationObjectInterface) => void;
  onRemoveObj: (id: string) => void;

  frameGetter: FrameDataGetter;
  isStarted: boolean = false;
  lastObjId: number = 0;

  acculatedTime: number = 0;

  objs: any;

  constructor(frameGetter: FrameDataGetter) {
    this.frameGetter = frameGetter;  
    this.objs = {};
  }

  // Start Simulation
  start() {
    this.isStarted = true;
  }   

  newObjId(): string {
    this.lastObjId++;
    return this.lastObjId.toString();
  }

  addObj(obj: SimulationObjectInterface) {
    obj.setId(this.newObjId());
    this.objs[obj.id] = obj;
    this.onAddObj(obj);
  }

  removeObj(objId: string) {
    this.objs[objId] = undefined;
    this.onRemoveObj(objId);
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
  }

  runSingleUpdate(dt: number): number {
    const frameData = this.frameGetter.getFrameData(dt);
    if (!frameData) {
      return dt;
    }

    this.updateObjs(frameData);
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
}