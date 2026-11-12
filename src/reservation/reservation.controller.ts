import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';

import { ReservationService } from './reservation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


const getUserId = (req: any): number => {
  const id = req.user?.id ?? req.user?.userId ?? req.user?.sub;
  if (!id) throw new UnauthorizedException('Invalid token payload');
  return Number(id);
};

@Controller('reservation')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}


  @UseGuards(JwtAuthGuard)
  @Get('room-types')
  async roomTypes() {
    return this.reservationService.listRoomTypes();
  }

 
  @UseGuards(JwtAuthGuard)
  @Get('room-types/available')
  async availableRoomTypes(
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('guests') guests: string,
  ) {
    return this.reservationService.availableRoomTypes(checkIn, checkOut, Number(guests) || 1);
  }

 
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myReservations(@Req() req: any) {
    return this.reservationService.myReservations(getUserId(req));
  }


  @UseGuards(JwtAuthGuard)
  @Post('book')
  async book(@Req() req: any, @Body() body: any) {
    return this.reservationService.book(getUserId(req), body);
  }


  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancel(@Req() req: any, @Param('id') id: string) {
    return this.reservationService.cancel(getUserId(req), Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.reservationService.getAll();
  }


  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.reservationService.findById(Number(id));
  }


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


  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.reservationService.updateReservation(Number(id), body);
  }


  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reservationService.deleteReservation(Number(id));
  }
}