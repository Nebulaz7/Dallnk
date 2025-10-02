import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SynthikService, AugmentedDataset } from './synthik.service';
import type { Express } from 'express';
import * as multer from 'multer';

@Controller('synthik')
export class SynthikController {
  constructor(private readonly synthikService: SynthikService) {}

  @Post('augment')
  @UseInterceptors(FileInterceptor('file')) 
  async augmentDataset(
    @UploadedFile() file: Express.Multer.File,
    @Body('rows') rows: number, 
  ): Promise<AugmentedDataset> {
    if (!file) {
      throw new Error('No CSV file uploaded');
    }

    // Default rows if not provided
    const newRows = rows ? Number(rows) : 1000;

    return this.synthikService.generateFromUploadedCSV(file.path, newRows);
  }
}
