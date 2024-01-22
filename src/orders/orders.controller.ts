import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ExecuteTransactionMessage,
  InitTransactionDto,
  InputExecuteTransactionDto,
} from './dtos/order.dto';
import { OrdersService } from './orders.service';

@Controller('wallets/:wallet_id/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  all(@Param('wallet_id') wallet_id: string) {
    return this.ordersService.all({ wallet_id });
  }

  @Post()
  InitTransaction(
    @Param('wallet_id') wallet_id,
    @Body() body: Omit<InitTransactionDto, 'wallet_id'>,
  ) {
    return this.ordersService.initTransaction({ ...body, wallet_id });
  }

  @Post('execute')
  executeTransaction(@Body() body: InputExecuteTransactionDto) {
    return this.ordersService.executeTransaction(body);
  }

  @MessagePattern('output')
  async executeTransactionConsumer(
    @Payload() message: ExecuteTransactionMessage,
  ) {
    const transaction = message.transactions[message.transactions.length - 1];

    await this.ordersService.executeTransaction({
      order_id: message.order_id,
      status: message.status,
      related_investor_id:
        message.order_type === 'BUY'
          ? transaction.seller_id
          : transaction.buyer_id,
      broker_transaction_id: transaction.transaction_id,
      negociated_shares: transaction.shares,
      price: transaction.price,
    });
  }
}
