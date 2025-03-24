
import React, { useEffect, useRef } from 'react';
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
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    console.log("CirclePackingZoom useEffect running");
    if (!svgRef.current || !hierarchyData) {
      console.error("Missing SVG ref or hierarchy data in zoom component");
      return;
    }
    
    try {
      const svg = d3.select(svgRef.current);
      if (!svg || svg.empty()) {
        console.error("SVG element not found for zoom");
        return;
      }
      
      const g = svg.select('g');
      if (!g || g.empty()) {
        console.error("SVG group element not found for zoom");
        return;
      }
      
      // Create and configure zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 10])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
          
          // Scale text appropriately on zoom
          g.selectAll('.circle-label')
            .attr('font-size', d => Math.min(d.r / 3, 14) / event.transform.k);
        });
      
      // Store the zoom behavior for cleanup
      zoomBehaviorRef.current = zoom;
      
      // Remove any existing zoom behavior first
      svg.on('.zoom', null);
      
      // Apply the zoom behavior
      svg.call(zoom);
      
      console.log("Applied zoom behavior to SVG");
      
      // Set initial transform
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
    } catch (error) {
      console.error("Error setting up zoom:", error);
    }
    
    return () => {
      // Clean up event listeners
      if (svgRef.current) {
        const svgSelection = d3.select(svgRef.current);
        svgSelection.on('.zoom', null);
        svgSelection.on('dblclick', null);
      }
    };
  }, [hierarchyData, dimensions, svgRef]);
  
  return null;
};

export default CirclePackingZoom;
