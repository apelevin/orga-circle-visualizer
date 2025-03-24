
import React from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

interface CircleLabelsProps {
  root: d3.HierarchyCircularNode<HierarchyNode>;
}

const CircleLabels: React.FC<CircleLabelsProps> = ({ root }) => {
  React.useEffect(() => {
    const svg = d3.select('svg');
    const g = svg.select('g');
    
    g.selectAll('.circle-label')
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
      
  }, [root]);
  
  return null; // This is a rendering-only component with no visible JSX
};

export default CircleLabels;
