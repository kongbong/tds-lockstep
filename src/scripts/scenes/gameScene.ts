import SimulationShip from "../simulation/simulationShip";
import Ship from "../objects/ship";
import Minimap from "../objects/miniMap";
import GameModeInterface from "../gamemodes/gamemodeInterface";
import CommonMode from "../gamemodes/commonMode";
import { SimulationObjectInterface } from "../simulation/simulationObjectInterface";
import SimulationProjectile from "../simulation/simulationProjectile";
import Projectile from "../objects/projectile";
import NetworkClientInterface from "../network/ConnectionInterface";
import { GameModeInfo, GameModeType } from "../gamemodes/gameModeInfo";
import { ConnectionType, makeConnection } from "../network/connectionFactory";
import { DrawDepth } from "../objects/drawDepth";

class Audios {
  pick: Phaser.Sound.BaseSound;
  shot: Phaser.Sound.BaseSound;
  foeshot: Phaser.Sound.BaseSound;
  explosion: Phaser.Sound.BaseSound;
  asteroid: Phaser.Sound.BaseSound;
}

export default class GameScene extends Phaser.Scene {
  myClientID: string;
  conn: NetworkClientInterface;
  gameMode: GameModeInterface|undefined;

  audios: Audios;
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
    this.myClientID = crypto.randomUUID();

    this.loadAudios();    
    this.addMinimap(); 
    this.makeProjectileGroup();
    this.setupGame(GameModeType.ONLINE_PVP);
    this.thrust = this.add.layer();
    this.thrust.depth = DrawDepth.THRUST;
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

  setupGame(modeType: GameModeType) {
    switch (modeType) {
      case GameModeType.LOCAL:
        this.conn = makeConnection(ConnectionType.LOCAL);
        break;
      case GameModeType.ONLINE_PVP:
        this.conn = makeConnection(ConnectionType.SOCKETIO);
        break;
    }
    this.conn.onRecvGameInfo = this.initGame.bind(this);
    this.conn.onRecvAllJoin = this.allJoin.bind(this);
    this.conn.onRecvStartGame = this.startGame.bind(this);
    this.conn.connect(this.myClientID, undefined);
  }

  initGame(gameInfo: GameModeInfo) {
    switch (gameInfo.type) {
      case GameModeType.LOCAL:
        this.initLocalGame(gameInfo);
        break;
      case GameModeType.ONLINE_PVP:
        this.initOnlinePVPGame(gameInfo);
        break;
    }
  }

  initLocalGame(gameInfo: GameModeInfo) {
    this.gameMode = new CommonMode(this, this.myClientID, this.conn);
    this.hookupGameMode(this.gameMode, gameInfo);    
  }
  
  initOnlinePVPGame(gameInfo: GameModeInfo) {
    this.gameMode = new CommonMode(this, this.myClientID, this.conn);
    this.hookupGameMode(this.gameMode, gameInfo);    
  }

  hookupGameMode(gameMode: GameModeInterface, gameInfo: GameModeInfo) {
    // Starts the game
    gameMode.onAddObj = this.onAddObj.bind(this);
    gameMode.onRemoveObj = this.onRemoveObj.bind(this);
    gameMode.onEndGame = this.onEndGame.bind(this);

    gameMode.initGame(gameInfo);
  }

  // all players joined, will start in 3sec
  allJoin() {
    console.log("allJoin");
    this.showingCountDown(3);
  }

  showingCountDown(sec: number) {
    const width = +this.sys.game.config.width;
    const height = +this.sys.game.config.height;
    const center_width = width / 2;
    const center_height = height / 2;

    const message = sec === 0 ? "Start!" : sec.toString();

    const text = this.add
      .bitmapText(
        center_width,
        center_height,
        "wendy",
        message,
        400
      )      
      .setOrigin(0.5);
    text.tint = 0xff0000;

    // alpha 0 -> 1
    // Scale 1.5 -> 1
    this.tweens.add({
      targets: text,
      duration: 1000,
      alpha: { from: 0, to: 1 },
      scale: { from: 1, to: 0.5 },
      onComplete: () => {
        text.destroy();
        if (sec > 0) {
          this.showingCountDown(sec - 1);
        }
      },
    });
  }

  startGame() {
    console.log("startGame");
    this.gameMode?.startGame();
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
    this.conn.update(deltaTime);
    if (this.gameMode) {
      this.gameMode.update(deltaTime);
    }
    this.minimap.update();
  }

  onEndGame() {
    this.scene.start("endGame");
  }
}