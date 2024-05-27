import GameModeInterface from "./gamemodeInterface";
import SimulationWorld from "../simulation/simulationWorld";
import { SimulationObjectInterface } from "../simulation/simulationObjectInterface";
import { GameModeInfo } from "./gameModeInfo";
import SimulationShip from "../simulation/simulationShip";
import InputSendRecv from "../network/inputSendRecv";
import ConnectionInterface from "../network/ConnectionInterface";
import NewPlayerInfo from "../networkdata/newPlayerInfo";

export default class CommonMode implements GameModeInterface {
  onAddObj: (obj: SimulationObjectInterface) => void;
  onRemoveObj: (id: string) => void;
  onEndGame: () => void;
  
  world: SimulationWorld;
  inputSendRecv: InputSendRecv;

  myPlayerId: string;
  myShip: (SimulationShip | undefined) = undefined;
  ships: any = {};
  
  constructor(scene: Phaser.Scene, myPlayerId: string, conn: ConnectionInterface) {    
    this.myPlayerId = myPlayerId;
    this.inputSendRecv = new InputSendRecv(myPlayerId, scene, conn);
    conn.OnRecvNewPlayer = this.onRecvNewPlayer.bind(this);
    conn.onRemovePlayer = this.onRemovePlayer.bind(this);
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

    // add player ships
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
        } else {
          this.ships[playerInfo.playerId] = ship;
        }
        this.world.addObj(ship);
      });
    }
  }

  onRecvNewPlayer(info: NewPlayerInfo): void {
    console.log("onRecvNewPlayer", info);
    const ship = this.ships[info.oldPlayerId];
    ship.playerId = info.newPlayerId;
    this.ships[info.oldPlayerId] = undefined;
    this.ships[info.newPlayerId] = ship;
  }

  onRemovePlayer(playerId: string): void {
    console.log("onRemovePlayer", playerId);
    if (this.myShip && this.myShip.playerId === playerId) {
      // disconnected my connection
      this.world.removeObj(this.myShip.id);
      this.myShip = undefined;
      this.onEndGame();
    } else {
      const ship = this.ships[playerId];
      if (ship) {
        this.world.removeObj(ship.id);
        this.ships[playerId] = undefined;
      }
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