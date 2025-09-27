import { Injectable } from '@nestjs/common';
import { Synthik } from '@ghostxd/synthik-sdk';
import * as fs from 'fs';
import csvParser from 'csv-parser';

export interface AugmentedDataset {
  cid: string;
  cdnUrl?: string;
  name: string;
  rows: number;
  schema: any[];
}

// Add this interface to type the SDK response
interface SynthikDatasetResponse {
  cid: string;
  cdnUrl?: string;
  [key: string]: any; // Allow other properties
}

@Injectable()
export class SynthikService {
  private synthik: Synthik;

  constructor() {
    this.synthik = new Synthik({
      privateKey: process.env.FILECOIN_PRIVATE_KEY!,
      network: 'calibration',
      apiKeys: {
        openai: process.env.OPENAI_KEY!,
        google: process.env.GEMINI_KEY!,
      },
    });
  }

  // 🔹 Extract schema automatically from uploaded CSV
  private async extractSchemaFromCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const schema: any[] = [];
      let firstRow: any = null;

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          if (!firstRow) {
            firstRow = row;
            for (const key of Object.keys(row)) {
              const value = row[key];
              schema.push({
                name: key,
                type: isNaN(value) ? 'string' : 'number',
                description: `Auto-detected column: ${key}`,
              });
            }
          }
        })
        .on('end', () => resolve(schema))
        .on('error', (err) => reject(err));
    });
  }

  async generateFromUploadedCSV(filePath: string, newRows = 1000): Promise<AugmentedDataset> {
    const schema = await this.extractSchemaFromCSV(filePath);

    const models = await this.synthik.getAvailableModels();
    const dataset = await this.synthik.generateDataset(
      {
        name: `Augmented Dataset from ${filePath}`,
        description: `Synthetically generated dataset based on ${filePath}`,
        license: 'CC0',
        rows: newRows,
        schema,
      },
      models[0],
    ) as unknown as SynthikDatasetResponse;

    return {
      cid: dataset.cid,
      cdnUrl: dataset.cdnUrl,
      name: `Augmented Dataset from ${filePath}`,
      rows: newRows,
      schema,
    };
  }
}