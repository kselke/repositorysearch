import React, { useState } from 'react';
import { SearchResult } from '../types';

interface ResultsTableProps {
  results: SearchResult[];
  totalFiles: number;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, totalFiles }) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = (filePath: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) next.delete(filePath);
      else next.add(filePath);
      return next;
    });
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-sm">Keine Treffer gefunden in {totalFiles} Dateien.</p>
      </div>
    );
  }

  const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-800">{totalMatches}</span> Treffer in{' '}
        <span className="font-semibold text-gray-800">{results.length}</span> Dateien
        <span className="text-gray-400"> (von {totalFiles} durchsucht)</span>
      </p>

      {results.map(result => (
        <div key={result.filePath} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse(result.filePath)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <span className="font-mono text-sm text-blue-700 break-all">{result.filePath}</span>
            <span className="ml-3 flex-shrink-0 text-xs text-gray-400 flex items-center gap-1">
              {result.matches.length} Treffer
              <svg
                className={`w-4 h-4 transition-transform ${collapsed.has(result.filePath) ? '-rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {!collapsed.has(result.filePath) && (
            <table className="w-full text-sm border-t border-gray-200">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2 w-16 text-xs text-gray-400 font-medium">Zeile</th>
                  <th className="text-left px-4 py-2 w-40 text-xs text-gray-400 font-medium">Suchstring</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Zeileninhalt</th>
                </tr>
              </thead>
              <tbody>
                {result.matches.map((match, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-yellow-50 transition-colors">
                    <td className="px-4 py-2 text-gray-400 font-mono text-xs">{match.lineNumber}</td>
                    <td className="px-4 py-2">
                      <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-mono text-xs">
                        {match.matchedString}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-700 break-all whitespace-pre-wrap">
                      {match.lineContent.trim()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};
