import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { StaffService } from './staff.service';
import { DatabaseModule } from '../database/database.module';
import { StaffController } from './staff.controller';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}