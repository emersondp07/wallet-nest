import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletAsset, WalletAssetSchema } from './wallet-assets/wallet-asset.schema';
import { WalletAssetsController } from './wallet-assets/wallet-assets.controller';
import { WalletAssetsService } from './wallet-assets/wallet-assets.service';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WalletAsset.name, schema: WalletAssetSchema },
    ]),
  ],
  controllers: [WalletsController, WalletAssetsController],
  providers: [WalletsService, WalletAssetsService],
  exports: [WalletsService, WalletAssetsService],
})
export class WalletsModule {}
