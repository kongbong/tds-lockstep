import NetworkClientInterface from "../network/networkClientInterface";
import SocketIOClient from "../network/socketioclient";
import FrameData from "../network/frameData";
import PlayerInfo from "./playerinfo"
import GameModeInterface from "./gamemodeInterface";
import LocalInputSender from "../network/localInputSender";

export default class MultiplayMode implements GameModeInterface {
  playerId: string
  scene: Phaser.Scene;
  socket: NetworkClientInterface; 
  frameDatas: FrameData[] = [];
  localInputSender: LocalInputSender;
  remainTime: number = 0;

  onNewPlayer: (info: PlayerInfo) => void;
  onRemovePlayer: (id: string) => void;

  constructor(scene: Phaser.Scene) {
    this.playerId = crypto.randomUUID();
    this.scene = scene;        
  }

  startGame(): void {
    this.socket = new SocketIOClient();
    this.socket.onNewPlayer = this.onNewPlayer;
    this.socket.onRemovePlayer = this.onRemovePlayer;
    this.socket.onFrameData = (frameData: FrameData) => {
      this.frameDatas.push(frameData);
    };
    this.localInputSender = new LocalInputSender(this.playerId, this.scene, this.socket);
    this.socket.connect(this.playerId, undefined);
  }
  
  getFrameCount(): number {
    return this.frameDatas.length;
  }
  
  getThisFrameDataAndAdvanceTime(dt: number): FrameData|undefined {
    if (this.frameDatas.length === 0) {
      return undefined;
    }
    // if there are multiple frames, we need to speed up
    if (this.frameDatas.length > 1) {
      dt *= 1.1;
    }
    const thisFrameData = new FrameData();
    thisFrameData.frame = this.frameDatas[0].frame;
    thisFrameData.inputDatas = this.frameDatas[0].inputDatas;    
    thisFrameData.duration = this.getRemainDeltaTime(dt);
    this.advanceTime(dt);
    return thisFrameData;
  }

  advanceTime(dt: number): void {
    if (this.frameDatas.length === 0) {
      return;
    }
    this.frameDatas[0].duration -= dt;
    if (this.frameDatas[0].duration <= 0) {
      this.frameDatas.shift();
      // send local input for next frame
      this.localInputSender.sendLocalInput();
    }
  }

  getRemainDeltaTime(dt: number): number {
    if (this.frameDatas.length === 0) {
      return dt;
    }

    let remainTime = this.frameDatas[0].duration;
    if (remainTime < dt) {
      dt = remainTime;
    }
    return dt;
  }
}
 