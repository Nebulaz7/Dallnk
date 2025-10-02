import { Module } from '@nestjs/common';
import { ValidateController } from './validate.controller';
import { ValidateService } from './validate.service';

@Module({
  imports: [],
  controllers: [ValidateController],
  providers: [ValidateService],
})
export class ValidateModule {}
