import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from 'src/modules/jwt/jwt.module';
import { MongoModule } from 'src/modules/mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { AuthenticationService } from './authentication.service';
import { EmailModule } from 'src/modules/email-service/email-service.module';
import { ActivityLogModule } from 'src/modules/activity-log/activity-log.module';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    EmailModule,
    ActivityLogModule,
    MongoModule.forFeature([
      NormalCollection.USERS,
      NormalCollection.USER_LOGIN,
      NormalCollection.USER_ROLES,
      NormalCollection.ROLES,
      NormalCollection.TENANTS,
    ]),
  ],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
