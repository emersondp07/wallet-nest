import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    PrismaModule, 
    AssetsModule, 
    WalletsModule, 
    OrdersModule, 
    MongooseModule.forRoot(process.env.DATABASE_URL)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
