import { useState } from 'react';
import { ConfigForm } from './components/ConfigForm';
import { ProgressIndicator } from './components/ProgressIndicator';
import { ResultsTable } from './components/ResultsTable';
import { SearchResult } from './types';
import { searchStream } from './api/client';

function exportToCsv(results: SearchResult[]) {
  const rows: string[][] = [['Datei', 'Zeile', 'Suchstring', 'Inhalt']];
  for (const result of results) {
    for (const match of result.matches) {
      rows.push([result.filePath, String(match.lineNumber), match.matchedString, match.lineContent.trim()]);
    }
  }
  const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'suchergebnisse.csv';
  a.click();
  URL.revokeObjectURL(url);
}

interface Progress { processed: number; total: number }

function App() {
  const [isLoading, setIsLoading]   = useState(false);
  const [progress, setProgress]     = useState<Progress | null>(null);
  const [results, setResults]       = useState<SearchResult[]>([]);
  const [totalFiles, setTotalFiles] = useState<number | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [searched, setSearched]     = useState(false);

  const handleSearch = async (config: { basePath: string; searchStrings: string[]; excludePatterns: string[] }) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setProgress(null);
    setTotalFiles(null);
    setSearched(false);

    try {
      for await (const ev of searchStream(config)) {
        if (ev.event === 'total') {
          setTotalFiles(ev.data.total);
          setProgress({ processed: 0, total: ev.data.total });
        } else if (ev.event === 'progress') {
          setProgress({ processed: ev.data.processed, total: ev.data.total });
        } else if (ev.event === 'result') {
          setResults(prev => [...prev, ev.data]);
        } else if (ev.event === 'error') {
          setError(ev.data.error);
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
      setSearched(true);
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

        {isLoading && (
          <ProgressIndicator
            isLoading={isLoading}
            processed={progress?.processed}
            total={progress?.total}
          />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
            <span className="font-medium">Fehler:</span> {error}
          </div>
        )}

        {(results.length > 0 || searched) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Ergebnisse
                {isLoading && results.length > 0 && (
                  <span className="ml-2 text-blue-500 font-normal normal-case">(läuft…)</span>
                )}
              </h2>
              {results.length > 0 && !isLoading && (
                <button
                  onClick={() => exportToCsv(results)}
                  className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  CSV exportieren
                </button>
              )}
            </div>
            <ResultsTable results={results} totalFiles={totalFiles ?? 0} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
