
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
  groupElement: SVGGElement;
}

const CircleNodes: React.FC<CircleNodesProps> = ({ 
  root, 
  colorScale, 
  setTooltipData, 
  handleNodeClick,
  groupElement
}) => {
  const circlesRef = useRef<d3.Selection<SVGCircleElement, d3.HierarchyCircularNode<HierarchyNode>, SVGGElement, unknown> | null>(null);
  
  useEffect(() => {
    console.log("CircleNodes useEffect running, rendering circles");
    
    try {
      // Use the group element directly
      const g = d3.select(groupElement);
      
      if (!g || g.empty()) {
        console.error("SVG group element is invalid in CircleNodes");
        return;
      }
      
      console.log("Found SVG group, rendering circles");
      console.log("ColorScale is valid:", typeof colorScale === 'function');
      
      if (typeof colorScale !== 'function') {
        console.error("ColorScale is not a function in CircleNodes, cannot proceed");
        return;
      }
      
      // Clear existing circles first
      g.selectAll('circle.circle-node').remove();
      
      // Log the descendants data for debugging
      const descendants = root.descendants().slice(1);
      console.log(`Rendering ${descendants.length} circles`);
      
      // Create and append circles with data from the hierarchy
      const circles = g.selectAll('circle.circle-node')
        .data(descendants)
        .enter()
        .append('circle')
        .attr('class', 'circle-node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => Math.max(d.r, 3)) // Ensure circles are visible even if small
        .style('fill', d => {
          try {
            const color = getNodeColor(d, colorScale);
            console.log(`Node ${d.data.name} (depth: ${d.depth}) gets color: ${color}`);
            return color;
          } catch (error) {
            console.error("Error getting node color:", error);
            return d.depth === 1 ? '#E5DEFF' : '#D3E4FD';
          }
        })
        .style('stroke', d => {
          return d.depth === 1 ? 'rgba(0,0,0,0.05)' : 'none';
        })
        .style('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('opacity', 0.9); // Slightly transparent to help text readability
      
      circlesRef.current = circles;
      
      // Add event handlers to the circles
      circles
        .on('click', function(event, d) {
          console.log("Circle clicked:", d.data.name);
          event.stopPropagation();
          handleNodeClick(event, d);
        })
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('r', d.r * 1.05)
            .style('opacity', 1);

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
            .attr('r', d => d.r)
            .style('opacity', 0.9);
          
          setTooltipData(null);
        });
        
      console.log(`Successfully rendered ${circles.size()} circles`);
    } catch (error) {
      console.error("Error rendering circles:", error);
    }
    
    return () => {
      if (circlesRef.current) {
        circlesRef.current
          .on('click', null)
          .on('mouseover', null)
          .on('mouseout', null);
      }
    };
  }, [root, colorScale, setTooltipData, handleNodeClick, groupElement]);
  
  return null;
};

export default CircleNodes;
