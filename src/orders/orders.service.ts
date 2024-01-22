import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { OrderStatus, OrderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma/prisma.service';
import {
  InitTransactionDto,
  InputExecuteTransactionDto,
} from './dtos/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('ORDERS_PUBLISHER')
    private readonly kafkaClient: ClientKafka,
  ) {}

  all(filter: { wallet_id: string }) {
    return this.prismaService.order.findMany({
      where: {
        wallet_id: filter.wallet_id,
      },
      include: {
        transactions: true,
        asset: {
          select: {
            id: true,
            symbol: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  async initTransaction(input: InitTransactionDto) {
    //prismaService.$use()
    const order = await this.prismaService.order.create({
      data: {
        ...input,
        partial: input.shares,
        status: OrderStatus.PENDING,
        version: 1,
      },
    });

    this.kafkaClient.emit('input', {
      order_id: order.id,
      investor_id: order.wallet_id,
      asset_id: order.asset_id,
      // current_shares: order.shares,
      shares: order.shares,
      price: order.price,
      order_type: order.type,
    });

    return order;
  }

  async executeTransaction(input: InputExecuteTransactionDto) {
    return this.prismaService.$transaction(async (prisma) => {
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: input.order_id },
      });

      await prisma.order.update({
        where: { id: input.order_id, version: order.version },
        data: {
          partial: order.partial - input.negociated_shares,
          status: input.status,
          transactions: {
            create: {
              broker_transaction_id: input.broker_transaction_id,
              related_investor_id: input.related_investor_id,
              shares: input.negociated_shares,
              price: input.price,
            },
          },
          version: { increment: 1 },
        },
      });

      if (input.status === OrderStatus.CLOSED) {
        await prisma.asset.update({
          where: { id: order.asset_id },
          data: {
            price: input.price,
          },
        });

        const walletAsset = await prisma.walletAsset.findUnique({
          where: {
            wallet_id_asset_id: {
              asset_id: order.asset_id,
              wallet_id: order.wallet_id,
            },
          },
        });

        if (walletAsset) {
          await prisma.walletAsset.update({
            where: {
              wallet_id_asset_id: {
                asset_id: order.asset_id,
                wallet_id: order.wallet_id,
              },
              version: order.version,
            },
            data: {
              shares:
                order.type === OrderType.BUY
                  ? walletAsset.shares + order.shares
                  : walletAsset.shares - order.shares,
              version: { increment: 1 },
            },
          });
        } else {
          await prisma.walletAsset.create({
            data: {
              asset_id: order.asset_id,
              wallet_id: order.wallet_id,
              shares: input.negociated_shares,
              version: 1,
            },
          });
        }
      }
    });
  }
}
