
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

interface WarningIconsProps {
  root: d3.HierarchyCircularNode<HierarchyNode>;
  groupElement: SVGGElement;
}

const WarningIcons: React.FC<WarningIconsProps> = ({ root, groupElement }) => {
  const iconsRef = useRef<d3.Selection<SVGGElement, d3.HierarchyCircularNode<HierarchyNode>, SVGGElement, unknown> | null>(null);

  useEffect(() => {
    console.log("WarningIcons useEffect running");
    
    try {
      // Use the group element directly
      const g = d3.select(groupElement);
      
      if (!g || g.empty()) {
        console.error("SVG group element is invalid in WarningIcons");
        return;
      }
      
      console.log("Found SVG group, rendering warning icons");
      
      // Create a new group for warning icons to ensure they're at the top
      g.select('g.warning-icons-container').remove();
      const iconsGroup = g.append('g')
        .attr('class', 'warning-icons-container');
      
      // Create new warning icons
      const icons = iconsGroup.selectAll('g.warning-icon')
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
        .attr('pointer-events', 'none');
        
      // Add triangle warning icons
      icons.append('path')
        .attr('d', 'M-6,-10 L6,-10 L0,3 Z')
        .attr('fill', '#F59E0B')
        .attr('stroke', 'white')
        .attr('stroke-width', '1px')
        .style('opacity', 0.9);
      
      // Store the selection for cleanup
      iconsRef.current = icons;
      
      console.log(`Successfully rendered ${icons.size()} warning icons`);
    } catch (error) {
      console.error("Error rendering warning icons:", error);
    }
    
    return () => {
      // Clean up on unmount
      if (iconsRef.current) {
        iconsRef.current.remove();
      }
    };
  }, [root, groupElement]);
  
  return null;
};

export default WarningIcons;
