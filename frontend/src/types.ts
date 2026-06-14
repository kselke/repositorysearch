export interface SearchRequest {
  basePath: string;
  searchStrings: string[];
  excludePatterns: string[];
}

export interface SearchMatch {
  lineNumber: number;
  lineContent: string;
  matchedString: string;
}

export interface SearchResult {
  filePath: string;
  matches: SearchMatch[];
}

export interface SearchResponse {
  results: SearchResult[];
  totalFiles: number;
}

export interface BrowseEntry {
  name: string;
  path: string;
}

export interface BrowseResponse {
  current: string;
  parent: string | null;
  dirs: BrowseEntry[];
}
