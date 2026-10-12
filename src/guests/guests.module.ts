import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [GuestsController],
  providers: [GuestsService],
  exports: [GuestsService],
})
export class GuestsModule {}