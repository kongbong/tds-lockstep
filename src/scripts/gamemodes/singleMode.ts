import InputData from "../input/inputData";
import PlayerInfo from "./playerinfo";
import GameModeInterface from "./gamemodeInterface";
import FrameData from "../network/frameData";

export default class SingleMode implements GameModeInterface {
  id: string;
  scene: Phaser.Scene;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  SPACE: Phaser.Input.Keyboard.Key;
  spaceDown: boolean = false;
  frameNo: number = 0;

  onNewPlayer: (info: PlayerInfo) => void;
  onRemovePlayer: (id: string) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.SPACE = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  startGame(): void {
    this.id = crypto.randomUUID();
    // add local player
    const playerInfo = new PlayerInfo();
    playerInfo.id = this.id;
    playerInfo.x = 600;
    playerInfo.y = 500;
    playerInfo.angle = 0;
    playerInfo.isLocal = true;

    this.onNewPlayer(playerInfo);
  }

  getFrameCount(): number {
    return 1;
  }

  getThisFrameDataAndAdvanceTime(dt: number): FrameData|undefined {
    const frameData = new FrameData();
    frameData.duration = dt;
    frameData.frame = this.frameNo;
    frameData.inputDatas = [];
    this.frameNo++;
    frameData.inputDatas.push(this.getInputData());
    return frameData;
  }

  getInputData(): InputData {
    const inputData = new InputData(); 
    inputData.id = this.id;
    if (this.cursor.up.isDown) {
      inputData.up = true;
    }
    if (this.cursor.down.isDown) {
      inputData.down = true;
    } 
    if (this.cursor.left.isDown) {
      inputData.left = true;
    }
    if (this.cursor.right.isDown) {
      inputData.right = true;
    }
    if (this.spaceDown) {
      if (Phaser.Input.Keyboard.JustUp(this.SPACE)) {
        this.spaceDown = false;
        inputData.fire = false;
      } else {
        inputData.fire = true;
      }
    } else {
      if (Phaser.Input.Keyboard.JustDown(this.SPACE)) {
        this.spaceDown = true;
        inputData.fire = true;
      } else {
        inputData.fire = false;      
      }
    }
    return inputData;
  }
}