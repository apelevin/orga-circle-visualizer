
import React from 'react';

interface CirclePackingContainerProps {
  svgRef: React.RefObject<SVGSVGElement>;
  dimensions: { width: number; height: number };
  children?: React.ReactNode;
}

const CirclePackingContainer: React.FC<CirclePackingContainerProps> = ({ 
  svgRef, 
  dimensions,
  children
}) => {
  return (
    <>
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="mx-auto bg-white/50 rounded-lg"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => {
          // This is for the SVG background clicks only, not for circles
          e.stopPropagation();
        }}
      />
      {children}
    </>
  );
};

export default CirclePackingContainer;
