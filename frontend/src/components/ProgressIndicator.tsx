interface ProgressIndicatorProps {
  isLoading: boolean;
  processed?: number;
  total?: number;
}

export function ProgressIndicator({ isLoading, processed, total }: ProgressIndicatorProps) {
  if (!isLoading) return null;

  const hasCount = total !== undefined && total > 0;
  const pct = hasCount ? Math.round(((processed ?? 0) / total!) * 100) : 0;

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
      <div className="flex items-center gap-3">
        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full flex-shrink-0" />
        <span className="text-blue-700 text-sm">
          {hasCount
            ? `${processed ?? 0} von ${total} Dateien durchsucht…`
            : 'Dateien werden gezählt…'}
        </span>
        {hasCount && (
          <span className="ml-auto text-blue-500 text-xs font-mono">{pct} %</span>
        )}
      </div>
      {hasCount && (
        <div className="w-full bg-blue-100 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
