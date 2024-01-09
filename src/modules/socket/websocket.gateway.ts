import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway()
export class WebSocketGatewayy implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  private server: Server;

  private clients: WebSocket[] = [];

  handleConnection(client: WebSocket, ...args: any[]) {
    console.log('Client connected');
    this.clients.push(client);

    client.on('message', (message: string) => {
      console.log(`Received message: ${message}`);
      // Broadcast the received message to all clients
      this.broadcast(message, client);
    });
  }

  handleDisconnect(client: WebSocket) {
    console.log('Client disconnected');
    this.clients = this.clients.filter((c) => c !== client);
  }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  broadcast(message: string, sender?: WebSocket) {
    this.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}