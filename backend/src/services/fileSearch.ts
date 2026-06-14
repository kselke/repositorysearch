import fs from 'fs';
import path from 'path';
import { minimatch } from 'minimatch';
import { SearchMatch, SearchResult } from '../types';

function shouldExclude(name: string, patterns: string[]): boolean {
  return patterns.some(pattern => minimatch(name, pattern, { nocase: false }));
}

function searchFileContent(filePath: string, searchStrings: string[]): SearchMatch[] {
  const matches: SearchMatch[] = [];
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return matches;
  }
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const str of searchStrings) {
      if (line.includes(str)) {
        matches.push({ lineNumber: i + 1, lineContent: line, matchedString: str });
      }
    }
  }
  return matches;
}

function collectFiles(dirPath: string, excludePatterns: string[]): string[] {
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

export function searchDirectory(
  basePath: string,
  searchStrings: string[],
  excludePatterns: string[]
): { results: SearchResult[]; totalFiles: number } {
  const allFiles = collectFiles(basePath, excludePatterns);
  const results: SearchResult[] = [];

  for (const filePath of allFiles) {
    const matches = searchFileContent(filePath, searchStrings);
    if (matches.length > 0) {
      results.push({ filePath, matches });
    }
  }

  return { results, totalFiles: allFiles.length };
}
