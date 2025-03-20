
import React from 'react';
import { Network } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-muted-foreground/20 rounded-xl bg-secondary/30">
      <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-secondary">
        <Network className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium mb-3">No visualization yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-4">
        Upload an Excel file to visualize your organizational structure
      </p>
      
      <div className="text-sm text-muted-foreground/70 text-center max-w-lg px-4 py-3 bg-secondary/50 rounded-lg border border-border/30">
        <h4 className="font-medium mb-2">Excel file requirements:</h4>
        <ul className="list-disc list-inside text-left space-y-1">
          <li><strong>Circle Name</strong>: Names of organizational circles</li>
          <li><strong>Role</strong>: Roles within each circle</li>
          <li><strong>FTE Required</strong>: Numeric values for full-time equivalents</li>
        </ul>
      </div>
      
      <div className="mt-6 text-xs text-muted-foreground">
        Need a sample file? Create an Excel file with the columns listed above.
      </div>
    </div>
  );
};

export default EmptyState;
