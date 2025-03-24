
import React from 'react';
import { ZoomIn, ZoomOut, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CirclePackingNavigationProps {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

const CirclePackingNavigation: React.FC<CirclePackingNavigationProps> = ({
  zoomIn,
  zoomOut,
  resetZoom
}) => {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={(e) => {
          e.stopPropagation();
          zoomIn();
        }}
        className="h-8 w-8 rounded-full"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={(e) => {
          e.stopPropagation();
          zoomOut();
        }}
        className="h-8 w-8 rounded-full"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={(e) => {
          e.stopPropagation();
          resetZoom();
        }}
        className="h-8 w-8 rounded-full"
        title="Reset View"
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CirclePackingNavigation;
