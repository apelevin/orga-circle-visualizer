
import { useEffect, useState, RefObject } from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';
import { toast } from "sonner";
import { TooltipData, useCircleTooltip } from './useCircleTooltip';
import { useCircleWarningIndicators } from './useCircleWarningIndicators';
import { useCircleZoom } from './useCircleZoom';
import { 
  createHierarchy,
  createPackLayout,
  createColorScale,
  getNodeColor
} from '@/utils/d3CirclePackingUtils';

interface UseD3CirclePackingProps {
  svgRef: RefObject<SVGSVGElement>;
  containerRef: RefObject<HTMLDivElement>;
  data: HierarchyNode;
  dimensions: { width: number; height: number };
  onNodeClick: (event: React.MouseEvent | null, d: d3.HierarchyCircularNode<HierarchyNode>) => void;
  setTooltipData: (data: TooltipData | null) => void;
}

export const useD3CirclePacking = ({
  svgRef,
  containerRef,
  data,
  dimensions,
  onNodeClick,
  setTooltipData
}: UseD3CirclePackingProps) => {
  const [hierarchyData, setHierarchyData] = useState<d3.HierarchyCircularNode<HierarchyNode> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { drawWarningIndicators } = useCircleWarningIndicators();
  const { setupZoom } = useCircleZoom();

  useEffect(() => {
    if (!svgRef.current || !data) {
      console.error("Missing required refs or data", { 
        svgRef: !!svgRef.current, 
        data: !!data,
        dataChildren: data?.children?.length
      });
      return;
    }

    if (!data.children || data.children.length === 0) {
      setError("No valid organization data found");
      return;
    }

    setError(null);
    
    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      
      // Create hierarchy and packaging layout
      const hierarchy = createHierarchy(data);
      
      console.log("Hierarchy values:", {
        root: hierarchy.value,
        children: hierarchy.children?.map(c => ({ 
          name: c.data.name, 
          value: c.value,
          type: c.data.type,
          childrenSum: c.children?.reduce((sum, child) => sum + (child.value || 0), 0)
        }))
      });
      
      const pack = createPackLayout(dimensions.width, dimensions.height);
      const root = pack(hierarchy);
      
      setHierarchyData(root);
      
      console.log("D3 hierarchy created:", {
        root: root,
        children: root.children?.length,
        depth: root.depth,
        height: root.height
      });

      // Create color scale with proper type assertion
      const types = Array.from(
        new Set(
          root.children?.map(d => d.data.type || 'The others') || []
        )
      ) as string[];
      
      const colorScale = createColorScale(types);
      
      const g = svg.append('g');
      
      // Draw circles with immediate visibility
      const circles = g.selectAll('circle')
        .data(root.descendants().slice(1))
        .enter()
        .append('circle')
        .attr('class', 'circle-node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.r)
        .style('fill', d => getNodeColor(d, colorScale))
        .style('stroke', d => d.depth === 1 ? 'rgba(0,0,0,0.05)' : 'none')
        .style('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('opacity', 1)
        .on('click', function(event, d) {
          onNodeClick(event, d);
        })
        .on('mouseover', function(event, d) {
          d3.select(this)
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
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('r', d => d.r);
          
          setTooltipData(null);
        });
      
      // Add animation
      circles.transition()
        .duration(500)
        .delay((d, i) => i * 10);
      
      // Draw warning indicators
      drawWarningIndicators(g, root);
      
      // Setup zoom behavior
      setupZoom(svg, g, dimensions, root.x, root.y);
      
    } catch (err) {
      console.error("Error rendering visualization:", err);
      setError("Failed to render the organization chart");
      toast.error("Error rendering the visualization. Please try again.");
    }
  }, [data, dimensions, onNodeClick, setTooltipData, drawWarningIndicators, setupZoom]);

  return { hierarchyData, error };
};
