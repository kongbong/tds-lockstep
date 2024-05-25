import FrameDataGetter from '../input/frameDataGetter';
import ConnectionInterface from './ConnectionInterface';
import LocalInputSender from './localInputSender';

const inputSendInterval = 50; // ms

// InputSendRecv receives FrameData and sends InputData preoidically
export default class InputSendRecv {
  remainInterval: number = 0;

  conn: ConnectionInterface;
  frameDataGetter: FrameDataGetter;
  inputSender: LocalInputSender;

  constructor(id: string, scene: Phaser.Scene, conn: ConnectionInterface) {
    this.remainInterval = inputSendInterval;

    this.conn = conn;
    this.frameDataGetter = new FrameDataGetter();
    this.inputSender = new LocalInputSender(id, scene, conn);
    
    this.conn.onFrameData = (frameData) => {
      this.frameDataGetter.pushFrameData(frameData);
    };
  }

  update(dt: number): void {
    this.remainInterval -= dt;
    if (this.remainInterval <= 0) {
      this.inputSender.sendLocalInput();
    }
  }

  getFrameGetter(): FrameDataGetter {
    return this.frameDataGetter;
  }
  
}