
import { useState } from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

interface TooltipData {
  x: number;
  y: number;
  name: string;
  isRole: boolean;
  fte: number;
  type?: string;
}

export const useCircleTooltip = () => {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  const handleMouseOver = (d: d3.HierarchyCircularNode<HierarchyNode>) => {
    d3.select(d.target as SVGCircleElement)
      .transition()
      .duration(300)
      .attr('r', d.r * 1.05);

    const name = d.data.name || 'Unnamed';
    const isRole = d.depth === 2;
    
    let fte = 0;
    if (isRole) {
      fte = d.value || 0;
    } else if (d.depth === 1) {
      const actualFTE = d.children?.reduce((sum, child) => sum + (child.value || 0), 0) || 0;
      fte = actualFTE;
    }
    
    setTooltipData({
      x: d.x,
      y: d.y,
      name,
      isRole,
      fte,
      type: d.data.type || 'The others'
    });
  };

  const handleMouseOut = (target: d3.HierarchyCircularNode<HierarchyNode>) => {
    d3.select(target.target as SVGCircleElement)
      .transition()
      .duration(300)
      .attr('r', target.r);
    
    setTooltipData(null);
  };

  return {
    tooltipData,
    setTooltipData,
    handleMouseOver,
    handleMouseOut
  };
};

export type { TooltipData };
