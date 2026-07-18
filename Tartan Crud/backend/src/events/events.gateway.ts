import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // console.log(`Client disconnected: ${client.id}`);
  }

  emitPedidoCriado(pedido: any) {
    this.server.emit('pedidoCriado', pedido);
  }

  emitStatusAtualizado(pedido: any) {
    this.server.emit('statusAtualizado', pedido);
  }
}
