
import { useEffect, useState, RefObject } from 'react';
import * as d3 from 'd3';
import { HierarchyNode, CirclePackingNode } from '@/types';
import { toast } from "sonner";

interface UseD3CirclePackingProps {
  svgRef: RefObject<SVGSVGElement>;
  containerRef: RefObject<HTMLDivElement>;
  data: HierarchyNode;
  dimensions: { width: number; height: number };
  onNodeClick: (event: React.MouseEvent | null, d: d3.HierarchyCircularNode<HierarchyNode>) => void;
  setTooltipData: (data: {
    x: number;
    y: number;
    name: string;
    isRole: boolean;
    fte: number;
    type?: string;
  } | null) => void;
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
      
      const hierarchy = d3.hierarchy(data)
        .sum(d => d.value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));
      
      console.log("Hierarchy values:", {
        root: hierarchy.value,
        children: hierarchy.children?.map(c => ({ 
          name: c.data.name, 
          value: c.value,
          type: c.data.type,
          childrenSum: c.children?.reduce((sum, child) => sum + (child.value || 0), 0)
        }))
      });
      
      const pack = d3.pack<HierarchyNode>()
        .size([dimensions.width, dimensions.height])
        .padding(3);
      
      const root = pack(hierarchy);
      
      setHierarchyData(root);
      
      console.log("D3 hierarchy created:", {
        root: root,
        children: root.children?.length,
        depth: root.depth,
        height: root.height
      });

      // Create a color scale based on unique types
      const types = Array.from(new Set(root.children?.map(d => d.data.type || 'The others') || []));
      const colorScale = d3.scaleOrdinal<string>()
        .domain(types)
        .range([
          '#E5DEFF',
          '#D3E4FD',
          '#FDE1D3',
          '#FFDEE2',
          '#F2FCE2',
          '#FEF7CD'
        ]);
      
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
        .style('fill', d => {
          if (d.depth === 1) {
            return colorScale(d.data.type || 'The others');
          } else if (d.depth === 2) {
            const parentColor = d3.color(colorScale(d.parent?.data.type || 'The others')) || d3.color('#E5DEFF')!;
            return parentColor.darker(0.2).toString();
          }
          return '#FFFFFF';
        })
        .style('stroke', d => {
          return d.depth === 1 ? 'rgba(0,0,0,0.05)' : 'none';
        })
        .style('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('opacity', 1) // Set immediate opacity to 1 instead of 0
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
      
      // Animation can be added here if needed
      circles.transition()
        .duration(500)
        .delay((d, i) => i * 10);
      
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
        .style('opacity', 1); // Set immediate opacity to 1 instead of 0
      
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.4, 10])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });
      
      svg.call(zoom);
      
      const initialTransform = d3.zoomIdentity.translate(
        dimensions.width / 2 - root.x,
        dimensions.height / 2 - root.y
      ).scale(0.9);
      
      svg.call(zoom.transform, initialTransform);
      
      svg.on('dblclick.zoom', () => {
        svg.transition()
          .duration(750)
          .call(zoom.transform, initialTransform);
      });
      
    } catch (err) {
      console.error("Error rendering visualization:", err);
      setError("Failed to render the organization chart");
      toast.error("Error rendering the visualization. Please try again.");
    }
  }, [data, dimensions, onNodeClick, setTooltipData]);

  return { hierarchyData, error };
};
