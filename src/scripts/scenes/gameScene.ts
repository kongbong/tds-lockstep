import SimulationWorld from "../simulation/simulationWorld";
import SimulationShip from "../simulation/simulationShip";
import Ship from "../objects/ship";
import Minimap from "../objects/miniMap";
import GameModeInterface from "../gamemodes/gamemodeInterface";
import SingleMode from "../gamemodes/singleMode";
import MultiplayMode from "../gamemodes/multiplayMode";
import { SimulationObjectInterface } from "../simulation/simulationObjectInterface";
import SimulationProjectile from "../simulation/simulationProjectile";
import Projectile from "../objects/projectile";

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
  simulationBox: SimulationWorld;
  thrust: Phaser.GameObjects.Layer;
  minimap: Minimap;

  // objects
  playerShip: Ship|undefined;
  enemyShips: Ship[] = [];
  projectileGroup: Phaser.GameObjects.Group;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.loadAudios();    
    this.addMinimap(); 
    this.makeProjectileGroup();
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
  
  makeProjectileGroup() {
    this.projectileGroup = this.add.group({
      classType: Projectile,
      maxSize: 100,
      runChildUpdate: true,      
    });
  }

  startGame() {
    // Starts the game in multi player mode
    const gameMode = new MultiplayMode(this);
    this.gameMode = gameMode;

    this.simulationBox = new SimulationWorld(this, gameMode);
    this.simulationBox.onAddObj = this.onAddObj.bind(this);
    this.simulationBox.onRemoveObj = this.onRemoveObj.bind(this);
    this.simulationBox.onEndGame = this.onEndGame.bind(this);
  }
  
  playAudio(key: string) {
    this.audios[key].play({ volume: 0.2 });
  }

  onAddObj(simulationObj: SimulationObjectInterface) {
    if (simulationObj instanceof SimulationShip) {
      this.onAddShip(simulationObj);
    } else if (simulationObj instanceof SimulationProjectile) {      
      this.onAddProjectile(simulationObj);
    }
  }

  onAddShip(simulationShip: SimulationShip) {  
    console.log("onAddShip", simulationShip);
    const ship = new Ship(this, simulationShip);
    if (simulationShip.isLocal) {
      this.playerShip = ship;
      this.setCamera(ship);
    } else {
      this.enemyShips.push(ship);
    }
  }

  onAddProjectile(simulationProjectile: SimulationProjectile) {
    // Add projectile object
    const projectile = this.projectileGroup.get(simulationProjectile.x, simulationProjectile.y, "shot") as Projectile;
    projectile.simulationProjectile = simulationProjectile;
    projectile.setVisible(true);
    projectile.setActive(true);
  }
  
  setCamera(target: Ship) {
    this.cameras.main.setBackgroundColor(0xcccccc);
    this.cameras.main.startFollow(target, true, 0.05, 0.05, 0, 100);
  }
  
  onRemoveObj(objId: string) {
    let removed = false;
    if (objId === this.playerShip?.simulationShip.id) {
      this.playerShip?.destroy();
      this.playerShip = undefined;
      removed = true;
    } else {
      const ship = this.enemyShips.find((ship) => ship.simulationShip.id === objId);
      if (ship) {
        ship.destroy();
        this.enemyShips = this.enemyShips.filter((s) => s !== ship);
        removed = true;
      }
    }

    if (!removed) {
      // it is a projectile
      const projectile = this.projectileGroup.getChildren().find((projectile) => {
        return (projectile as Projectile).simulationProjectile.id === objId;
      });
      if (projectile) {
        this.projectileGroup.killAndHide(projectile);
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