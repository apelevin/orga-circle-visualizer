
import React from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

interface WarningIconsProps {
  root: d3.HierarchyCircularNode<HierarchyNode>;
}

const WarningIcons: React.FC<WarningIconsProps> = ({ root }) => {
  React.useEffect(() => {
    const svg = d3.select('svg');
    const g = svg.select('g');
    
    g.selectAll('.warning-icon')
      .data(root.descendants().filter(d => {
        if (d.depth === 1) {
          const actualFTE = d.children?.reduce((sum, child) => sum + (child.value || 0), 0) || 0;
          return actualFTE > 10;
        }
        return false;
      }))
      .enter()
      .append('g')
      .attr('class', 'warning-icon')
      .attr('transform', d => `translate(${d.x + d.r * 0.6}, ${d.y - d.r * 0.6})`)
      .append('path')
      .attr('d', 'M23.432 17.925L14.408 3.366c-.933-1.517-3.142-1.517-4.076 0L1.308 17.925c-.933 1.519.235 3.423 2.038 3.423h18.047c1.803 0 2.971-1.904 2.038-3.423zM12.37 16.615a1.219 1.219 0 0 1-1.225 1.224 1.22 1.22 0 0 1-1.225-1.224v-.028c0-.675.55-1.197 1.225-1.197s1.225.522 1.225 1.197v.028zm0-3.824c0 .675-.55 1.224-1.225 1.224a1.22 1.22 0 0 1-1.225-1.224v-4.13c0-.675.55-1.225 1.225-1.225s1.225.55 1.225 1.224v4.131z')
      .attr('transform', 'scale(0.8)')
      .attr('fill', '#FF9800')
      .style('opacity', 1);
      
  }, [root]);
  
  return null; // This is a rendering-only component with no visible JSX
};

export default WarningIcons;
