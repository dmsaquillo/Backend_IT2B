import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { ReservationRoomService } from './reservationRoom.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservation-room')
export class ReservationRoomController {
  constructor(
    private reservationRoomService: ReservationRoomService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.reservationRoomService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':reservation_id/:room_id')
  async getOne(
    @Param('reservation_id') reservation_id: string,
    @Param('room_id') room_id: string,
  ) {
    return this.reservationRoomService.findById(
      Number(reservation_id),
      Number(room_id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    return this.reservationRoomService.createReservationRoom(
      body.reservation_id,
      body.room_id,
      body.assigned_rate,
      body.room_status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':reservation_id/:room_id')
  async update(
    @Param('reservation_id') reservation_id: string,
    @Param('room_id') room_id: string,
    @Body() body: any,
  ) {
    return this.reservationRoomService.updateReservationRoom(
      Number(reservation_id),
      Number(room_id),
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':reservation_id/:room_id')
  async remove(
    @Param('reservation_id') reservation_id: string,
    @Param('room_id') room_id: string,
  ) {
    return this.reservationRoomService.deleteReservationRoom(
      Number(reservation_id),
      Number(room_id),
    );
  }
}