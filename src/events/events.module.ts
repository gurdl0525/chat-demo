import { Module } from '@nestjs/common';
import { EventsGateway } from './events.ateway';

@Module({
  providers: [EventsGateway],
})
export class EventsModule {}
