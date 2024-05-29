import { SimulationObjectInterface } from "../simulation/simulationObjectInterface";
import { GameModeInfo } from "./gameModeInfo";
import { EndGameType } from "./endGameType";

export default interface GameModeInterface {
  onAddObj: (obj: SimulationObjectInterface) => void;
  onRemoveObj: (id: string) => void;
  onEndGame: (endType: EndGameType) => void;
  onUpdateScore: (score: number) => void;

  initGame(gameInfo: GameModeInfo): void;
  startGame():void;
  update(dt: number): void;
}