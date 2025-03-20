
import React from 'react';
import { Network } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-muted-foreground/20 rounded-xl bg-secondary/30">
      <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-secondary">
        <Network className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium mb-2">No visualization yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-2">
        Upload an Excel file to visualize your organizational structure
      </p>
      <p className="text-sm text-muted-foreground/70 text-center max-w-lg">
        The file should contain columns for Circle Name, Role, and FTE Required
      </p>
    </div>
  );
};

export default EmptyState;
