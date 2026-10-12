import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CategoryModule } from './category/category.module';
import { GuestsModule } from './guests/guests.module';
import { ReservationModule } from './reservation/reservation.module';
import { ReservationRoomModule } from './reservationRoom/reservationRoom.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CategoryModule,
    GuestsModule,
    ReservationModule,
    ReservationRoomModule,
    RoomModule,
  ],
})
export class AppModule {}