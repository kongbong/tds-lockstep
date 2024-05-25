import PlayerInfo from "./playerinfo";
import FrameData from "../network/frameData";

export default interface GameModeInterface {
  onNewPlayer: (info: PlayerInfo) => void;
  onRemovePlayer: (id: string) => void;

  startGame(): void;
  getFrameCount(): number;
  getThisFrameDataAndAdvanceTime(dt: number): FrameData|undefined;
}