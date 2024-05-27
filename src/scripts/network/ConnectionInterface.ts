import { GameModeInfo } from "../gamemodes/gameModeInfo";
import FrameData from "../networkdata/frameData";
import InputData from "../networkdata/inputData";
import NewPlayerInfo from "../networkdata/newPlayerInfo";

export default interface ConnectionInterface { 
  onRecvGameInfo: (info: GameModeInfo) => void;
  OnRecvNewPlayer: (info: NewPlayerInfo) => void;
  onRecvAllJoin: () => void;
  onRecvStartGame: () => void;
  onRemovePlayer: (playerId: string) => void;
  onFrameData: (frameData: FrameData) => void;

  connect(playerId: string, addr: string|undefined): void;
  close(): void;
  sendInputData(inputData: InputData): void;
  update(dt:number):void;
}