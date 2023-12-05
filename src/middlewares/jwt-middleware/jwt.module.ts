import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from 'src/modules/jwt/jwt.module';
import { JwtAuthenticationMiddleware } from './jwt.middleware';
import { MongoModule } from 'src/modules/mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';

@Module({
  imports: [
    JwtModule,
    MongoModule.forFeature([
      NormalCollection.USER_LOGIN,
      NormalCollection.USERS,
    ]),
  ],
  providers: [JwtAuthenticationMiddleware],
  exports: [JwtAuthenticationMiddleware],
})
export class JwtAuthenticationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthenticationMiddleware)
      .exclude(
        'auth/login',
        'ws',
        'test/(.*)',
        'auth/forgot-password',
        'auth/create-new-password',
        'auth/refresh-token',
        'user/register',
      )
      .forRoutes('*');
  }
}
