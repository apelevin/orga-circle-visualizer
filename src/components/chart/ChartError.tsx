
import React from 'react';

interface ChartErrorProps {
  error: string | null;
}

const ChartError: React.FC<ChartErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center p-6 bg-destructive/10 rounded-lg">
        <h3 className="text-lg font-medium text-destructive mb-2">Visualization Error</h3>
        <p className="text-muted-foreground">{error}</p>
        <p className="text-sm mt-2">Please check your Excel file format and try again.</p>
      </div>
    </div>
  );
};

export default ChartError;
