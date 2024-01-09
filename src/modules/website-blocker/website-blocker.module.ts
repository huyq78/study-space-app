import { Module } from '@nestjs/common';
import { MongoModule } from '../mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { WebsiteBlockerService } from './website-blocker.service';
import { WebsiteBlockerController } from 'src/controllers/website-blocker/website-blocker.controller';

@Module({
  imports: [MongoModule.forFeature([NormalCollection.WEBSITE_BLOCKER])],
  controllers: [WebsiteBlockerController],
  providers: [WebsiteBlockerService],
  exports: [WebsiteBlockerService],
})
export class WebsiteBlockerModule {}
