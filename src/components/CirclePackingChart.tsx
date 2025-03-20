
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HierarchyNode, CirclePackingNode } from '@/types';

interface CirclePackingChartProps {
  data: HierarchyNode;
}

const CirclePackingChart: React.FC<CirclePackingChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 300)
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Create and update visualization
  useEffect(() => {
    if (!svgRef.current || !data || !data.children || !tooltipRef.current) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    
    // Clear the SVG
    svg.selectAll('*').remove();
    
    // Create hierarchy and pack layout
    const hierarchy = d3.hierarchy(data)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));
    
    const pack = d3.pack<HierarchyNode>()
      .size([dimensions.width, dimensions.height])
      .padding(3);
    
    const root = pack(hierarchy);
    
    // Define color scale for the circles
    const colorScale = d3.scaleOrdinal<string>()
      .domain(root.children?.map(d => d.data.name) || [])
      .range([
        '#E5DEFF', // Soft Purple
        '#D3E4FD', // Soft Blue
        '#FDE1D3', // Soft Peach
        '#FFDEE2', // Soft Pink
        '#F2FCE2', // Soft Green
        '#FEF7CD'  // Soft Yellow
      ]);
    
    // Create group for all circles
    const g = svg.append('g');
    
    // Tooltip functions
    const showTooltip = (event: MouseEvent, d: d3.HierarchyCircularNode<HierarchyNode>) => {
      const isMainCircle = d.depth === 1;
      const isRoleCircle = d.depth === 2;
      
      let content = '';
      
      if (isMainCircle) {
        const circleName = d.data.name;
        const totalFTE = d.value?.toFixed(2);
        const roles = d.children?.length || 0;
        
        content = `
          <div class="font-medium mb-1">${circleName}</div>
          <div class="text-sm">Total FTE: ${totalFTE}</div>
          <div class="text-sm">Roles: ${roles}</div>
        `;
      } else if (isRoleCircle) {
        const roleName = d.data.name;
        const fte = d.value?.toFixed(2);
        const circleName = d.parent?.data.name;
        
        content = `
          <div class="font-medium mb-1">${roleName}</div>
          <div class="text-sm">FTE: ${fte}</div>
          <div class="text-sm">Circle: ${circleName}</div>
        `;
      }
      
      tooltip.html(content)
        .style('left', `${event.pageX + 15}px`)
        .style('top', `${event.pageY - 28}px`)
        .classed('visible', true);
    };
    
    const hideTooltip = () => {
      tooltip.classed('visible', false);
    };

    const moveTooltip = (event: MouseEvent) => {
      tooltip
        .style('left', `${event.pageX + 15}px`)
        .style('top', `${event.pageY - 28}px`);
    };
    
    // Draw circles for all nodes except the root
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
          return colorScale(d.data.name);
        } else if (d.depth === 2) {
          // Make role circles a darker shade of their parent
          const parentColor = d3.color(colorScale(d.parent?.data.name || '')) || d3.color('#E5DEFF')!;
          return parentColor.darker(0.2).toString();
        }
        return '#FFFFFF';
      })
      .style('stroke', d => {
        return d.depth === 1 ? 'rgba(0,0,0,0.05)' : 'none';
      })
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', 0) // Start with opacity 0 for animation
      .on('mouseover', function(event, d) {
        showTooltip(event, d);
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', d => d.r * 1.05);
      })
      .on('mousemove', moveTooltip)
      .on('mouseout', function(event, d) {
        hideTooltip();
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', d => d.r);
      });
    
    // Animate circles appearance
    circles.transition()
      .duration(500)
      .delay((d, i) => i * 10)
      .style('opacity', 1);

    // Add labels for main circles only
    g.selectAll('text')
      .data(root.descendants().filter(d => d.depth === 1))
      .enter()
      .append('text')
      .attr('class', 'circle-label')
      .attr('dy', '.3em')
      .style('text-anchor', 'middle')
      .style('font-size', d => {
        // Safe calculation for font size that won't cause 'length' of undefined errors
        const name = d.data.name || '';
        const fontSize = Math.min(2 * d.r, (2 * d.r - 8) / (name.length || 1) * 10);
        return `${fontSize}px`;
      })
      .style('fill', 'rgba(0,0,0,0.75)')
      .attr('opacity', 0) // Start with opacity 0 for animation
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => d.data.name || '')
      .transition()
      .delay((d, i) => 500 + i * 50)
      .duration(500)
      .attr('opacity', 1);
    
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Center the visualization
    const initialTransform = d3.zoomIdentity.translate(
      dimensions.width / 2 - root.x,
      dimensions.height / 2 - root.y
    );
    svg.call(zoom.transform, initialTransform);
    
    // Double click on circles to zoom
    circles.on('dblclick', (event, d) => {
      event.stopPropagation();
      
      const scale = Math.min(8, dimensions.width / (2 * d.r));
      const transform = d3.zoomIdentity
        .translate(dimensions.width / 2, dimensions.height / 2)
        .scale(scale)
        .translate(-d.x, -d.y);
      
      svg.transition()
        .duration(750)
        .call(zoom.transform, transform);
    });
    
    // Double click on background to reset zoom
    svg.on('dblclick', () => {
      svg.transition()
        .duration(750)
        .call(zoom.transform, initialTransform);
    });
    
  }, [data, dimensions]);

  return (
    <div className="w-full h-full flex-1 relative animate-fade-in" ref={containerRef}>
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="mx-auto bg-white/50 rounded-lg"
      />
      <div 
        ref={tooltipRef} 
        className="absolute invisible bg-white p-2 rounded shadow-lg border border-border z-50 max-w-xs pointer-events-none tooltip"
      />
    </div>
  );
};

export default CirclePackingChart;
