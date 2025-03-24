
import React from 'react';

interface ChartTooltipProps {
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

const ChartTooltip: React.FC<ChartTooltipProps> = ({ tooltipData, containerRef }) => {
  if (!tooltipData) return null;
  
  return (
    <div 
      className="fixed z-50 pointer-events-none bg-popover text-popover-foreground rounded-md px-3 py-1.5 text-xs font-medium shadow-md transform -translate-x-1/2 -translate-y-full animate-fade-in"
      style={{ 
        left: `${tooltipData.x + containerRef.current?.getBoundingClientRect().left}px`, 
        top: `${tooltipData.y + containerRef.current?.getBoundingClientRect().top - 10}px` 
      }}
    >
      {tooltipData.name} 
      <span className="text-muted-foreground ml-1">
        ({tooltipData.isRole ? 'Role' : `Circle - ${tooltipData.type}`}) - {tooltipData.fte.toFixed(1)} FTE
        {!tooltipData.isRole && tooltipData.fte > 10 && (
          <span className="ml-1 text-amber-500">⚠️</span>
        )}
      </span>
    </div>
  );
};

export default ChartTooltip;
