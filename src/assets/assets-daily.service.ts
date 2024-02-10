import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AssetDaily } from '@prisma/client';
import { ObjectId } from 'bson';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { AssetDaily as AssetDailySchema } from './asset-daily.schema';

@Injectable()
export class AssetsDailyService {
  constructor(
    private prismaService: PrismaService,
    @InjectModel(AssetDailySchema.name)
    private assetDailyModel: Model<AssetDailySchema>,
  ) {}

  findAll(assetIdOrSymbol: string) {
    const where = ObjectId.isValid(assetIdOrSymbol)
      ? { asset_id: assetIdOrSymbol }
      : { asset: { symbol: assetIdOrSymbol } };

    return this.prismaService.assetDaily.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });
  }

  subscribeEvents(asset_id: string): Observable<{
    event: 'asset-daily-created';
    data: AssetDaily;
  }> {
    return new Observable((observer) => {
      this.assetDailyModel
        .watch(
          [
            {
              $match: {
                operationType: 'insert',
                'fullDocument.asset_id': asset_id,
              },
            },
          ],
          {
            fullDocument: 'updateLookup',
          },
        )
        .on('change', async (data) => {
          const asset = await this.prismaService.assetDaily.findUnique({
            where: {
              id: data.fullDocument._id + '',
            },
          });
          observer.next({ event: 'asset-daily-created', data: asset });
        });
    });
  }
}
