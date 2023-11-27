import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api', { exclude: ['healthz', 'ws'] });
  const config = new DocumentBuilder()
    .setTitle('Study Space App RESTful API')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    await app.listen(process.env.PORT || 8888);
}
process.on('uncaughtException', (reason) => {
  console.log(reason);
});

process.on('unhandledRejection', (reason) => {
  console.log(reason);
});

process.on('uncaughtExceptionMonitor', (reason) => {
  console.log(reason);
});
bootstrap();
