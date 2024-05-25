import SimulationBox from "../simulation/simulationBox";
import SimulationShip from "../simulation/simulationShip";
import Ship from "../objects/ship";
import Minimap from "../objects/miniMap";
import { GameModeInterface } from "../gamemodes/gamemodeInterface";
import SingleMode from "../gamemodes/singleMode";

class Audios {
  pick: Phaser.Sound.BaseSound;
  shot: Phaser.Sound.BaseSound;
  foeshot: Phaser.Sound.BaseSound;
  explosion: Phaser.Sound.BaseSound;
  asteroid: Phaser.Sound.BaseSound;
}

export default class GameScene extends Phaser.Scene {
  gameMode: GameModeInterface
  audios: Audios;
  simulationBox: SimulationBox;
  thrust: Phaser.GameObjects.Layer;
  minimap: Minimap;
  playerShip: Ship;
  enemyShips: Ship[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.loadAudios();    
    this.addMinimap(); 
    this.startGame();
    this.thrust = this.add.layer();
    
    this.simulationBox.start();    
  }

  loadAudios() {    
    this.audios = {
      pick: this.sound.add("pick"),
      shot: this.sound.add("shot"),
      foeshot: this.sound.add("foeshot"),
      explosion: this.sound.add("explosion"),
      asteroid: this.sound.add("asteroid"),
    };
  }

  addMinimap() {
    this.minimap = new Minimap(this, 120, 120, 100, 0x000000);
  }

  startGame() {
    // Starts the game in single player mode
    const singleMode = new SingleMode(this);
    this.gameMode = singleMode;

    this.simulationBox = new SimulationBox(this, singleMode, singleMode);
    this.simulationBox.onAddMyShip = this.onAddShip.bind(this);
    this.simulationBox.onAddEnemyShip = this.onAddShip.bind(this);    
    this.simulationBox.onRemoveMyShip = this.onRemoveShip.bind(this);
    this.simulationBox.onRemoveEnemyShip = this.onRemoveShip.bind(this);
    this.simulationBox.onEndGame = this.onEndGame.bind(this);
  }
  
  playAudio(key: string) {
    this.audios[key].play({ volume: 0.2 });
  }

  onAddShip(simulationShip: SimulationShip) {
    console.log("onAdd", simulationShip);

    const ship = new Ship(this, simulationShip);
    if (simulationShip.isPlayer) {
      this.playerShip = ship;
      this.setCamera(ship);
    } else {
      this.enemyShips.push(ship);
    }
  }
  
  setCamera(target: Ship) {
    this.cameras.main.setBackgroundColor(0xcccccc);
    this.cameras.main.startFollow(target, true, 0.05, 0.05, 0, 100);
  }
  
  onRemoveShip(shipId: string) {
    console.log("onRemove", shipId);
    if (shipId === this.playerShip.simulationShip.id) {
      this.playerShip.destroy();
    } else {
      const ship = this.enemyShips.find((ship) => ship.simulationShip.id === shipId);
      if (ship) {
        ship.destroy();
        this.enemyShips = this.enemyShips.filter((s) => s !== ship);
      }
    }
  }

  update(time: number, deltaTime: number) {
    this.simulationBox.update(deltaTime);
    this.minimap.update();
  }

  onEndGame() {
    this.scene.start("endGame");
  }
}