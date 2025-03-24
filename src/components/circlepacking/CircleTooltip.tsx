
import React from 'react';

interface CircleTooltipProps {
  tooltipData: {
    x: number;
    y: number;
    name: string;
    isRole: boolean;
    fte: number;
    type?: string;
  } | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

const CircleTooltip: React.FC<CircleTooltipProps> = ({ tooltipData, containerRef }) => {
  if (!tooltipData) return null;

  // Calculate position based on mouse coordinates
  const x = tooltipData.x;
  const y = tooltipData.y;
  
  return (
    <div 
      className="fixed z-50 pointer-events-none bg-popover text-popover-foreground rounded-md px-3 py-1.5 text-xs font-medium shadow-md transform -translate-x-1/2 -translate-y-full animate-fade-in"
      style={{ 
        left: `${x}px`, 
        top: `${y - 20}px` 
      }}
    >
      {tooltipData.name} 
      <span className="text-muted-foreground ml-1">
        ({tooltipData.isRole ? 'Role' : 'Circle'}) - {tooltipData.fte.toFixed(1)} FTE
        {!tooltipData.isRole && tooltipData.fte > 10 && (
          <span className="ml-1 text-amber-500">⚠️</span>
        )}
      </span>
      {tooltipData.type && (
        <span className="block text-xs opacity-80 mt-0.5">Type: {tooltipData.type}</span>
      )}
    </div>
  );
};

export default CircleTooltip;
