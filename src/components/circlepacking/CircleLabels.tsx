
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

interface CircleLabelsProps {
  root: d3.HierarchyCircularNode<HierarchyNode>;
  groupElement: SVGGElement;
}

const CircleLabels: React.FC<CircleLabelsProps> = ({ root, groupElement }) => {
  const labelsRef = useRef<d3.Selection<SVGTextElement, d3.HierarchyCircularNode<HierarchyNode>, SVGGElement, unknown> | null>(null);

  // Function to wrap text in SVG
  const wrap = (text: d3.Selection<SVGTextElement, unknown, null, undefined>, width: number) => {
    text.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      const lineHeight = 1.1; // ems
      const y = text.attr("y");
      const dy = parseFloat(text.attr("dy") || "0");
      
      let word;
      let line: string[] = [];
      let lineNumber = 0;
      let tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node() && (tspan.node() as SVGTSpanElement).getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  };

  useEffect(() => {
    console.log("CircleLabels useEffect running");
    
    try {
      // Use the group element directly
      const g = d3.select(groupElement);
      
      if (!g || g.empty()) {
        console.error("SVG group element is invalid in CircleLabels");
        return;
      }
      
      // Create a new group for labels to ensure they're on top
      g.select('g.circle-labels-container').remove();
      const labelsGroup = g.append('g')
        .attr('class', 'circle-labels-container');
      
      // Filter for circles (depth 1) that have a radius large enough for a label
      const circlesWithLabels = root
        .descendants()
        .filter(d => d.depth === 1 && d.r > 20)
        .sort((a, b) => b.r - a.r); // Sort by radius for layering
      
      console.log(`Rendering labels for ${circlesWithLabels.length} circles`);
      
      // Create text elements for circle labels
      const labels = labelsGroup
        .selectAll('text.circle-label')
        .data(circlesWithLabels)
        .enter()
        .append('text')
        .attr('class', 'circle-label')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('text-anchor', 'middle')
        .attr('dy', '0em')
        .style('fill', '#1A1F2C') // Dark text color
        .style('font-size', d => Math.min(d.r / 3, 14) + 'px')
        .style('pointer-events', 'none')
        .style('font-weight', '500')
        .style('font-family', 'Inter, system-ui, sans-serif')
        .text(d => d.data.name || '');
      
      // Handle text wrapping for long labels
      labels.each(function(d) {
        const textElement = d3.select(this);
        const circleDiameter = d.r * 1.5; // Use percentage of circle diameter for wrapping
        wrap(textElement, circleDiameter);
        
        // Adjust vertical position based on number of lines
        const tspans = textElement.selectAll('tspan');
        const lineCount = tspans.size();
        
        if (lineCount > 1) {
          const verticalOffset = -(lineCount - 1) * 0.5; // Offset to center text vertically
          tspans.attr('dy', (_, i) => {
            if (i === 0) return verticalOffset + 'em';
            return '1.1em'; // Line height for additional lines
          });
        }
      });
      
      // Store the selection for cleanup
      labelsRef.current = labels;
      
      console.log(`Successfully rendered ${labels.size()} labels`);
    } catch (error) {
      console.error("Error rendering circle labels:", error);
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
