import { SimulationObjectInterface } from "../simulation/simulationObjectInterface";
import { GameModeInfo } from "./gameModeInfo";

export default interface GameModeInterface {
  onAddObj: (obj: SimulationObjectInterface) => void;
  onRemoveObj: (id: string) => void;
  onEndGame: () => void;

  initGame(gameInfo: GameModeInfo): void;
  startGame():void;
  update(dt: number): void;
}