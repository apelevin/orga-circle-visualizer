
import React from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

interface CirclePackingZoomProps {
  svgRef: React.RefObject<SVGSVGElement>;
  hierarchyData: d3.HierarchyCircularNode<HierarchyNode>;
  dimensions: { width: number; height: number };
}

const CirclePackingZoom: React.FC<CirclePackingZoomProps> = ({ 
  svgRef, 
  hierarchyData, 
  dimensions 
}) => {
  React.useEffect(() => {
    if (!svgRef.current || !hierarchyData) return;
    
    const svg = d3.select(svgRef.current);
    const g = svg.select('g');
    
    // Create and configure zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        
        // Scale text appropriately on zoom
        g.selectAll('.circle-label')
          .attr('font-size', d => Math.min(d.r / 3, 14) / event.transform.k);
      });
    
    svg.call(zoom);
    
    const initialTransform = d3.zoomIdentity.translate(
      dimensions.width / 2 - hierarchyData.x,
      dimensions.height / 2 - hierarchyData.y
    ).scale(0.9);
    
    svg.call(zoom.transform, initialTransform);
    
    // Handle double-click separately from regular clicks
    svg.on('dblclick.zoom', null);
    svg.on('dblclick', () => {
      svg.transition()
        .duration(750)
        .call(zoom.transform, initialTransform);
    });
    
    return () => {
      // Clean up event listeners
      svg.on('.zoom', null);
      svg.on('dblclick', null);
    };
  }, [hierarchyData, dimensions, svgRef]);
  
  return null; // This is a rendering-only component with no visible JSX
};

export default CirclePackingZoom;
