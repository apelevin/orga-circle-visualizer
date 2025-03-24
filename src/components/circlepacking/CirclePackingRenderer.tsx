
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

interface CirclePackingRendererProps {
  svgRef: React.RefObject<SVGSVGElement>;
  hierarchyData: d3.HierarchyCircularNode<HierarchyNode> | null;
  dimensions: { width: number; height: number };
  setTooltipData: React.Dispatch<React.SetStateAction<{
    x: number;
    y: number;
    name: string;
    isRole: boolean;
    fte: number;
    type?: string;
  } | null>>;
  handleNodeClick: (event: React.MouseEvent, d: d3.HierarchyCircularNode<HierarchyNode>) => void;
}

const CirclePackingRenderer: React.FC<CirclePackingRendererProps> = ({ 
  svgRef, 
  hierarchyData, 
  dimensions,
  setTooltipData,
  handleNodeClick
}) => {
  const renderCount = useRef(0);

  useEffect(() => {
    if (!svgRef.current || !hierarchyData) {
      return;
    }

    renderCount.current += 1;
    console.log(`Rendering CirclePacking (render #${renderCount.current})`);
    
    try {
      const svg = d3.select(svgRef.current);
      
      svg.selectAll('*').remove();
      
      const root = hierarchyData;
      
      // Get unique types for color mapping
      const types = new Set<string>();
      
      root.children?.forEach((d) => {
        const type = d.data.type || 'Undefined';
        types.add(type);
      });
      
      // Create array from the set of unique types
      const uniqueTypes = Array.from(types);
      
      // Define colors for different types
      const colors: string[] = [
        '#E5DEFF', // Soft Purple
        '#D3E4FD', // Soft Blue
        '#FDE1D3', // Soft Peach
        '#FFDEE2', // Soft Pink
        '#F2FCE2', // Soft Green
        '#FEF7CD', // Soft Yellow
        '#FEC6A1', // Soft Orange
        '#F1F0FB', // Soft Gray
        '#8B5CF6', // Vivid Purple
        '#D946EF', // Magenta Pink
        '#F97316', // Bright Orange
        '#0EA5E9'  // Ocean Blue
      ];
      
      // Create a color scale based on circle types
      const colorScale = d3.scaleOrdinal<string>()
        .domain(uniqueTypes)
        .range(colors.slice(0, uniqueTypes.length));
      
      const g = svg.append('g');
      
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
            // Use the color based on the circle's type
            return colorScale(d.data.type || 'Undefined');
          } else if (d.depth === 2) {
            // For roles, darken the parent circle's color
            const parentColor = d3.color(colorScale(d.parent?.data.type || 'Undefined')) || d3.color('#E5DEFF')!;
            return parentColor.darker(0.2).toString();
          }
          return '#FFFFFF';
        })
        .style('stroke', d => {
          return d.depth === 1 ? 'rgba(0,0,0,0.05)' : 'none';
        })
        .style('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('opacity', 1)
        .on('click', function(event, d) {
          handleNodeClick(event, d);
        })
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('r', d.r * 1.05);

          const name = d.data.name || 'Unnamed';
          const isRole = d.depth === 2;
          const type = d.data.type || (d.parent?.data.type || 'Undefined');
          
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
            type: isRole ? undefined : type
          });
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('r', d => d.r);
          
          setTooltipData(null);
        });
      
      // Add circle labels for better navigation
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
      
      // Create and configure zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 10])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
          
          // Scale text appropriately on zoom
          g.selectAll('.circle-label')
            .attr('font-size', d => Math.min(d.r / 3, 14) / event.transform.k);
        });
      
      svg.call(zoom);
      
      const initialTransform = d3.zoomIdentity.translate(
        dimensions.width / 2 - root.x,
        dimensions.height / 2 - root.y
      ).scale(0.9);
      
      svg.call(zoom.transform, initialTransform);
      
      // Double-click to reset zoom
      svg.on('dblclick.zoom', null);
      svg.on('dblclick', () => {
        svg.transition()
          .duration(750)
          .call(zoom.transform, initialTransform);
      });
      
    } catch (err) {
      console.error("Error rendering visualization:", err);
    }
  }, [hierarchyData, dimensions, svgRef, setTooltipData, handleNodeClick]);

  return null; // This is a rendering-only component with no visible JSX
};

export default CirclePackingRenderer;
