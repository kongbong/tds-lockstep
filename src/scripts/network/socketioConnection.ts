import ConnectionInterface from "./ConnectionInterface";
import { GameModeInfo } from "../gamemodes/gameModeInfo";
import PlayerInfo from "../gamemodes/playerStartingInfo";
import FrameData from "../networkdata/frameData";
import { io, Socket } from "socket.io-client";
import InputData from "../networkdata/inputData";
import NewPlayerInfo from "../networkdata/newPlayerInfo";

export default class SocketIOConnection implements ConnectionInterface {
  socket: Socket;
  playerId: string;
  playerKeys: any = {};

  onRecvGameInfo: (info: GameModeInfo) => void;
  OnRecvNewPlayer: (info: NewPlayerInfo) => void;
  onRecvAllJoin: () => void;
  onRecvStartGame: () => void;
  onDisconnectedPlayer: (playerId: string) => void;
  onFrameData: (frameData: FrameData) => void;

  connect(playerId: string, addr: string|undefined): void {
    this.playerId = playerId;

    if (addr) {
      this.socket = io(addr);
    } else {
      this.socket = io();
    }
    
    this.socket.on("initGame", (gameInfo: GameModeInfo) => {      
      gameInfo.playerStartingInfos.forEach((playerInfo: PlayerInfo) => {
        this.playerKeys[playerInfo.playerId] = true;
      });
      this.onRecvGameInfo(gameInfo);
    });
    this.socket.on("newPlayer", (newPlayerInfo: NewPlayerInfo) => {      
      this.playerKeys[newPlayerInfo.oldPlayerId] = undefined;
      this.playerKeys[newPlayerInfo.newPlayerId] = true;
      this.OnRecvNewPlayer(newPlayerInfo);
    });
    this.socket.on("allJoin", () => {
      this.onRecvAllJoin();
    });
    this.socket.on("startGame", () => {
      this.onRecvStartGame();
    });
    this.socket.on("removePlayer", (playerId: string) => {
      if (this.playerKeys[playerId]) {
        this.playerKeys[playerId] = undefined;
        this.onDisconnectedPlayer(playerId);
      }
    });
    this.socket.on("frameData", (frameData: FrameData) => {
      this.onFrameData(frameData);
    });

    this.socket.emit("join", {
      name: "MyName:" + this.playerId,
    });
  }

  close(): void {
    this.socket.close();
  }
  
  sendInputData(inputData: InputData): void {
    this.socket.emit("input", inputData);
  }

  update(dt:number):void {

  }
}