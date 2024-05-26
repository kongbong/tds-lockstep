import PlayerInfo from "./playerStartingInfo";

export enum GameModeType {
  LOCAL = "LOCAL",
  ONLINE_PVP = "ONLINE_PVP",
}

export class GameModeInfo {
  type: GameModeType;
  name: string;
  playerStartingInfos: PlayerInfo[];
}