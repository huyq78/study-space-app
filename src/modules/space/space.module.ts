import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from '../../controllers/space/space.controller';
import { MongoModule } from '../mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';

@Module({
  imports: [MongoModule.forFeature([NormalCollection.SPACE])],
  controllers: [SpaceController],
  providers: [SpaceService],
  exports: [SpaceService]
})
export class SpaceModule {}
