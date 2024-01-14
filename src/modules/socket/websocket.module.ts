import { Module } from '@nestjs/common';
import { WebSocketGatewayy } from './websocket.gateway';

@Module({
  providers: [WebSocketGatewayy],
  exports: [WebSocketGatewayy],
})
export class WebSocketModule {}