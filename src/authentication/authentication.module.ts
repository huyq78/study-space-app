import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from 'src/modules/jwt/jwt.module';
import { MongoModule } from 'src/modules/mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    MongoModule.forFeature([
      NormalCollection.USERS,
      NormalCollection.USER_LOGIN,
    ]),
  ],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
