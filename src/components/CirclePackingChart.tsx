
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HierarchyNode, CirclePackingNode } from '@/types';
import { toast } from "sonner";
import InfoPanel from './InfoPanel';
import { AlertTriangle } from 'lucide-react';

interface CirclePackingChartProps {
  data: HierarchyNode;
}

const CirclePackingChart: React.FC<CirclePackingChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [error, setError] = useState<string | null>(null);
  
  // Hierarchy data reference for finding nodes
  const [hierarchyData, setHierarchyData] = useState<d3.HierarchyCircularNode<HierarchyNode> | null>(null);
  
  // State for the info panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<{
    name: string;
    value: number;
    roles?: { name: string; value: number }[];
    parent?: string;
    isRole?: boolean;
  } | null>(null);

  // State for tooltip positioning
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    name: string;
    isRole: boolean;
    fte: number;
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

  // Function to handle clicking a circle or role name in the info panel
  const handleCircleOrRoleClick = (nodeName: string) => {
    if (!hierarchyData) return;
    
    // First try to find a circle with this name
    const foundCircle = hierarchyData
      .descendants()
      .find(node => node.depth === 1 && node.data.name === nodeName);
      
    // If not found as a circle, try to find as a role
    const foundRole = !foundCircle ? 
      hierarchyData
        .descendants()
        .find(node => node.depth === 2 && node.data.name === nodeName) : 
      null;
      
    if (foundCircle || foundRole) {
      const targetNode = foundCircle || foundRole;
      
      // Update the selected circle data
      if (targetNode) {
        handleNodeClick(null, targetNode);
      }
    } else {
      toast.error(`Could not find "${nodeName}" in the visualization`);
    }
  };

  const handleNodeClick = (event: React.MouseEvent | null, d: d3.HierarchyCircularNode<HierarchyNode>) => {
    if (event) event.stopPropagation();
    
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
      
      // Store hierarchy data for later node lookups
      setHierarchyData(root);
      
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
        .on('click', function(event, d) {
          handleNodeClick(event, d);
        })
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('r', d.r * 1.05);

          // Set tooltip data for rendering
          const name = d.data.name || 'Unnamed';
          const isRole = d.depth === 2;
          const fte = d.value || 0;
          
          setTooltipData({
            x: d.x,
            y: d.y,
            name,
            isRole,
            fte
          });
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('r', d => d.r);
          
          setTooltipData(null);
        })
        .transition()
        .duration(500)
        .delay((d, i) => i * 10)
        .style('opacity', 1);
      
      // Add warning icons for circles with more than 10 FTE
      g.selectAll('.warning-icon')
        .data(root.descendants().filter(d => d.depth === 1 && (d.value || 0) > 10))
        .enter()
        .append('g')
        .attr('class', 'warning-icon')
        .attr('transform', d => `translate(${d.x + d.r * 0.6}, ${d.y - d.r * 0.6})`)
        .append('path')
        .attr('d', 'M23.432 17.925L14.408 3.366c-.933-1.517-3.142-1.517-4.076 0L1.308 17.925c-.933 1.519.235 3.423 2.038 3.423h18.047c1.803 0 2.971-1.904 2.038-3.423zM12.37 16.615a1.219 1.219 0 0 1-1.225 1.224 1.22 1.22 0 0 1-1.225-1.224v-.028c0-.675.55-1.197 1.225-1.197s1.225.522 1.225 1.197v.028zm0-3.824c0 .675-.55 1.224-1.225 1.224a1.22 1.22 0 0 1-1.225-1.224v-4.13c0-.675.55-1.225 1.225-1.225s1.225.55 1.225 1.224v4.131z')
        .attr('transform', 'scale(0.8)')
        .attr('fill', '#FF9800')
        .style('opacity', 0)
        .transition()
        .duration(700)
        .style('opacity', 1);
      
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
      
      // Modified double-click handling to use proper D3 v7 event binding
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

  return (
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
        onCircleClick={handleCircleOrRoleClick}
      />
      
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>Hover over a circle to see its name. Click on a circle to see details.</p>
        <p className="text-xs mt-1 flex items-center justify-center gap-1">
          <AlertTriangle className="h-3 w-3 text-amber-500" /> 
          Circles with warning icons have more than 10 FTE
        </p>
      </div>

      {/* Tooltip with FTE information */}
      {tooltipData && (
        <div 
          className="fixed z-50 pointer-events-none bg-popover text-popover-foreground rounded-md px-3 py-1.5 text-xs font-medium shadow-md transform -translate-x-1/2 -translate-y-full animate-fade-in"
          style={{ 
            left: `${tooltipData.x + containerRef.current?.getBoundingClientRect().left}px`, 
            top: `${tooltipData.y + containerRef.current?.getBoundingClientRect().top - 10}px` 
          }}
        >
          {tooltipData.name} 
          <span className="text-muted-foreground ml-1">
            ({tooltipData.isRole ? 'Role' : 'Circle'}) - {tooltipData.fte.toFixed(1)} FTE
            {!tooltipData.isRole && tooltipData.fte > 10 && (
              <span className="ml-1 text-amber-500">⚠️</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default CirclePackingChart;
