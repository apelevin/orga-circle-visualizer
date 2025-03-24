
import { useState, useEffect, RefObject } from 'react';

export const useChartDimensions = (containerRef: RefObject<HTMLDivElement>) => {
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(width, 400),
          height: Math.max(height * 0.95, 600)
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  return dimensions;
};
