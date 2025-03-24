
import React, { useEffect, useRef } from 'react';
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
  const circlesRef = useRef<d3.Selection<SVGCircleElement, d3.HierarchyCircularNode<HierarchyNode>, SVGGElement, unknown> | null>(null);
  
  useEffect(() => {
    console.log("CircleNodes useEffect running, rendering circles");
    const svg = d3.select('svg');
    
    // Wait a small amount of time to ensure the SVG group is created
    setTimeout(() => {
      const g = svg.select('g');
      
      if (g.empty()) {
        console.error("SVG group element not found for circles");
        return;
      }
      
      console.log("Found SVG group, rendering circles");
      
      // Clear existing circles first
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
        .style('opacity', 1);
      
      circlesRef.current = circles;
      
      circles
        .on('click', function(event, d) {
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
    }, 100); // Small delay to ensure SVG group exists
    
    return () => {
      if (circlesRef.current) {
        circlesRef.current
          .on('click', null)
          .on('mouseover', null)
          .on('mouseout', null);
      }
    };
  }, [root, colorScale, setTooltipData, handleNodeClick]);
  
  return null;
};

export default CircleNodes;
