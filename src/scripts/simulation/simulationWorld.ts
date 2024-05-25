import PlayerInfo from "../gamemodes/playerinfo";
import GameModeInterface from "../gamemodes/gamemodeInterface";
import SimulationShip from "./simulationShip";
import { SimulationObjectInterface } from "./simulationObjectInterface";
import FrameData from "../network/frameData";

// Main Simulation Black Box
// It is doing simulation of the game world with Deterministic simulation
// suing frameData from the server
export default class SimulationWorld {
  onAddObj: (obj: SimulationObjectInterface) => void;
  onRemoveObj: (id: string) => void;
  onEndGame: () => void;

  scene: Phaser.Scene;
  gameMode: GameModeInterface;
  myPlayerId: string;
  lastObjId: number = 0;

  myShip: (SimulationShip | undefined) = undefined;
  enemyShips: SimulationShip[] = [];
  objs: any;

  constructor(scene: Phaser.Scene, gameMode: GameModeInterface) {
    this.scene = scene;
    this.gameMode = gameMode;
    this.objs = {};

    this.gameMode.onNewPlayer = this.onNewPlayer.bind(this);
    this.gameMode.onRemovePlayer = this.onRemovePlayer.bind(this);
    this.scene.game.events.on(Phaser.Core.Events.FOCUS, this.simulateAll.bind(this));
  }

  // Start Simulation
  start() { 
    // start gameMode
    this.gameMode.startGame();
  }   

  newObjId(): string {
    this.lastObjId++;
    return this.lastObjId.toString();
  }
  
  onNewPlayer(playerInfo: PlayerInfo) {
    const objId = this.newObjId();
    if (playerInfo.isLocal) {
      this.myPlayerId = playerInfo.id;
      this.myShip = new SimulationShip(objId, playerInfo.id, playerInfo.x, playerInfo.y, playerInfo.angle, true, this);
      this.addObj(this.myShip);
    } else {
      const enemyShip = new SimulationShip(objId, playerInfo.id, playerInfo.x, playerInfo.y, playerInfo.angle, false, this);
      this.enemyShips.push(enemyShip);
      this.addObj(enemyShip);
    }
  }

  addObj(obj: SimulationObjectInterface) {
    this.objs[obj.id] = obj;
    this.onAddObj(obj);
  }

  onRemovePlayer(playerId: string) {
    if (playerId === this.myPlayerId) {
      if (this.myShip) {
        const id = this.myShip.id;
        this.myShip = undefined;
        this.removeObj(id);
      }
      // End game after 1 second
      this.scene.time.delayedCall(1000, this.onEndGame, [], this);      
    } else {
      const enemyShip = this.enemyShips.find((ship) => ship.id === playerId);
      if (enemyShip) {
        const id = enemyShip.id;
        this.enemyShips = this.enemyShips.filter((ship) => ship.id !== playerId);
        this.removeObj(id);
      }
    }
  }

  removeObj(objId: string) {
    this.objs[objId] = undefined;
    this.onRemoveObj(objId);
  }
   
  // Simulation update
  update(deltaTime: number) {
    if (this.gameMode.getFrameCount() > 10) {
      // need to chase up
      this.simulateAll();
    }

    while(deltaTime > 0) {
      const frameData = this.gameMode.getThisFrameDataAndAdvanceTime(deltaTime);
      if (!frameData) {
        return;
      }
      this.updateObjs(frameData);
      deltaTime -= frameData.duration;
    }
  }
  
  simulateAll() {    
    // if the game is back on focus then we need to simulation for pending frames
    while (this.gameMode.getFrameCount() > 1) {
      const deltaTime = 60;
      const frameData = this.gameMode.getThisFrameDataAndAdvanceTime(deltaTime);
      if (!frameData) {
        return;
      }
      
      this.updateObjs(frameData);
    }
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