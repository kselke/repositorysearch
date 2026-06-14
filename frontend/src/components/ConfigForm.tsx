import { useState } from 'react';
import { DirectoryBrowser } from './DirectoryBrowser';

interface SearchConfig {
  basePath: string;
  searchStrings: string[];
  excludePatterns: string[];
}

interface ConfigFormProps {
  onSearch: (config: SearchConfig) => void;
  isLoading: boolean;
}

export function ConfigForm({ onSearch, isLoading }: ConfigFormProps) {
  const [basePath, setBasePath] = useState('/repos');
  const [searchStrings, setSearchStrings] = useState('');
  const [excludePatterns, setExcludePatterns] = useState('');
  const [showBrowser, setShowBrowser] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const strings = searchStrings.split('\n').map(s => s.trim()).filter(Boolean);
    const patterns = excludePatterns.split('\n').map(s => s.trim()).filter(Boolean);
    onSearch({ basePath, searchStrings: strings, excludePatterns: patterns });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Basispfad
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={basePath}
              onChange={e => setBasePath(e.target.value)}
              placeholder="/repos/welcome/src/IS/packages"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowBrowser(true)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 flex items-center gap-1.5 flex-shrink-0"
              title="Verzeichnis auswählen"
            >
              <span>📁</span>
              <span>Durchsuchen</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Pfad innerhalb des Containers. Dein Repos-Ordner ist unter <code className="bg-gray-100 px-1 rounded">/repos</code> gemountet (siehe docker-compose.yml).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suchstrings <span className="text-gray-400 font-normal">(einer pro Zeile)</span>
          </label>
          <textarea
            value={searchStrings}
            onChange={e => setSearchStrings(e.target.value)}
            placeholder={'MyClass\nSomeMethod\nimportant_string'}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ausschluss-Muster <span className="text-gray-400 font-normal">(Ordnernamen, einer pro Zeile)</span>
          </label>
          <textarea
            value={excludePatterns}
            onChange={e => setExcludePatterns(e.target.value)}
            placeholder={'*_TEST\n*_BACKUP\nnode_modules'}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
          <p className="text-xs text-gray-400 mt-1">
            Glob-Muster für Ordner die übersprungen werden. z.B. <code className="bg-gray-100 px-1 rounded">*_TEST</code> schließt alle Ordner aus die mit _TEST enden.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Suche läuft...' : 'Suchen'}
        </button>
      </form>

      {showBrowser && (
        <DirectoryBrowser
          initialPath={basePath}
          onSelect={path => setBasePath(path)}
          onClose={() => setShowBrowser(false)}
        />
      )}
    </>
  );
}
