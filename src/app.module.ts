import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, {
  DBConfiguration,
} from './shared/configuration/configuration';
import { MongoModule } from './modules/mongodb';
import controllers from './controllers';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformer } from './shared/interceptors/response-tranformer.interceptor';
import { GlobalExceptionFilter } from './shared/exceptions/exception.filter';
import validations from './shared/validations/index.validations';
import { AppService } from './app.service';
import { JwtAuthenticationModule } from './middlewares/jwt-middleware/jwt.module';
import { SpaceModule } from './modules/space/space.module';

@Module({
  imports: [
    AuthenticationModule,
    JwtAuthenticationModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
      ignoreEnvFile: process.env.NODE_ENV == 'local',
      load: [configuration],
    }),
    MongoModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => {
        const dbOptions = cfg.getOrThrow<DBConfiguration>('database');
        return {
          uri: dbOptions.uri,
          dbName: dbOptions.dbName,
          migration: {
            enabled: dbOptions.enableMigration,
            collectionName: dbOptions.migrationCollection,
            dir: dbOptions.migrationFolder,
            seed: dbOptions.seedFolder,
          },
        };
      },
      inject: [ConfigService],
    }),
    SpaceModule,
  ],
  controllers: [AppController, ...controllers],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformer,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    ...validations,
  ],
})
export class AppModule {}
