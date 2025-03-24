
import * as d3 from 'd3';
import { calculateInitialTransform } from '@/utils/d3CirclePackingUtils';

export const useCircleZoom = () => {
  const setupZoom = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    dimensions: { width: number; height: number },
    rootX: number,
    rootY: number
  ) => {
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    const initialTransform = calculateInitialTransform(
      dimensions.width,
      dimensions.height,
      rootX,
      rootY
    );
    
    svg.call(zoom.transform, initialTransform);
    
    svg.on('dblclick.zoom', () => {
      svg.transition()
        .duration(750)
        .call(zoom.transform, initialTransform);
    });

    return {
      zoom,
      initialTransform
    };
  };

  return {
    setupZoom
  };
};
