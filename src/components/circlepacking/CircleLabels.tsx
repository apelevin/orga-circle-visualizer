
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

interface CircleLabelsProps {
  root: d3.HierarchyCircularNode<HierarchyNode>;
  groupElement: SVGGElement;
}

const CircleLabels: React.FC<CircleLabelsProps> = ({ root, groupElement }) => {
  const labelsRef = useRef<d3.Selection<SVGTextElement, d3.HierarchyCircularNode<HierarchyNode>, SVGGElement, unknown> | null>(null);

  useEffect(() => {
    console.log("CircleLabels useEffect running");
    
    try {
      // Use the group element directly instead of searching for it
      const g = d3.select(groupElement);
      
      if (!g || g.empty()) {
        console.error("SVG group element is invalid in CircleLabels");
        return;
      }
      
      console.log("Found SVG group, rendering labels");
      
      // Clear any existing labels to prevent duplication
      g.selectAll('text.circle-label').remove();
      
      // Create new labels
      const labels = g.selectAll('text.circle-label')
        .data(root.descendants().filter(d => d.depth === 1))
        .enter()
        .append('text')
        .attr('class', 'circle-label')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', d => Math.min(d.r / 3, 14))
        .attr('pointer-events', 'none')
        .attr('fill', 'rgba(0, 0, 0, 0.7)')
        .text(d => d.data.name || 'Unnamed');
      
      // Store the selection for cleanup
      labelsRef.current = labels;
      
      console.log(`Successfully rendered ${labels.size()} labels`);
    } catch (error) {
      console.error("Error rendering labels:", error);
    }
    
    return () => {
      // Clean up on unmount
      if (labelsRef.current) {
        labelsRef.current.remove();
      }
    };
  }, [root, groupElement]);
  
  return null;
};

export default CircleLabels;
