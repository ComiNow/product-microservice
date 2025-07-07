import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RpcCustomExceptionFilter } from './common';
import { envs } from './config/envs';
import { AuthGuard } from './auth/guards/auth.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Main-Gateway');

  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4201',
      'https://s05phrls-4200.use.devtunnels.ms'
    ],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new RpcCustomExceptionFilter());

  const authGuard = app.get(AuthGuard);
  app.useGlobalGuards(authGuard);

  const config = new DocumentBuilder()
    .setTitle('Client Gateway Documentation')
    .setDescription('The Client Gateway API description')
    .setVersion('1.0')
    .addTag('client-gateway')
    .addBearerAuth()
    .addTag('files')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(envs.port);

  logger.log(`Server running on ${envs.port}`);
}
bootstrap();
