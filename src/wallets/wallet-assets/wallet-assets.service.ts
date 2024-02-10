import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WalletAsset } from '@prisma/client';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma/prisma.service';
import { WalletAsset as WalletAssetSchema } from './wallet-asset.schema';

@Injectable()
export class WalletAssetsService {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectModel(WalletAssetSchema.name)
    private readonly walletAssetModel: Model<WalletAssetSchema>,
  ) {}

  all(filter: { wallet_id: string }) {
    return this.prismaService.walletAsset.findMany({
      where: {
        wallet_id: filter.wallet_id,
      },
      include: {
        asset: {
          select: {
            id: true,
            symbol: true,
            price: true,
          },
        },
      },
    });
  }

  create(input: { wallet_id: string; asset_id: string; shares: number }) {
    return this.prismaService.walletAsset.create({
      data: {
        wallet_id: input.wallet_id,
        asset_id: input.asset_id,
        shares: input.shares,
        version: 1,
      },
    });
  }

  subscribeEvents(wallet_id: string): Observable<{
    event: 'wallet-asset-updated';
    data: WalletAsset;
  }> {
    return new Observable((observer) => {
      this.walletAssetModel
        .watch(
          [
            {
              $match: {
                operationType: 'update',
                'fullDocument.wallet_id': wallet_id,
              },
            },
          ],
          { fullDocument: 'updateLookup' },
        )
        .on('change', async (data) => {
          const walletAsset = await this.prismaService.walletAsset.findUnique({
            where: {
              id: data.fullDocument._id + '',
            },
          });
          observer.next({
            event: 'wallet-asset-updated',
            data: walletAsset,
          });
        });
    });

    // return this.prismaService.$subscribe.walletAsset({
    //   where: {
    //     mutation_in: ['CREATED', 'UPDATED', 'DELETED'],
    //     node: {
    //       wallet_id,
    //     },
    //   },
    // });
  }
}
