import PlayerInfo from "../gamemodes/playerinfo";
import FrameData from "./frameData";
import InputData from "../input/inputData";

export default interface NetworkClientInterface {  
  onNewPlayer: (info: PlayerInfo) => void;
  onRemovePlayer: (playerId: string) => void;
  onFrameData: (frameData: FrameData) => void;

  connect(playerId: string, addr: string|undefined): void;
  close(): void;
  sendInputData(inputData: InputData): void;
}