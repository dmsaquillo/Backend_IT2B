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

import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('staff')
export class StaffController {
  constructor(private staffService: StaffService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.staffService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.staffService.findById(Number(id));
  }

  @Post()
  async create(@Body() body: any) {
    return this.staffService.createStaff(
      body.first_name,
      body.last_name,
      body.email,
      body.phone,
      body.position,
      body.staff_status
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.staffService.updateStaff(Number(id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.staffService.deleteStaff(Number(id));
  }
}