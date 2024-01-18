import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AssetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
