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

export interface ValidateResponse {
  valid: boolean;
  error?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalFiles: number;
}
