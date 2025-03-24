
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
      
      // Clear existing circles first
      g.selectAll('circle.circle-node').remove();
      
      // Get the descendants data for debugging
      const descendants = root.descendants().slice(1);
      console.log(`Rendering ${descendants.length} circles`);
      
      // Log the types for debugging
      const types = new Set<string>();
      descendants
        .filter(d => d.depth === 1)
        .forEach(d => {
          const type = d.data.type || 'Undefined';
          types.add(type);
          console.log(`Circle: ${d.data.name}, Type: ${type}`);
        });
      console.log("Circle types in data:", Array.from(types));
      
      // Create circles for each node
      const circles = g.selectAll('circle.circle-node')
        .data(descendants)
        .enter()
        .append('circle')
        .attr('class', 'circle-node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => Math.max(d.r, 3)) // Ensure circles are visible even if small
        .style('fill', d => {
          const color = getNodeColor(d, colorScale);
          console.log(`Setting color for ${d.data.name} (type: ${d.data.type || 'unknown'}): ${color}`);
          return color;
        })
        .style('stroke', d => d.depth === 1 ? 'rgba(255,255,255,0.7)' : 'none')
        .style('stroke-width', d => d.depth === 1 ? 2 : 1)
        .style('cursor', 'pointer')
        .style('fill-opacity', 0.9);
      
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
            .style('fill-opacity', 1)
            .style('stroke', '#ffffff')
            .style('stroke-width', 2);

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
            .style('fill-opacity', 0.9)
            .style('stroke', d => d.depth === 1 ? 'rgba(255,255,255,0.7)' : 'none')
            .style('stroke-width', d => d.depth === 1 ? 2 : 1);
          
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
