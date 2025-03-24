
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';
import CircleNodes from './CircleNodes';
import CircleLabels from './CircleLabels';
import CirclePackingZoom from './CirclePackingZoom';
import WarningIcons from './WarningIcons';
import { getColorScale } from '@/utils/circlePackingColors';

interface CirclePackingRendererProps {
  svgRef: React.RefObject<SVGSVGElement>;
  hierarchyData: d3.HierarchyCircularNode<HierarchyNode>;
  dimensions: { width: number; height: number };
  setTooltipData: (data: {
    x: number;
    y: number;
    name: string;
    isRole: boolean;
    fte: number;
    type?: string;
  } | null) => void;
  handleNodeClick: (event: React.MouseEvent, d: d3.HierarchyCircularNode<HierarchyNode>) => void;
}

const CirclePackingRenderer: React.FC<CirclePackingRendererProps> = ({
  svgRef,
  hierarchyData,
  dimensions,
  setTooltipData,
  handleNodeClick,
}) => {
  const [colorScale, setColorScale] = useState<d3.ScaleOrdinal<string, string>>(
    d3.scaleOrdinal<string>().range(['#E5DEFF'])
  );
  const groupRef = useRef<SVGGElement | null>(null);

  // Effect to initialize the SVG container
  useEffect(() => {
    if (!svgRef.current || !hierarchyData) return;
    
    console.log("CirclePackingRenderer: initializing SVG container");
    
    try {
      const svg = d3.select(svgRef.current);
      
      // Clear any existing content
      svg.selectAll('*').remove();
      
      // Create a group element to hold all circle packing elements
      const g = svg.append('g');
      groupRef.current = g.node() as SVGGElement;
      
      console.log("SVG container initialized with group element");
    } catch (error) {
      console.error("Error initializing SVG container:", error);
    }
  }, [svgRef, hierarchyData]);

  // Effect to update the color scale based on unique circle types
  useEffect(() => {
    if (!hierarchyData) return;
    
    console.log("CirclePackingRenderer: updating color scale");
    
    try {
      // Extract unique types from circles (depth 1 nodes)
      const uniqueTypes = Array.from(
        new Set(
          hierarchyData
            .descendants()
            .filter(d => d.depth === 1)
            .map(d => d.data.type || 'Undefined')
        )
      );
      
      // Make sure uniqueTypes is an array of strings
      const uniqueTypeStrings: string[] = uniqueTypes.map(type => String(type));
      
      console.log("Unique circle types:", uniqueTypeStrings);
      
      // Create a new color scale with properly typed argument
      const newColorScale = getColorScale(uniqueTypeStrings);
      
      // Verify the color scale works by testing it
      try {
        if (uniqueTypeStrings.length > 0) {
          const testType = uniqueTypeStrings[0];
          const testColor = newColorScale(testType);
          console.log(`Test color for "${testType}": ${testColor}`);
          
          // Test each type
          uniqueTypeStrings.forEach(type => {
            const color = newColorScale(type);
            console.log(`Type "${type}" maps to color: ${color}`);
          });
        }
        
        // If we got here, the color scale is valid
        setColorScale(newColorScale);
      } catch (error) {
        console.error("Error testing color scale:", error);
      }
    } catch (error) {
      console.error("Error updating color scale:", error);
    }
  }, [hierarchyData]);

  // Rendering components based on their order for proper layering
  if (!groupRef.current) return null;

  return (
    <>
      {/* Order matters for proper layering */}
      <CircleNodes
        root={hierarchyData}
        colorScale={colorScale}
        setTooltipData={setTooltipData}
        handleNodeClick={handleNodeClick}
        groupElement={groupRef.current}
      />
      <CircleLabels
        root={hierarchyData}
        groupElement={groupRef.current}
      />
      <WarningIcons
        root={hierarchyData}
        groupElement={groupRef.current}
      />
      <CirclePackingZoom
        svgRef={svgRef}
        hierarchyData={hierarchyData}
        dimensions={dimensions}
        groupElement={groupRef.current}
      />
    </>
  );
};

export default CirclePackingRenderer;
