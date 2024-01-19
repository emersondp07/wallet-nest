import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { InitTransactionDto } from './dtos/order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  initTransaction(input: InitTransactionDto) {
    //prismaService.$use()
    return this.prismaService.order.create({
      data: {
        ...input,
        partial: input.shares,
        status: OrderStatus.PENDING,
      },
    });
  }

  // Fazer depois
  //   async executeTransaction(input: InputExecuteTransactionDto) {
  //     const order = await this.prismaService.order.findUniqueOrThrow({
  //       where: { id: input.order_id },
  //     });

  //     await this.prismaService.order.update({
  //       where: { id: input.order_id },
  //       data: {
  //         partial: order.partial - input.negociated_shares,
  //         status: input.status,
  //         transactions: {
  //           create: {
  //             broker_transaction_id: input.broker_transaction_id,
  //             related_investor_id: input.related_investor_id,
  //             shares: input.negociated_shares,
  //             price: input.price,
  //           },
  //         },
  //       },
  //     });
  //   }
}
