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

import {ReservationService} from './reservation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservation')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  // Get all reservations
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.reservationService.getAll();
  }

  // Get one reservation
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.reservationService.findById(Number(id));
  }

  // Create reservation
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    return this.reservationService.createReservation(
      body.guests_id,
      body.users_id,
      body.check_in_date,
      body.check_out_date,
      body.number_of_guests,
      body.reservation_status,
      body.special_request,
    );
  }

  // Update reservation
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.reservationService.updateReservation(
      Number(id),
      body,
    );
  }

  // Delete reservation
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reservationService.deleteReservation(Number(id));
  }
}