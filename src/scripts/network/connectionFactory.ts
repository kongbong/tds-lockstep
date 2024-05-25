import ConnectionInterface from './ConnectionInterface';
import LocalConnection from './localConnection';
import SocketIOConnection from './socketioConnection';

export enum ConnectionType {
  LOCAL = 0,
  SOCKETIO = 1,
}

export function makeConnection(connectionType: ConnectionType): ConnectionInterface {
  switch (connectionType) {
    case ConnectionType.LOCAL:
      return new LocalConnection();
    case ConnectionType.SOCKETIO:
      return new SocketIOConnection();
    default:
      throw new Error("Invalid connection type");
  }
}