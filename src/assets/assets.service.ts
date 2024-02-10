import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Asset } from '@prisma/client';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { Asset as AssetSchema } from './asset.schema';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectModel(AssetSchema.name)
    private readonly assetModel: Model<AssetSchema>,
  ) {}

  all() {
    return this.prismaService.asset.findMany();
  }

  create(data: { id: string; symbol: string; price: number }) {
    return this.prismaService.asset.create({
      data,
    });
  }

  findOne(id: string) {
    return this.prismaService.asset.findUnique({
      where: {
        id,
      },
    });
  }

  subscribeEvents(): Observable<{ event: 'asset-price-changed'; data: Asset }> {
    return new Observable((observer) => {
      this.assetModel
        .watch(
          [
            {
              $match: {
                operationType: 'update',
              },
            },
          ],
          {
            fullDocument: 'updateLookup',
          },
        )
        .on('change', async (data) => {
          const asset = await this.prismaService.asset.findUnique({
            where: {
              id: data.fullDocument._id + '',
            },
          });
          observer.next({ event: 'asset-price-changed', data: asset });
        });
    });
  }
}
