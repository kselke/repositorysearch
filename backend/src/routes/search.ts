import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { SearchRequest } from '../types';
import { collectFiles, searchDirectoryStreaming } from '../services/fileSearch';

const router = Router();

router.get('/browse', (req: Request, res: Response) => {
  const dirPath = (req.query['path'] as string | undefined) ?? '/repos';
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const dirs = entries
      .filter(e => e.isDirectory())
      .map(e => ({ name: e.name, path: path.join(dirPath, e.name) }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const parent = path.dirname(dirPath) !== dirPath ? path.dirname(dirPath) : null;
    return res.json({ current: dirPath, parent, dirs });
  } catch {
    return res.status(400).json({ error: `Verzeichnis nicht lesbar: ${dirPath}` });
  }
});

router.get('/validate', (req: Request, res: Response) => {
  const basePath = req.query['basePath'] as string | undefined;
  if (!basePath) return res.json({ valid: false, error: 'basePath fehlt' });
  try {
    const stat = fs.statSync(basePath);
    if (!stat.isDirectory()) return res.json({ valid: false, error: 'Pfad ist kein Verzeichnis' });
    return res.json({ valid: true });
  } catch {
    return res.json({ valid: false, error: `Verzeichnis nicht gefunden: ${basePath}` });
  }
});

// Streaming search via SSE
router.post('/search-stream', async (req: Request, res: Response) => {
  const { basePath, searchStrings, excludePatterns } = req.body as SearchRequest;

  if (!basePath || !Array.isArray(searchStrings) || searchStrings.length === 0) {
    res.status(400).json({ error: 'basePath und searchStrings sind erforderlich' });
    return;
  }
  try {
    if (!fs.statSync(basePath).isDirectory()) {
      res.status(400).json({ error: 'basePath ist kein Verzeichnis' });
      return;
    }
  } catch {
    res.status(400).json({ error: `Verzeichnis nicht gefunden: ${basePath}` });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (event: string, data: unknown) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  // Send total file count immediately so frontend can show the denominator
  const total = collectFiles(basePath, excludePatterns ?? []).length;
  send('total', { total });

  try {
    await searchDirectoryStreaming(
      basePath,
      searchStrings,
      excludePatterns ?? [],
      result => send('result', result),
      (processed, _total) => send('progress', { processed, total: _total })
    );
  } catch (e: unknown) {
    send('error', { error: e instanceof Error ? e.message : 'Unbekannter Fehler' });
  }

  send('done', {});
  res.end();
});

export default router;
