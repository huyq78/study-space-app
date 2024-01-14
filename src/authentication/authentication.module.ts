import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from 'src/modules/jwt/jwt.module';
import { MongoModule } from 'src/modules/mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { AuthenticationService } from './authentication.service';
import { WebSocketModule } from 'src/modules/socket/websocket.module';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    MongoModule.forFeature([
      NormalCollection.USERS,
      NormalCollection.USER_LOGIN,
    ]),
    WebSocketModule,
  ],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
