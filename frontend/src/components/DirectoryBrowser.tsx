import { useState, useEffect, useCallback } from 'react';
import { browse } from '../api/client';
import { BrowseEntry } from '../types';

interface DirectoryBrowserProps {
  onSelect: (path: string) => void;
  onClose: () => void;
  initialPath?: string;
}

export function DirectoryBrowser({ onSelect, onClose, initialPath = '/repos' }: DirectoryBrowserProps) {
  const [current, setCurrent] = useState(initialPath);
  const [parent, setParent] = useState<string | null>(null);
  const [dirs, setDirs] = useState<BrowseEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await browse(path);
      setCurrent(res.current);
      setParent(res.parent);
      setDirs(res.dirs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void navigate(initialPath); }, [navigate, initialPath]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Verzeichnis auswählen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <span className="font-mono text-xs text-blue-700 break-all">{current}</span>
        </div>

        <div className="overflow-y-auto max-h-72">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
              <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full" />
              Lade...
            </div>
          )}
          {error && (
            <div className="px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          {!loading && !error && (
            <ul className="divide-y divide-gray-50">
              {parent !== null && (
                <li>
                  <button
                    onClick={() => void navigate(parent)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-left text-sm text-gray-500"
                  >
                    <span className="text-base">↑</span>
                    <span className="font-mono">.. (übergeordnet)</span>
                  </button>
                </li>
              )}
              {dirs.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-400 italic">Keine Unterverzeichnisse</li>
              )}
              {dirs.map(d => (
                <li key={d.path}>
                  <button
                    onClick={() => void navigate(d.path)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-blue-50 text-left text-sm group"
                  >
                    <span className="text-base">📁</span>
                    <span className="font-mono text-gray-700 group-hover:text-blue-700 flex-1">{d.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={() => { onSelect(current); onClose(); }}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Diesen Ordner wählen
          </button>
        </div>
      </div>
    </div>
  );
}
