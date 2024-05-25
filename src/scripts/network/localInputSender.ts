import NetworkClientInterface from "./ConnectionInterface";
import InputData from "../input/inputData";

export default class LocalInputSender {
  id: string;
  scene: Phaser.Scene;
  socket: NetworkClientInterface;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  SPACE: Phaser.Input.Keyboard.Key;

  constructor(id: string, scene: Phaser.Scene, socket: NetworkClientInterface) {
    this.id = id;
    this.scene = scene;
    this.socket = socket;
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.SPACE = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  sendLocalInput() {
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
    if (Phaser.Input.Keyboard.DownDuration(this.SPACE)) {
      inputData.fire = true;
    }
    this.socket.sendInputData(inputData);
  }
}