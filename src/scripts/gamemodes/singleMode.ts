import InputData from "../input/inputData";
import InputGetterInterface from "../input/inputGetterInterface";
import { PlayerInfo, GameModeInterface } from "./gamemodeInterface";

export default class SingleMode implements GameModeInterface, InputGetterInterface {
  scene: Phaser.Scene;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  SPACE: Phaser.Input.Keyboard.Key;

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
    // add local player
    const playerInfo = new PlayerInfo();
    playerInfo.id = "MyName:" + crypto.randomUUID();
    playerInfo.x = 600;
    playerInfo.y = 500;
    playerInfo.angle = 0;
    playerInfo.isLocal = true;

    this.onNewPlayer(playerInfo);
  }

  update(dt: number): void {}

  getRemainDeltaTime(dt: number): number {
    return dt;
  }

  getInputFrame(id: string): InputData {
    const inputFrame = new InputData(); 
    if (this.cursor.up.isDown) {
      inputFrame.up = true;
    }
    if (this.cursor.down.isDown) {
      inputFrame.down = true;
    } 
    if (this.cursor.left.isDown) {
      inputFrame.left = true;
    }
    if (this.cursor.right.isDown) {
      inputFrame.right = true;
    }
    if (Phaser.Input.Keyboard.DownDuration(this.SPACE)) {
      inputFrame.fire = true;
    }
    return inputFrame;
  }
}