import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HierarchyNode, CirclePackingNode } from '@/types';
import { toast } from "sonner";
import InfoPanel from './InfoPanel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CirclePackingChartProps {
  data: HierarchyNode;
}

const CirclePackingChart: React.FC<CirclePackingChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [error, setError] = useState<string | null>(null);
  
  // State for the info panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<{
    name: string;
    value: number;
    roles?: { name: string; value: number }[];
    parent?: string;
    isRole?: boolean;
  } | null>(null);

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
    if (!svgRef.current || !data) {
      console.error("Missing required refs or data", { 
        svgRef: !!svgRef.current, 
        data: !!data,
        dataChildren: data?.children?.length
      });
      return;
    }

    // Validate data structure
    if (!data.children || data.children.length === 0) {
      setError("No valid organization data found");
      return;
    }

    setError(null);
    
    try {
      const svg = d3.select(svgRef.current);
      
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
      
      console.log("D3 hierarchy created:", {
        root: root,
        children: root.children?.length,
        depth: root.depth,
        height: root.height
      });
      
      // Define color scale for the circles
      const colorScale = d3.scaleOrdinal<string>()
        .domain(root.children?.map(d => d.data.name || '') || [])
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
      
      // Handle circle click
      const handleCircleClick = (event: MouseEvent, d: d3.HierarchyCircularNode<HierarchyNode>) => {
        event.stopPropagation();
        
        const isMainCircle = d.depth === 1;
        const isRoleCircle = d.depth === 2;
        
        if (isMainCircle) {
          const circleName = d.data.name || 'Unnamed Circle';
          const totalFTE = d.value || 0;
          
          // Extract roles data
          const roles = d.children?.map(role => ({
            name: role.data.name || 'Unnamed Role',
            value: role.value || 0
          })) || [];
          
          setSelectedCircle({
            name: circleName,
            value: totalFTE,
            roles: roles,
            isRole: false
          });
          
          setIsPanelOpen(true);
        } else if (isRoleCircle) {
          const roleName = d.data.name || 'Unnamed Role';
          const fte = d.value || 0;
          const circleName = d.parent?.data.name || 'Unnamed Circle';
          
          setSelectedCircle({
            name: roleName,
            value: fte,
            parent: circleName,
            isRole: true
          });
          
          setIsPanelOpen(true);
        }
      };

      // Create a foreign object for each node to contain our React tooltip component
      const tooltipGroups = g.selectAll('.tooltip-group')
        .data(root.descendants().slice(1))
        .enter()
        .append('g')
        .attr('class', 'tooltip-group')
        .attr('transform', d => `translate(${d.x},${d.y})`);
      
      // Draw circles for all nodes except the root
      tooltipGroups.append('circle')
        .attr('class', 'circle-node')
        .attr('r', d => d.r)
        .style('fill', d => {
          if (d.depth === 1) {
            return colorScale(d.data.name || '');
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
        .on('click', handleCircleClick)
        .on('mouseover', function() {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('r', d => d.r * 1.05);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('r', d => d.r);
        })
        .transition()
        .duration(500)
        .delay((d, i) => i * 10)
        .style('opacity', 1);
      
      // Add data-name and data-role attributes to circles for tooltips
      tooltipGroups.each(function(d) {
        const element = this;
        // Store data for the tooltip
        d3.select(element).attr('data-name', d.data.name || 'Unnamed');
        d3.select(element).attr('data-depth', d.depth);
        d3.select(element).attr('data-fte', d.value || 0);
        if (d.depth === 2) {
          d3.select(element).attr('data-parent', d.parent?.data.name || 'Unnamed');
        }
      });
      
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
      tooltipGroups.on('dblclick', (event, d) => {
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
      
      // We'll implement React tooltips in the render method below
      
    } catch (err) {
      console.error("Error rendering visualization:", err);
      setError("Failed to render the organization chart");
      toast.error("Error rendering the visualization. Please try again.");
    }
  }, [data, dimensions]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-6 bg-destructive/10 rounded-lg">
          <h3 className="text-lg font-medium text-destructive mb-2">Visualization Error</h3>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm mt-2">Please check your Excel file format and try again.</p>
        </div>
      </div>
    );
  }

  // Custom tooltip component to display over SVG elements
  const CircleTooltip = ({ element }: { element: Element }) => {
    const name = element.getAttribute('data-name') || 'Unnamed';
    const depth = parseInt(element.getAttribute('data-depth') || '0');
    const isRole = depth === 2;
    const parent = element.getAttribute('data-parent');
    
    return (
      <TooltipContent side="top" className="text-xs font-medium py-1 px-2" sideOffset={5}>
        {isRole ? (
          <span>{name} <span className="text-muted-foreground">(Role)</span></span>
        ) : (
          <span>{name} <span className="text-muted-foreground">(Circle)</span></span>
        )}
      </TooltipContent>
    );
  };

  return (
    <TooltipProvider>
      <div className="w-full h-full flex-1 relative animate-fade-in" ref={containerRef}>
        <svg 
          ref={svgRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="mx-auto bg-white/50 rounded-lg"
        />
        
        <InfoPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          selectedCircle={selectedCircle}
        />
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Hover over a circle to see its name. Click on a circle to see details. Double-click on a circle to zoom in. Double-click on the background to reset the view.</p>
        </div>

        {/* Add tooltips for all circles using mutation observer */}
        <TooltipWrapper svgRef={svgRef} />
      </div>
    </TooltipProvider>
  );
};

// Component that adds tooltips to SVG elements using mutation observer
const TooltipWrapper = ({ svgRef }: { svgRef: React.RefObject<SVGSVGElement> }) => {
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Get all tooltip groups
    const tooltipGroups = svgRef.current.querySelectorAll('.tooltip-group');
    
    tooltipGroups.forEach(group => {
      // Create a React tooltip for each group
      const tooltipRoot = document.createElement('div');
      tooltipRoot.className = 'tooltip-root absolute';
      tooltipRoot.style.pointerEvents = 'none';
      document.body.appendChild(tooltipRoot);
      
      // Position the tooltip
      const updateTooltipPosition = () => {
        const rect = group.getBoundingClientRect();
        tooltipRoot.style.left = `${rect.left + rect.width / 2}px`;
        tooltipRoot.style.top = `${rect.top + rect.height / 2}px`;
      };
      
      // Show tooltip on mouseover
      group.addEventListener('mouseover', () => {
        updateTooltipPosition();
        const name = group.getAttribute('data-name');
        const depth = group.getAttribute('data-depth');
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'bg-popover text-popover-foreground rounded-md px-3 py-1.5 text-xs font-medium shadow-md fixed -translate-x-1/2 -translate-y-full mt-1 z-50 animate-fade-in';
        
        // Add appropriate content
        if (depth === '2') {
          tooltip.innerHTML = `${name} <span class="text-muted-foreground">(Role)</span>`;
        } else {
          tooltip.innerHTML = `${name} <span class="text-muted-foreground">(Circle)</span>`;
        }
        
        tooltipRoot.appendChild(tooltip);
        
        // Position tooltip above the circle
        tooltip.style.marginTop = '-8px';
      });
      
      // Hide tooltip on mouseout
      group.addEventListener('mouseout', () => {
        while (tooltipRoot.firstChild) {
          tooltipRoot.removeChild(tooltipRoot.firstChild);
        }
      });
      
      // Update position on scroll and resize
      window.addEventListener('scroll', updateTooltipPosition);
      window.addEventListener('resize', updateTooltipPosition);
      
      // Clean up
      return () => {
        window.removeEventListener('scroll', updateTooltipPosition);
        window.removeEventListener('resize', updateTooltipPosition);
        document.body.removeChild(tooltipRoot);
      };
    });
    
    // Clean up function
    return () => {
      document.querySelectorAll('.tooltip-root').forEach(el => {
        document.body.removeChild(el);
      });
    };
  }, [svgRef]);
  
  return null;
};

export default CirclePackingChart;
