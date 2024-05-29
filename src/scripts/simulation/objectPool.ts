import { ObjectType, SimulationObjectInterface } from "./simulationObjectInterface";

export default class ObjectPool {
  pool: any = {};

  push(obj: SimulationObjectInterface) {
    if (!this.pool[obj.objType]) {
      this.pool[obj.objType] = [];
    }
    this.pool[obj.objType].push(obj);
  }

  get(objType: ObjectType): SimulationObjectInterface|undefined {
    if (!this.pool[objType]) {
      return undefined;
    }
    return this.pool[objType].pop();
  }
}