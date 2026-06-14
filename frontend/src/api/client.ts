import { SearchRequest, SearchResponse, BrowseResponse, SearchResult } from '../types';

export async function browse(dirPath: string): Promise<BrowseResponse> {
  const res = await fetch(`/api/browse?path=${encodeURIComponent(dirPath)}`);
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error ?? 'Verzeichnis nicht lesbar');
  }
  return res.json() as Promise<BrowseResponse>;
}

export async function validatePath(basePath: string): Promise<{ valid: boolean; error?: string }> {
  const res = await fetch(`/api/validate?basePath=${encodeURIComponent(basePath)}`);
  if (!res.ok) throw new Error('Verbindung zum Backend fehlgeschlagen');
  return res.json() as Promise<{ valid: boolean; error?: string }>;
}

export type StreamEvent =
  | { event: 'total';    data: { total: number } }
  | { event: 'progress'; data: { processed: number; total: number } }
  | { event: 'result';   data: SearchResult }
  | { event: 'done';     data: Record<string, never> }
  | { event: 'error';    data: { error: string } };

export async function* searchStream(request: SearchRequest): AsyncGenerator<StreamEvent> {
  const res = await fetch('/api/search-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok || !res.body) {
    const err = await res.json() as { error: string };
    throw new Error(err.error ?? 'Suche fehlgeschlagen');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE blocks are separated by double newline
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const eventMatch = block.match(/^event: (\w+)/m);
      const dataMatch  = block.match(/^data: (.+)/m);
      if (eventMatch && dataMatch) {
        yield { event: eventMatch[1], data: JSON.parse(dataMatch[1]) } as StreamEvent;
      }
    }
  }
}

// Keep for compatibility
export async function search(request: SearchRequest): Promise<SearchResponse> {
  const results: SearchResult[] = [];
  let totalFiles = 0;
  for await (const ev of searchStream(request)) {
    if (ev.event === 'result')   results.push(ev.data);
    if (ev.event === 'total')    totalFiles = ev.data.total;
    if (ev.event === 'error')    throw new Error(ev.data.error);
  }
  return { results, totalFiles };
}
