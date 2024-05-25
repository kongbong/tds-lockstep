import NetworkClientInterface from "./networkClientInterface";
import PlayerInfo from "../gamemodes/playerinfo";
import FrameData from "./frameData";
import { io, Socket } from "socket.io-client";
import InputData from "../input/inputData";

export default class SocketIOClient implements NetworkClientInterface {
  socket: Socket;
  playerId: string;
  playerKeys: any = {};

  onNewPlayer: (info: PlayerInfo) => void;
  onRemovePlayer: (playerId: string) => void;
  onFrameData: (frameData: FrameData) => void;

  connect(playerId: string, addr: string|undefined): void {
    this.playerId = playerId;

    if (addr) {
      this.socket = io(addr);
    } else {
      this.socket = io();
    }
    
    this.socket.on("newPlayer", (player: PlayerInfo) => {
      this.onGetNewPlayer(player);
    });
    this.socket.on("removePlayer", (playerId: string) => {
      if (this.playerKeys[playerId]) {
        this.playerKeys[playerId] = undefined;
        this.onRemovePlayer(playerId);
      }
    });
    this.socket.on("currentPlayers", (players: any) => {
      console.log("currentPlayers ", players);
      if (!players) return;
      for (let key in players) {
        this.onGetNewPlayer(players[key]);
      }
    });
    this.socket.on("frameData", this.onFrameData);

    this.socket.emit("join", {
      name: "MyName:" + this.playerId,
    });
  }

  onGetNewPlayer(player: PlayerInfo): void {
    if (this.playerKeys[player.id]) {
      // already added
      return;
    }
    this.playerKeys[player.id] = true;
    if (player.id === this.playerId) {
      player.isLocal = true;
    }
    this.onNewPlayer(player);
  }

  close(): void {
    this.socket.close();
  }
  
  sendInputData(inputData: InputData): void {
    this.socket.emit("input", inputData);
  }
}