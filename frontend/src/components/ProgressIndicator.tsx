import React from 'react';

interface ProgressIndicatorProps {
  isLoading: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full flex-shrink-0" />
      <span className="text-blue-700 text-sm">Dateien werden rekursiv durchsucht...</span>
    </div>
  );
};
