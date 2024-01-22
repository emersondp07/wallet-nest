import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['host.docker.internal:9094'],
        // brokers: ['kafka:9094'],
      },
      consumer: {
        groupId: 'orders-consumer',
      },
      requestTimeout: 30000,
      retry: {
        initialRetryTime: 500,
        maxRetryTime: 10000,
        retries: 2,
      },
    },
  });
  await app.startAllMicroservices();

  await app.listen(3000);
}
bootstrap();
