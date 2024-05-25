import { GameModeInfo } from "../gamemodes/gameModeInfo";
import FrameData from "../input/frameData";
import InputData from "../input/inputData";

export default interface ConnectionInterface { 
  onRecvGameInfo: (info: GameModeInfo) => void;  
  onRecvAllJoin: () => void;
  onRecvStartGame: () => void;
  onDisconnectedPlayer: (playerId: string) => void;
  onFrameData: (frameData: FrameData) => void;

  connect(playerId: string, addr: string|undefined): void;
  close(): void;
  sendInputData(inputData: InputData): void;
  update(dt:number):void;
}