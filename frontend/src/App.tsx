import { useState } from 'react';
import { ConfigForm } from './components/ConfigForm';
import { ProgressIndicator } from './components/ProgressIndicator';
import { ResultsTable } from './components/ResultsTable';
import { SearchResult } from './types';
import { search } from './api/client';

function exportToCsv(results: SearchResult[]) {
  const rows: string[][] = [['Datei', 'Zeile', 'Suchstring', 'Inhalt']];
  for (const result of results) {
    for (const match of result.matches) {
      rows.push([
        result.filePath,
        String(match.lineNumber),
        match.matchedString,
        match.lineContent.trim(),
      ]);
    }
  }
  const csv = rows
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'suchergebnisse.csv';
  a.click();
  URL.revokeObjectURL(url);
}

interface SearchState {
  results: SearchResult[];
  totalFiles: number;
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (config: {
    basePath: string;
    searchStrings: string[];
    excludePatterns: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    setSearchState(null);
    try {
      const data = await search(config);
      setSearchState({ results: data.results, totalFiles: data.totalFiles });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">Repository Search</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Durchsucht lokal ausgecheckte Repositories nach Strings — unabhängig vom Versionierungssystem
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-5">Konfiguration</h2>
          <ConfigForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {isLoading && <ProgressIndicator isLoading={isLoading} />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
            <span className="font-medium">Fehler:</span> {error}
          </div>
        )}

        {searchState !== null && !isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Ergebnisse</h2>
              {searchState.results.length > 0 && (
                <button
                  onClick={() => exportToCsv(searchState.results)}
                  className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  CSV exportieren
                </button>
              )}
            </div>
            <ResultsTable results={searchState.results} totalFiles={searchState.totalFiles} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
