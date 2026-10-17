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

import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.paymentService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.paymentService.findBypayment_Id(Number(id));
  }

  @Post()
  async create(@Body() body: any) {
    return this.paymentService.createPayment(
      body.payment_id,
      body.reservation_id,
      body.payment_date,
      body.amount,
      body.payment_method,
      body.payment_status,
      body.reference_number,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.paymentService.updatePayment(Number(id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.paymentService.deletePayment(Number(id));
  }
}