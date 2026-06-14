import { SearchRequest, SearchResponse, BrowseResponse } from '../types';

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

export async function search(request: SearchRequest): Promise<SearchResponse> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error ?? 'Suche fehlgeschlagen');
  }
  return res.json() as Promise<SearchResponse>;
}
