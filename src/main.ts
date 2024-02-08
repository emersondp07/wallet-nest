import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['host.docker.internal:9092'],
        // brokers: ['kafka:9094'],s
      },
      consumer: {
        groupId: 'orders-consumer',
      },
    },
  });
  await app.startAllMicroservices();

  await app.listen(3000);
}

bootstrap();
