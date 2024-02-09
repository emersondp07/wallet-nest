import { Body, Controller, Get, MessageEvent, Post, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  all() {
    return this.assetsService.all();
  }

  @Post()
  create(@Body() body: { id: string; symbol: string; price: number }) {
    return this.assetsService.create(body);
  }

  @Sse('events')
  events(): Observable<MessageEvent> {
    return this.assetsService.subscribeEvents().pipe(
      map((event) => ({
        type: event.event,
        data: event.data,
      })),
    );
  }
}
