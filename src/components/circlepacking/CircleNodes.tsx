
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
      // Use the group element directly instead of searching for it
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
      
      // Create and append circles with data from the hierarchy
      const circles = g.selectAll('circle.circle-node')
        .data(root.descendants().slice(1))
        .enter()
        .append('circle')
        .attr('class', 'circle-node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.r)
        .style('fill', d => {
          try {
            return getNodeColor(d, colorScale);
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
        .style('opacity', 1);
      
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
