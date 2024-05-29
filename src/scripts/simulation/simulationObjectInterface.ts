import FrameData from "../networkdata/frameData";
import SimulationWorld from "./simulationWorld";

export enum ObjectType {
  Ship = 1,
  Projectile,
}

export interface SimulationObjectInterface {
  id: string;
  x: number;
  y: number;
  angle: number;
  objType: ObjectType;
  
  onAddToSimulationWorld(world: SimulationWorld, id: string): void;
  update(frameData: FrameData): void;
  postUpdate(): void;
  destroy(): void;
}