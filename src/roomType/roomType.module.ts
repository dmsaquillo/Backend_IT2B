import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RoomTypeService } from './roomType.service';
import { RoomTypeController } from './roomType.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [RoomTypeController],
  providers: [RoomTypeService],
  exports: [RoomTypeService],
})
export class RoomTypeModule {}