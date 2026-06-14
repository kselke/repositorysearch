import fs from 'fs';
import path from 'path';
import os from 'os';
import { Worker } from 'worker_threads';
import { minimatch } from 'minimatch';
import { SearchResult } from '../types';

function shouldExclude(name: string, patterns: string[]): boolean {
  return patterns.some(pattern => minimatch(name, pattern));
}

export function collectFiles(dirPath: string, excludePatterns: string[]): string[] {
  const files: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!shouldExclude(entry.name, excludePatterns)) {
        files.push(...collectFiles(path.join(dirPath, entry.name), excludePatterns));
      }
    } else if (entry.isFile()) {
      files.push(path.join(dirPath, entry.name));
    }
  }
  return files;
}

export function searchDirectoryStreaming(
  basePath: string,
  searchStrings: string[],
  excludePatterns: string[],
  onResult: (result: SearchResult) => void,
  onProgress: (processed: number, total: number) => void
): Promise<number> {
  const allFiles = collectFiles(basePath, excludePatterns);
  const total = allFiles.length;

  if (total === 0) {
    onProgress(0, 0);
    return Promise.resolve(0);
  }

  const numWorkers = Math.min(os.cpus().length, 8, total);
  const batches: string[][] = Array.from({ length: numWorkers }, () => []);
  allFiles.forEach((file, i) => batches[i % numWorkers].push(file));
  const activeBatches = batches.filter(b => b.length > 0);

  const workerScript = path.resolve(__dirname, 'workers', 'searchWorker.js');
  let processed = 0;
  let doneCount = 0;

  return new Promise((resolve, reject) => {
    for (const batch of activeBatches) {
      const worker = new Worker(workerScript, { workerData: { files: batch, searchStrings } });

      worker.on('message', (msg: { type: string; filePath?: string; matches?: SearchResult['matches'] }) => {
        if (msg.type === 'result' && msg.filePath && msg.matches) {
          onResult({ filePath: msg.filePath, matches: msg.matches });
        } else if (msg.type === 'progress') {
          onProgress(++processed, total);
        } else if (msg.type === 'done') {
          if (++doneCount === activeBatches.length) resolve(total);
        }
      });

      worker.on('error', reject);
    }
  });
}
