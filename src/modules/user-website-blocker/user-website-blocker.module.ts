import { Module } from '@nestjs/common';
import { MongoModule } from '../mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { UserWebsiteBlockerService } from './user-website-blocker.service';
import { UserWebsiteBlockerController } from 'src/controllers/user-website-blocker/user-website-blocker.controller';
import { WebSocketModule } from '../socket/websocket.module';

@Module({
  imports: [
    MongoModule.forFeature([
      NormalCollection.WEBSITE_BLOCKER,
      NormalCollection.USER_WEBSITE_BLOCKER,
    ]),
    WebSocketModule,
  ],
  controllers: [UserWebsiteBlockerController],
  providers: [UserWebsiteBlockerService],
  exports: [UserWebsiteBlockerService],
})
export class UserWebsiteBlockerModule {}
