import { GameModeInfo, GameModeType } from '../gamemodes/gameModeInfo';
import FrameData from '../networkdata/frameData';
import InputData from '../networkdata/inputData';
import ConnectionInterface from './ConnectionInterface';
import NewPlayerInfo from "../networkdata/newPlayerInfo";

const allJoinInterval = 1000; // 1sec waiting for ready
const readyInterval = 3000; // 3sec waiting for start
const recvFrameInterval = 50; //ms

enum Status {
  BEGIN,
  ALLJOIN,
  START,
}

export default class LocalConnection implements ConnectionInterface {
  onRecvGameInfo: (info: GameModeInfo) => void;
  OnRecvNewPlayer: (info: NewPlayerInfo) => void;
  onRecvAllJoin: () => void;
  onRecvStartGame: () => void;
  onRemovePlayer: (playerId: string) => void;
  onFrameData: (frameData: FrameData) => void;

  remainInterval: number = 0;
  lastFrame: number = 0;
  localInputData:InputData;
  status: Status = Status.BEGIN;

  connect(playerId: string, addr: string | undefined): void {
    this.remainInterval = allJoinInterval;
    // make single gameinfo
    const gameInfo = new GameModeInfo();
    gameInfo.type = GameModeType.LOCAL;
    gameInfo.name = "single";
    gameInfo.playerStartingInfos = [];
    gameInfo.playerStartingInfos.push({
      playerId: playerId,
      x: 600,
      y: 500,
      angle: 0,
      isLocal: true,
    });
    this.onRecvGameInfo(gameInfo);
  }

  close(): void {
    // nothing to do    
  }

  sendInputData(inputData: InputData): void {
    this.localInputData = inputData;
  } 

  update(dt:number):void {
    this.remainInterval -= dt;    
    if (this.remainInterval <= 0) {
      if (this.status === Status.BEGIN) {
        this.status = Status.ALLJOIN;
        this.remainInterval = readyInterval;
        this.onRecvAllJoin();
      } else if (this.status === Status.ALLJOIN) {
        // startGame
        this.status = Status.START;
        this.remainInterval = recvFrameInterval;
        this.onRecvStartGame();
      } else {
        this.remainInterval = recvFrameInterval;
        const frameData = new FrameData();
        this.lastFrame++;
        frameData.frame = this.lastFrame;
        frameData.duration = recvFrameInterval;
        frameData.inputDatas = [];
        if (this.localInputData) {
          frameData.inputDatas.push(this.localInputData);
        }
        this.onFrameData(frameData);
      }
    }
  }
}