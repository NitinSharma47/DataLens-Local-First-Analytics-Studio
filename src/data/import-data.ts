import type { DatasetMetadata } from '../types';
import type { DataRecord } from '../store/app-store';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export interface ImportedDataset {
  metadata: DatasetMetadata;
  rows: DataRecord[];
}

export async function parseDataFile(file: File): Promise<ImportedDataset> {
  if (!/\.(csv|json)$/i.test(file.name)) throw new Error('Unsupported file type. Choose a CSV or JSON file.');
  if (file.size > MAX_FILE_SIZE) throw new Error('This file is larger than the 25 MB frontend import limit. Choose a smaller file.');
  if (file.size === 0) throw new Error('This file is empty. Choose a file that contains data.');

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./import.worker.ts', import.meta.url), { type: 'module' });
    const dispose = () => worker.terminate();

    worker.onmessage = (event: MessageEvent<{ dataset?: ImportedDataset; error?: string }>) => {
      dispose();
      if (event.data.dataset) resolve(event.data.dataset);
      else reject(new Error(event.data.error ?? 'The import worker returned an invalid response.'));
    };
    worker.onerror = (event) => {
      dispose();
      reject(new Error(`Import worker failed: ${event.message || 'unexpected worker error'}`));
    };
    worker.postMessage(file);
  });
}
