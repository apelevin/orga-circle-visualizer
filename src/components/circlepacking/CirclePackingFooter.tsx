
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const CirclePackingFooter: React.FC = () => {
  return (
    <div className="text-center mt-4 text-sm text-muted-foreground">
      <p>Hover over a circle to see its name. Click on a circle to see details.</p>
      <p className="text-xs mt-1 flex items-center justify-center gap-1">
        <AlertTriangle className="h-3 w-3 text-amber-500" /> 
        Circles with warning icons have more than 10 FTE
      </p>
    </div>
  );
};

export default CirclePackingFooter;
