import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SynthikModule } from './synthik/synthik.module';
import { ValidateModule } from './validate/validate.module';

@Module({
  imports: [SynthikModule, ValidateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
