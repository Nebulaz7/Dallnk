import { Controller, Post, Body } from '@nestjs/common';
import { ValidateService } from './validate.service';

@Controller('validate')
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {}

  @Post()
  async validate(@Body() body: any) {
    return await this.validateService.runPython(body);
  }
}
