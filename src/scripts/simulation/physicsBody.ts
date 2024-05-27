import { Body as OriginBody } from "arcade-physics/lib/physics/arcade/Body"
import { SimulationObjectInterface } from './simulationObjectInterface';

export default class PhysicsBody extends OriginBody {
  simulationObject: SimulationObjectInterface;
}