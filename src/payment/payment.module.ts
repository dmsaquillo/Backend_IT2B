import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { PaymentsController } from './payment.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}