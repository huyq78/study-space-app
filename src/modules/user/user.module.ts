import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongoModule } from '../mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [
    MongoModule.forFeature([NormalCollection.USERS]),
    AuthenticationModule,
  ],
  providers: [UserService],
  exports: [UserService]
})

export class UserModule {

}