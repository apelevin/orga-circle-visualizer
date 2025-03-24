
import React from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';
import { getNodeColor } from '@/utils/circlePackingColors';

interface CircleNodesProps {
  root: d3.HierarchyCircularNode<HierarchyNode>;
  colorScale: d3.ScaleOrdinal<string, string>;
  setTooltipData: (data: {
    x: number;
    y: number;
    name: string;
    isRole: boolean;
    fte: number;
    type?: string;
  } | null) => void;
  handleNodeClick: (event: React.MouseEvent, d: d3.HierarchyCircularNode<HierarchyNode>) => void;
}

const CircleNodes: React.FC<CircleNodesProps> = ({ 
  root, 
  colorScale, 
  setTooltipData, 
  handleNodeClick 
}) => {
  
  React.useEffect(() => {
    const svg = d3.select('svg');
    const g = svg.select('g');
    
    // Clear any existing circles to prevent duplication
    g.selectAll('circle.circle-node').remove();
    
    const circles = g.selectAll('circle.circle-node')
      .data(root.descendants().slice(1))
      .enter()
      .append('circle')
      .attr('class', 'circle-node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
      .style('fill', d => getNodeColor(d, colorScale))
      .style('stroke', d => {
        return d.depth === 1 ? 'rgba(0,0,0,0.05)' : 'none';
      })
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', 1)
      .on('click', function(event, d) {
        // Stop event propagation to prevent conflicts with zoom
        event.stopPropagation();
        handleNodeClick(event, d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', d.r * 1.05);

        const name = d.data.name || 'Unnamed';
        const isRole = d.depth === 2;
        const type = d.data.type || (d.parent?.data.type || 'Undefined');
        
        let fte = 0;
        if (isRole) {
          fte = d.value || 0;
        } else if (d.depth === 1) {
          const actualFTE = d.children?.reduce((sum, child) => sum + (child.value || 0), 0) || 0;
          fte = actualFTE;
        }
        
        setTooltipData({
          x: event.pageX,
          y: event.pageY,
          name,
          isRole,
          fte,
          type: isRole ? undefined : type
        });
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', d => d.r);
        
        setTooltipData(null);
      });
      
    return () => {
      // Clean up event listeners on unmount
      circles.on('click', null).on('mouseover', null).on('mouseout', null);
    };
  }, [root, colorScale, setTooltipData, handleNodeClick]);
  
  return null; // This is a rendering-only component with no visible JSX
};

export default CircleNodes;
