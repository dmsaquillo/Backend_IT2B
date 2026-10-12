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

import { RoomService } from './room.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomService: RoomService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.roomService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.roomService.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    return this.roomService.createRoom(
      body.room_number,
      body.room_type_id,
      body.floor_number,
      body.room_status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.roomService.updateRoom(
      Number(id),
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomService.deleteRoom(Number(id));
  }
}