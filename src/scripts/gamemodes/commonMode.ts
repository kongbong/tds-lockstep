import GameModeInterface from "./gamemodeInterface";
import SimulationWorld from "../simulation/simulationWorld";
import { SimulationObjectInterface } from "../simulation/simulationObjectInterface";
import { GameModeInfo } from "./gameModeInfo";
import SimulationShip from "../simulation/simulationShip";
import InputSendRecv from "../network/inputSendRecv";
import ConnectionInterface from "../network/ConnectionInterface";

export default class CommonMode implements GameModeInterface {
  onAddObj: (obj: SimulationObjectInterface) => void;
  onRemoveObj: (id: string) => void;
  onEndGame: () => void;

  world: SimulationWorld;
  inputSendRecv: InputSendRecv;

  myPlayerId: string;
  myShip: (SimulationObjectInterface | undefined) = undefined;

  constructor(scene: Phaser.Scene, myPlayerId: string, conn: ConnectionInterface) {
    this.myPlayerId = myPlayerId;
    this.inputSendRecv = new InputSendRecv(myPlayerId, scene, conn);
  }

  initGame(gameInfo: GameModeInfo): void {
    this.world = new SimulationWorld(this.inputSendRecv.getFrameGetter());
    this.world.onAddObj = this.onAddObj.bind(this);
    this.world.onRemoveObj = (id: string) => {
      this.onRemoveObj(id);
      if (this.myShip && this.myShip.id === id) {
        this.myShip = undefined;
        this.onEndGame();
      }
    };

    // add local player
    if (gameInfo.playerStartingInfos) {
      gameInfo.playerStartingInfos.forEach((playerInfo) => {
        const isLocal = playerInfo.playerId === this.myPlayerId;
        const ship = new SimulationShip(
          playerInfo.playerId, 
          playerInfo.x, 
          playerInfo.y, 
          playerInfo.angle, 
          isLocal, 
          this.world);
        if (isLocal) {
          this.myShip = ship;
        }
        this.world.addObj(ship);
      });
    }
  }

  startGame(): void {
    this.world.start();
  }
  
  update(dt: number): void {
    this.inputSendRecv.update(dt);
    this.world.update(dt);
  }
}