import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class ValidateService {
  async runPython(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const py = spawn('python3', ['validate.py']);
      let result = '';
      let error = '';

      py.stdin.write(JSON.stringify({ body: JSON.stringify(data) }));
      py.stdin.end();

      py.stdout.on('data', (chunk) => {
        result += chunk.toString();
      });

      py.stderr.on('data', (chunk) => {
        error += chunk.toString();
      });

      py.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(result));
          } catch (e) {
            reject(`Invalid JSON response: ${result}`);
          }
        } else {
          reject(error || 'Python process failed');
        }
      });
    });
  }
}
