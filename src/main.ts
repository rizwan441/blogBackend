import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // Replace with the Angular app's URL
    credentials: true,  // If you need to support cookies
  });
  app.setGlobalPrefix('api');


  await app.listen(3000);
}
bootstrap();
