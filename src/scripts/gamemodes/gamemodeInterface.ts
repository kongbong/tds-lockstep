

export class PlayerInfo {
  id: string;
  x: number;
  y: number;
  angle: number;
  isLocal: boolean;
}

export interface GameModeInterface {
  onNewPlayer: (info: PlayerInfo) => void;
  onRemovePlayer: (id: string) => void;

  startGame(): void;
  update(dt: number): void;
  getRemainDeltaTime(dt: number): number;
}