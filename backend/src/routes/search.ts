import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { SearchRequest } from '../types';
import { searchDirectory } from '../services/fileSearch';

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
  if (!basePath) {
    return res.json({ valid: false, error: 'basePath fehlt' });
  }
  try {
    const stat = fs.statSync(basePath);
    if (!stat.isDirectory()) {
      return res.json({ valid: false, error: 'Pfad ist kein Verzeichnis' });
    }
    return res.json({ valid: true });
  } catch {
    return res.json({ valid: false, error: `Verzeichnis nicht gefunden: ${basePath}` });
  }
});

router.post('/search', (req: Request, res: Response) => {
  const { basePath, searchStrings, excludePatterns } = req.body as SearchRequest;

  if (!basePath || !Array.isArray(searchStrings) || searchStrings.length === 0) {
    return res.status(400).json({ error: 'basePath und searchStrings sind erforderlich' });
  }

  try {
    const stat = fs.statSync(basePath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'basePath ist kein Verzeichnis' });
    }
  } catch {
    return res.status(400).json({ error: `Verzeichnis nicht gefunden: ${basePath}` });
  }

  const { results, totalFiles } = searchDirectory(basePath, searchStrings, excludePatterns ?? []);
  return res.json({ results, totalFiles });
});

export default router;
