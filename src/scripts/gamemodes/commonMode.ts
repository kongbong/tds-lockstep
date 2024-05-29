import GameModeInterface from "./gamemodeInterface";
import SimulationWorld from "../simulation/simulationWorld";
import { SimulationObjectInterface } from "../simulation/simulationObjectInterface";
import { GameModeInfo } from "./gameModeInfo";
import { SimulationShip } from "../simulation/simulationShip";
import InputSendRecv from "../network/inputSendRecv";
import ConnectionInterface from "../network/ConnectionInterface";
import NewPlayerInfo from "../networkdata/newPlayerInfo";
import { EndGameType } from "./endGameType";

const GoalScore = 2;

export default class CommonMode implements GameModeInterface {
  onAddObj: (obj: SimulationObjectInterface) => void;
  onRemoveObj: (id: string) => void;
  onEndGame: (endType: EndGameType) => void;
  onUpdateScore: (score: number) => void;
  
  initGameInfo: GameModeInfo;

  world: SimulationWorld;
  inputSendRecv: InputSendRecv;

  myPlayerId: string;
  myShip: (SimulationShip | undefined) = undefined;
  ships: any = {};
  scoreMap: any = {};
  started: boolean = false;
  
  constructor(scene: Phaser.Scene, myPlayerId: string, conn: ConnectionInterface) {    
    this.myPlayerId = myPlayerId;
    this.inputSendRecv = new InputSendRecv(myPlayerId, scene, conn);
    conn.OnRecvNewPlayer = this.onRecvNewPlayer.bind(this);
    conn.onRemovePlayer = this.onRemovePlayer.bind(this);
  }

  initGame(gameInfo: GameModeInfo): void {
    this.initGameInfo = gameInfo;
    this.world = new SimulationWorld(this.inputSendRecv.getFrameGetter());
    this.world.onAddObj = this.internal_onAddObj.bind(this);
    this.world.onRemoveObj = this.internal_onRemoveObj.bind(this);

    // add player ships
    if (gameInfo.playerStartingInfos) {
      gameInfo.playerStartingInfos.forEach((playerInfo) => {        
        this.spawnShip(playerInfo.playerId);
      });
    }
  }

  onRecvNewPlayer(info: NewPlayerInfo): void {
    const ship = this.ships[info.oldPlayerId];
    ship.playerId = info.newPlayerId;
    delete this.ships[info.oldPlayerId];
    this.ships[info.newPlayerId] = ship;

    // change playerId in InitGameInfo
    const oldInfo = this.initGameInfo.playerStartingInfos.find(
      (playerInfo) => playerInfo.playerId === info.oldPlayerId);
    if (oldInfo) {
      oldInfo.playerId = info.newPlayerId;
    }
  }

  onRemovePlayer(playerId: string): void {
    console.log("onRemovePlayer", playerId);
    if (this.myShip && this.myShip.playerId === playerId) {
      // disconnected my connection
      this.world.removeObj(this.myShip.id);
      this.myShip = undefined;
      this.endGame(EndGameType.DISCONNECTED);
    } else {
      const ship = this.ships[playerId];
      if (ship) {
        this.world.removeObj(ship.id);
        delete this.ships[playerId];
      }
    }
  }

  internal_onAddObj(obj: SimulationObjectInterface): void {
    this.onAddObj(obj);

    if (obj instanceof SimulationShip) {
      if (obj.playerId === this.myPlayerId) {
        this.myShip = obj;
      } else {
        this.ships[obj.playerId] = obj;
      }

      // if ship is killed check if my ship killed it.
      obj.onDie.push((killerId) => {
        this.onKillOtherShip(killerId, obj);
      });
    }
  }

  internal_onRemoveObj(id: string): void {
    this.onRemoveObj(id);    
    if (this.myShip && this.myShip.id === id) {
      this.myShip = undefined;
    } else if (this.ships[id]) {
      delete this.ships[id];
    }
  }

  onKillOtherShip(killerId:string, ship: SimulationShip): void {
    if (this.scoreMap[killerId]) {
      this.scoreMap[killerId]++;
    } else {
      this.scoreMap[killerId] = 1;
    }
    if (this.scoreMap[killerId] === GoalScore) {
      if (killerId === this.myPlayerId) {
        this.endGame(EndGameType.WIN);
      } else {
        this.endGame(EndGameType.LOSE);
      }
    } else if (killerId === this.myPlayerId) {
      this.onUpdateScore(this.scoreMap[killerId]);
    }

    // respawn ship
    this.world.timer.setTimer(5000, () => {
      this.respawnShip(ship.playerId);
    }, this);
  }

  endGame(endGameType: EndGameType): void {
    this.started = false;
    this.onEndGame(endGameType);
  }

  respawnShip(playerId: string) {
    this.spawnShip(playerId);
  }

  spawnShip(playerId: string) {
    const info = this.initGameInfo.playerStartingInfos.find(
      (playerInfo) => playerInfo.playerId === playerId);

    if (!info) return;
    
    const isLocal = info.playerId === this.myPlayerId;
    const ship = new SimulationShip(
      info.playerId, 
      info.x, 
      info.y, 
      info.angle, 
      isLocal);
    this.world.addObj(ship);
  }

  startGame(): void {
    this.started = true;
    this.world.start();
  }
  
  update(dt: number): void {
    if (!this.started) return;
    this.inputSendRecv.update(dt);
    this.world.update(dt);
  }
}