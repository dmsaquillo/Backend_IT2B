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

import { GuestsService } from './guests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('guests')
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.guestsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.guestsService.findById(Number(id));
  }

  @Post()
  async create(@Body() body: any) {
    return this.guestsService.createGuest(
      body.first_name,
      body.last_name,
      body.email,
      body.phone,
      body.address,
      body.identification_number,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.guestsService.updateGuest(Number(id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.guestsService.deleteGuest(id);
  }
}