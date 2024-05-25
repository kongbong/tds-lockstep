import { PlayerInfo, GameModeInterface } from "../gamemodes/gamemodeInterface";
import InputGetterInterface from "../input/inputGetterInterface";
import SimulationShip from "./simulationShip";

// Main Simulation Black Box
// It is doing simulation of the game world with Deterministic simulation
// suing frameData from the server
export default class SimulationBox {
  onAddMyShip: (ship: SimulationShip) => void;
  onAddEnemyShip: (ship: SimulationShip) => void;
  onRemoveMyShip: (id: string) => void;
  onRemoveEnemyShip: (id: string) => void;
  onEndGame: () => void;

  scene: Phaser.Scene;
  gameMode: GameModeInterface;
  inputGetter: InputGetterInterface;
  myId: string;
  myShip: (SimulationShip | undefined) = undefined;
  enemyShips: SimulationShip[] = [];

  constructor(scene: Phaser.Scene, gameMode: GameModeInterface, inputGetter: InputGetterInterface) {
    this.scene = scene;
    this.gameMode = gameMode;
    this.inputGetter = inputGetter;

    this.gameMode.onNewPlayer = this.onNewPlayer.bind(this);
    this.gameMode.onRemovePlayer = this.onRemovePlayer.bind(this);    
  }

  // Start Simulation
  start() { 
    // start gameMode
    this.gameMode.startGame();
  }   
  
  onNewPlayer(playerInfo: PlayerInfo) {
    if (playerInfo.isLocal) {
      this.myId = playerInfo.id;
      this.myShip = new SimulationShip(playerInfo.id, playerInfo.x, playerInfo.y, playerInfo.angle, true, this.inputGetter);
      this.onAddMyShip(this.myShip);
    } else {
      const enemyShip = new SimulationShip(playerInfo.id, playerInfo.x, playerInfo.y, playerInfo.angle, false, this.inputGetter);
      this.enemyShips.push(enemyShip);
      this.onAddEnemyShip(enemyShip);
    }
  }

  onRemovePlayer(id: string) {
    if (id === this.myId) {
      this.myShip = undefined;
      // End game after 1 second
      this.scene.time.delayedCall(1000, this.onEndGame, [], this);      
    } else {
      const enemyShip = this.enemyShips.find((ship) => ship.id === id);
      if (enemyShip) {
        this.enemyShips = this.enemyShips.filter((ship) => ship.id !== id);
        this.onRemoveEnemyShip(id);
      }
    }
  }
    
  // Simulation update
  update(deltaTime: number) {
    deltaTime = this.gameMode.getRemainDeltaTime(deltaTime);

    this.myShip?.update(deltaTime);
    this.enemyShips.forEach((ship) => {
      ship.update(deltaTime);
    });    

    // lastly, update gameMode
    this.gameMode.update(deltaTime);
  }
}