import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ReservationRoomController } from './reservationRoom.controller';
import { ReservationRoomService } from './reservationRoom.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ReservationRoomController],
  providers: [ReservationRoomService],
  exports: [ReservationRoomService],
})
export class ReservationRoomModule {}