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

  setId(id: string): void;
}