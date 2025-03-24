import React, { useEffect, useRef, useState } from 'react';
import { HierarchyNode, PeopleData } from '@/types';
import InfoPanel from './info-panel/InfoPanel';
import PersonInfoPanel from './PersonInfoPanel';
import { useD3CirclePacking } from '@/hooks/useD3CirclePacking';
import { useCirclePanelData } from '@/hooks/useCirclePanelData';
import ChartTooltip from './chart/ChartTooltip';
import ChartError from './chart/ChartError';
import ChartLegend from './chart/ChartLegend';
import * as d3 from 'd3';
import { SelectedCircle } from './info-panel/types';

interface CirclePackingChartProps {
  data: HierarchyNode;
  peopleData: PeopleData[];
}

const CirclePackingChart: React.FC<CirclePackingChartProps> = ({ data, peopleData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<SelectedCircle | null>(null);

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(width, 400),
          height: Math.max(height * 0.95, 600)
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { roleToCirclesMap, handleCircleOrRoleClick } = useCirclePanelData(data);

  const handleNodeClick = (event: React.MouseEvent | null, d: d3.HierarchyCircularNode<HierarchyNode>) => {
    if (event) event.stopPropagation();
    
    const isMainCircle = d.depth === 1;
    const isRoleCircle = d.depth === 2;
    
    if (isMainCircle) {
      const circleName = d.data.name || 'Unnamed Circle';
      const totalFTE = d.value || 0;
      const type = d.data.type || 'Default';
      
      const roles = d.children?.map(role => ({
        name: role.data.name || 'Unnamed Role',
        value: role.value || 0
      })) || [];
      
      const calculatedTotal = roles.reduce((sum, role) => sum + role.value, 0);
      
      console.log(`Circle: ${circleName}, D3 Value: ${totalFTE}, Calculated Sum: ${calculatedTotal}`);
      
      setSelectedCircle({
        name: circleName,
        value: calculatedTotal,
        roles: roles,
        type: type,
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

  const { hierarchyData, error } = useD3CirclePacking({
    svgRef,
    containerRef,
    data,
    dimensions,
    onNodeClick: handleNodeClick,
    setTooltipData
  });

  const handleCircleClick = (circleName: string) => {
    handleCircleOrRoleClick(circleName, hierarchyData, handleNodeClick);
  };

  const handlePersonClick = (personName: string) => {
    setSelectedPerson(personName);
    setIsPersonPanelOpen(true);
  };

  if (error) {
    return <ChartError error={error} />;
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
        onCircleClick={handleCircleClick}
        onPersonClick={handlePersonClick}
      />
      
      <PersonInfoPanel
        isOpen={isPersonPanelOpen}
        onClose={() => setIsPersonPanelOpen(false)}
        selectedPerson={selectedPerson}
        peopleData={peopleData || []}
        onCircleClick={handleCircleClick}
        onRoleClick={handleCircleClick}
      />
      
      <ChartLegend />

      <ChartTooltip tooltipData={tooltipData} containerRef={containerRef} />
    </div>
  );
};

export default CirclePackingChart;
