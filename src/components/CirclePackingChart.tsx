
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HierarchyNode, CirclePackingNode, PeopleData } from '@/types';
import { toast } from "sonner";
import { AlertTriangle } from 'lucide-react';
import InfoPanel from './InfoPanel';
import PersonInfoPanel from './PersonInfoPanel';
import ChartTooltip from './ChartTooltip';
import ChartLegend from './ChartLegend';
import ChartNodes from './ChartNodes';
import WarningIcons from './WarningIcons';
import { useRoleToCirclesMap } from '@/hooks/useRoleToCirclesMap';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { 
  getColorScale, 
  createHierarchy, 
  createPack, 
  getUniqueCircleTypes 
} from '@/utils/chartUtils';

interface CirclePackingChartProps {
  data: HierarchyNode;
  peopleData: PeopleData[];
}

const CirclePackingChart: React.FC<CirclePackingChartProps> = ({ data, peopleData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useChartDimensions(containerRef);
  const [error, setError] = useState<string | null>(null);
  
  const [hierarchyData, setHierarchyData] = useState<d3.HierarchyCircularNode<HierarchyNode> | null>(null);
  
  const roleToCirclesMap = useRoleToCirclesMap(data);
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<{
    name: string;
    value: number;
    type?: string;
    roles?: { name: string; value: number }[];
    parent?: string;
    parentCircles?: string[];
    isRole?: boolean;
  } | null>(null);

  const [isPersonPanelOpen, setIsPersonPanelOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    name: string;
    isRole: boolean;
    fte: number;
    type?: string;
  } | null>(null);

  const handleCircleOrRoleClick = (nodeName: string) => {
    if (!hierarchyData) return;
    
    const foundCircle = hierarchyData
      .descendants()
      .find(node => node.depth === 1 && node.data.name === nodeName);
      
    const foundRole = !foundCircle ? 
      hierarchyData
        .descendants()
        .find(node => node.depth === 2 && node.data.name === nodeName) : 
      null;
      
    if (foundCircle || foundRole) {
      const targetNode = foundCircle || foundRole;
      
      if (targetNode) {
        handleNodeClick(null, targetNode);
      }
    } else {
      toast.error(`Could not find "${nodeName}" in the visualization`);
    }
  };

  const handlePersonClick = (personName: string) => {
    setSelectedPerson(personName);
    setIsPersonPanelOpen(true);
  };

  const handleNodeHover = (d: d3.HierarchyCircularNode<HierarchyNode> | null) => {
    if (!d) {
      setTooltipData(null);
      return;
    }

    const name = d.data.name || 'Unnamed';
    const isRole = d.depth === 2;
    const type = isRole ? 
      (d.parent?.data.type || 'Undefined') : 
      (d.data.type || 'Undefined');
    
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
      type
    });
  };

  const handleNodeClick = (event: React.MouseEvent | null, d: d3.HierarchyCircularNode<HierarchyNode>) => {
    if (event) event.stopPropagation();
    
    const isMainCircle = d.depth === 1;
    const isRoleCircle = d.depth === 2;
    
    if (isMainCircle) {
      const circleName = d.data.name || 'Unnamed Circle';
      const totalFTE = d.value || 0;
      const circleType = d.data.type || 'Undefined';
      
      const roles = d.children?.map(role => ({
        name: role.data.name || 'Unnamed Role',
        value: role.value || 0
      })) || [];
      
      const calculatedTotal = roles.reduce((sum, role) => sum + role.value, 0);
      
      console.log(`Circle: ${circleName}, D3 Value: ${totalFTE}, Calculated Sum: ${calculatedTotal}, Type: ${circleType}`);
      
      setSelectedCircle({
        name: circleName,
        value: calculatedTotal,
        type: circleType,
        roles: roles,
        isRole: false
      });
      
      setIsPanelOpen(true);
    } else if (isRoleCircle) {
      const roleName = d.data.name || 'Unnamed Role';
      const fte = d.value || 0;
      const circleName = d.parent?.data.name || 'Unnamed Circle';
      const circleType = d.parent?.data.type || 'Undefined';
      
      const parentCircles = roleToCirclesMap.get(roleName) || [circleName];
      
      setSelectedCircle({
        name: roleName,
        value: fte,
        type: circleType,
        parent: circleName,
        parentCircles: parentCircles,
        isRole: true
      });
      
      setIsPanelOpen(true);
    }
  };

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
      
      const hierarchy = createHierarchy(data);
      
      console.log("Hierarchy values:", {
        root: hierarchy.value,
        children: hierarchy.children?.map(c => ({ 
          name: c.data.name, 
          value: c.value,
          type: c.data.type || 'Undefined',
          childrenSum: c.children?.reduce((sum, child) => sum + (child.value || 0), 0)
        }))
      });
      
      const pack = createPack(dimensions.width, dimensions.height);
      const root = pack(hierarchy);
      
      setHierarchyData(root);
      
      console.log("D3 hierarchy created:", {
        root: root,
        children: root.children?.length,
        depth: root.depth,
        height: root.height
      });

      const uniqueTypes: string[] = getUniqueCircleTypes(root);
      console.log("Unique circle types:", uniqueTypes);
      
      const colorScale = getColorScale(uniqueTypes);
      
      const g = svg.append('g');
      
      // This section sets up the circles and event handlers
      g.append('g')
        .selectAll('circle')
        .data(root.descendants().slice(1))
        .enter()
        .append('circle')
        .attr('class', 'circle-node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.r)
        .style('fill', d => {
          if (d.depth === 1) {
            return colorScale(d.data.type || 'Undefined');
          } else if (d.depth === 2) {
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
        .style('opacity', 0)
        .on('click', function(event, d) {
          handleNodeClick(event, d);
        })
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('r', d.r * 1.05);
          
          handleNodeHover(d);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('r', d => d.r);
          
          handleNodeHover(null);
        })
        .transition()
        .duration(500)
        .delay((d, i) => i * 10)
        .style('opacity', 1);
      
      // Add warning icons
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
        .style('opacity', 0)
        .transition()
        .duration(700)
        .style('opacity', 1);
      
      // Add legend
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(20, 20)`);
      
      legend.selectAll('.legend-item')
        .data(uniqueTypes)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`)
        .call(g => {
          g.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('rx', 3)
            .attr('fill', d => colorScale(d));
          
          g.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .text(d => d)
            .style('font-size', '12px')
            .style('font-weight', '500')
            .style('fill', '#666');
        });
      
      // Add zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.4, 10])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
          legend.attr('transform', `translate(${20 + event.transform.x}, ${20 + event.transform.y})`);
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
        style={{ maxHeight: '85vh' }}
      />
      
      <InfoPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        selectedCircle={selectedCircle}
        peopleData={peopleData || []}
        onCircleClick={handleCircleOrRoleClick}
        onPersonClick={handlePersonClick}
      />
      
      <PersonInfoPanel
        isOpen={isPersonPanelOpen}
        onClose={() => setIsPersonPanelOpen(false)}
        selectedPerson={selectedPerson}
        peopleData={peopleData || []}
        onCircleClick={handleCircleOrRoleClick}
        onRoleClick={handleCircleOrRoleClick}
      />
      
      <div className="text-center mt-4 text-sm text-muted-foreground">
        <p>Hover over a circle to see its name. Click on a circle to see details.</p>
        <p className="text-xs mt-1 flex items-center justify-center gap-1">
          <AlertTriangle className="h-3 w-3 text-amber-500" /> 
          Circles with warning icons have more than 10 FTE
        </p>
      </div>

      <ChartTooltip tooltipData={tooltipData} containerRef={containerRef} />
    </div>
  );
};

export default CirclePackingChart;
