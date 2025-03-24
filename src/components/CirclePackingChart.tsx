
import React, { useRef, useState } from 'react';
import { HierarchyNode, PeopleData } from '@/types';
import { toast } from "sonner";
import CirclePackingRenderer from './circlepacking/CirclePackingRenderer';
import CircleTooltip from './circlepacking/CircleTooltip';
import CirclePackingFooter from './circlepacking/CirclePackingFooter';
import CirclePackingNavigation from './circlepacking/CirclePackingNavigation';
import CirclePackingContainer from './circlepacking/CirclePackingContainer';
import CirclePackingError from './circlepacking/CirclePackingError';
import InfoPanel from './InfoPanel';
import PersonInfoPanel from './PersonInfoPanel';
import { useCirclePacking } from '@/hooks/useCirclePacking';
import { useContainerDimensions } from '@/hooks/useContainerDimensions';
import { useZoomControls } from '@/hooks/useZoomControls';
import * as d3 from 'd3';

interface CirclePackingChartProps {
  data: HierarchyNode;
  peopleData: PeopleData[];
}

const CirclePackingChart: React.FC<CirclePackingChartProps> = ({ data, peopleData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useContainerDimensions(containerRef);
  
  const { hierarchyData, roleToCirclesMap, error, zoomToNode, resetZoom } = useCirclePacking({
    data,
    dimensions
  });
  
  const zoomControls = useZoomControls({ resetZoomFunction: resetZoom });
  
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
        zoomToNode(nodeName);
      }
    } else {
      toast.error(`Could not find "${nodeName}" in the visualization`);
    }
  };

  const handlePersonClick = (personName: string) => {
    setSelectedPerson(personName);
    setIsPersonPanelOpen(true);
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
      
      const parentCircles = roleToCirclesMap.get(roleName) || [circleName];
      
      setSelectedCircle({
        name: roleName,
        value: fte,
        parent: circleName,
        parentCircles: parentCircles,
        isRole: true
      });
      
      setIsPanelOpen(true);
    }
  };

  if (error) {
    return <CirclePackingError error={error} />;
  }

  return (
    <div className="w-full h-full flex-1 relative animate-fade-in" ref={containerRef}>
      <CirclePackingNavigation 
        zoomIn={zoomControls.zoomIn}
        zoomOut={zoomControls.zoomOut}
        resetZoom={zoomControls.resetZoom}
      />
      
      <CirclePackingContainer 
        svgRef={svgRef} 
        dimensions={dimensions}
      />
      
      <CirclePackingRenderer
        svgRef={svgRef}
        hierarchyData={hierarchyData}
        dimensions={dimensions}
        setTooltipData={setTooltipData}
        handleNodeClick={handleNodeClick}
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
      
      <CirclePackingFooter />

      <CircleTooltip 
        tooltipData={tooltipData} 
        containerRef={containerRef} 
      />
    </div>
  );
};

export default CirclePackingChart;
