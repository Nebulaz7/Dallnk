import { Module } from '@nestjs/common';
import { SynthikController } from './synthik.controller';
import { SynthikService } from './synthik.service';

@Module({
  imports: [],
  controllers: [SynthikController],
  providers: [SynthikService],
})
export class SynthikModule {}
