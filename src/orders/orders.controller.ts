import { Body, Controller, Post } from '@nestjs/common';
import { InitTransactionDto } from './dtos/order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  InitTransaction(@Body() body: InitTransactionDto) {
    return this.ordersService.initTransaction(body);
  }

  //Fazer depois
  // executeTransaction() {
  //   return this.ordersService.executeTransaction({} as any);
  // }
}
