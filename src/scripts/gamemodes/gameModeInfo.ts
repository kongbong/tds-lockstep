import PlayerInfo from "./playerStartingInfo";

export enum GameModeType {
  LOCAL = 0,
  ONLINE_PVP = 1,
}

export class GameModeInfo {
  type: GameModeType;
  name: string;
  playerStartingInfos: PlayerInfo[];
}