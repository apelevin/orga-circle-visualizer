
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
      
      // Clear any existing labels
      g.selectAll('text.circle-label').remove();
      
      // Create labels for main circles (depth 1)
      const labels = g.selectAll('text.circle-label')
        .data(root.descendants().filter(d => d.depth === 1))
        .enter()
        .append('text')
        .attr('class', 'circle-label')
        .attr('text-anchor', 'middle')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('dy', '.35em')
        .attr('font-size', d => Math.min(d.r / 3, 14))
        .attr('fill', '#333333')
        .style('pointer-events', 'none')
        .style('font-weight', '500')
        .style('font-family', 'Inter, system-ui, sans-serif')
        .style('z-index', 10) // Ensure higher z-index (though in SVG this alone won't work)
        .text(d => d.data.name || '');
      
      // Handle text wrapping for long labels
      labels.each(function(d) {
        const text = d3.select(this);
        const words = (d.data.name || '').split(/\s+/);
        const lineHeight = 1.2;
        const y = d.y;
        
        text.text(null); // Clear text
        
        // If the circle is large enough, wrap text
        if (d.r > 30) {
          let line: string[] = [];
          let lineNumber = 0;
          const tspan = text.append('tspan')
            .attr('x', d.x)
            .attr('y', y)
            .attr('dy', 0);
            
          // Create wrapped text
          words.forEach((word, i) => {
            line.push(word);
            tspan.text(line.join(' '));
            
            // Check if line needs to be wrapped
            if (tspan.node()?.getComputedTextLength() > d.r * 1.5 && i > 0) {
              line.pop();
              tspan.text(line.join(' '));
              line = [word];
              lineNumber++;
              
              text.append('tspan')
                .attr('x', d.x)
                .attr('y', y)
                .attr('dy', `${lineNumber * lineHeight}em`)
                .text(word);
            }
          });
          
          // Center text vertically
          const totalLines = text.selectAll('tspan').size();
          text.selectAll('tspan').attr('dy', (_, i) => 
            `${(i - (totalLines - 1) / 2) * lineHeight}em`
          );
        } else if (d.r > 15) {
          // For smaller circles, just show the first word
          text.append('tspan')
            .attr('x', d.x)
            .attr('y', y)
            .text(words[0]);
        }
      });
      
      // Move the labels to the front to ensure they appear on top of circles
      labels.each(function() {
        this.parentNode?.appendChild(this);
      });
      
      labelsRef.current = labels;
      
      console.log(`Successfully rendered ${labels.size()} labels`);
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
