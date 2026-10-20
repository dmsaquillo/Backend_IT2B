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

import { RoomTypeService } from './roomType.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('room-types')
export class RoomTypeController {
  constructor(private roomTypeService: RoomTypeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.roomTypeService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.roomTypeService.findById(Number(id));
  }

  @Post()
  async create(@Body() body: any) {
    return this.roomTypeService.createRoomType(
      body.type_name,
      body.description,
      body.capacity,
      body.nightly_rate,
      body.room_type_status,
      body.staff_status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async addGuest(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.roomTypeService.updateRoomType(Number(id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomTypeService.deleteRoomType(Number(id));
  }
}