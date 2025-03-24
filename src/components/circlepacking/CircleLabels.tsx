
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
    console.log("CircleLabels useEffect running - labels are hidden");
    
    try {
      // Use the group element directly instead of searching for it
      const g = d3.select(groupElement);
      
      if (!g || g.empty()) {
        console.error("SVG group element is invalid in CircleLabels");
        return;
      }
      
      // Clear any existing labels
      g.selectAll('text.circle-label').remove();
      
      // We're not adding any new labels since we want to hide them
      // This component is kept for future reference in case labels need to be restored
      
    } catch (error) {
      console.error("Error in CircleLabels:", error);
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
