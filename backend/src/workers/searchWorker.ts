import { parentPort, workerData } from 'worker_threads';
import fs from 'fs/promises';

interface WorkerInput {
  files: string[];
  searchStrings: string[];
}

interface ProgressMessage { type: 'progress' }
interface ResultMessage  { type: 'result'; filePath: string; matches: { lineNumber: number; lineContent: string; matchedString: string }[] }
interface DoneMessage    { type: 'done' }

export type WorkerMessage = ProgressMessage | ResultMessage | DoneMessage;

const { files, searchStrings } = workerData as WorkerInput;

function toRegex(pattern: string): RegExp {
  // Split on * so dots and other chars are treated as literals
  const parts = pattern.split('*').map(p => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(parts.join('.*'));
}

const regexes = searchStrings.map(toRegex);

async function run() {
  for (const filePath of files) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const matches: ResultMessage['matches'] = [];
      for (let i = 0; i < lines.length; i++) {
        for (let s = 0; s < regexes.length; s++) {
          if (regexes[s].test(lines[i])) {
            matches.push({ lineNumber: i + 1, lineContent: lines[i], matchedString: searchStrings[s] });
          }
        }
      }
      if (matches.length > 0) {
        parentPort!.postMessage({ type: 'result', filePath, matches } satisfies ResultMessage);
      }
    } catch { /* unreadable file — skip */ }
    parentPort!.postMessage({ type: 'progress' } satisfies ProgressMessage);
  }
  parentPort!.postMessage({ type: 'done' } satisfies DoneMessage);
}

void run();
