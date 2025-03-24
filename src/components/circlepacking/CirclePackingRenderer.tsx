
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';
import { getColorScale } from '@/utils/circlePackingColors';
import CircleNodes from './CircleNodes';
import CircleLabels from './CircleLabels';
import WarningIcons from './WarningIcons';
import CirclePackingZoom from './CirclePackingZoom';

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
  const [colorScale, setColorScale] = useState<d3.ScaleOrdinal<string, string> | null>(null);
  const [isGroupCreated, setIsGroupCreated] = useState(false);
  const [groupElement, setGroupElement] = useState<SVGGElement | null>(null);
  const groupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

  // Initial SVG setup
  useEffect(() => {
    if (!svgRef.current || !hierarchyData) {
      console.error("Missing SVG ref or hierarchy data");
      return;
    }

    renderCount.current += 1;
    console.log(`Rendering CirclePacking (render #${renderCount.current})`);
    
    try {
      // Clear existing SVG content
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      setIsGroupCreated(false);
      
      // Create a container group for all visualization elements
      const g = svg.append('g');
      groupRef.current = g;
      
      // Store the actual DOM element
      const gElement = g.node();
      if (gElement) {
        setGroupElement(gElement);
      } else {
        console.error("Failed to create SVG group element");
        return;
      }
      
      // Extract unique types from the hierarchy data
      const types = new Set<string>();
      hierarchyData.children?.forEach((d) => {
        const type = d.data.type || 'Undefined';
        types.add(type);
      });
      
      const uniqueTypes = Array.from(types);
      console.log("Unique types extracted:", uniqueTypes);
      
      // Create color scale
      const newColorScale = getColorScale(uniqueTypes);
      
      // Verify the color scale works by testing it
      try {
        const testType = uniqueTypes[0] || 'Default';
        const testColor = newColorScale(testType);
        console.log(`Test color for "${testType}": ${testColor}`);
        
        // If we got here, the color scale is valid
        setColorScale(newColorScale);
        setIsGroupCreated(true);
      } catch (err) {
        console.error("Color scale test failed:", err);
        // Create a fallback color scale
        const fallbackScale = d3.scaleOrdinal<string>()
          .domain(['Default'])
          .range(['#E5DEFF']);
        setColorScale(fallbackScale);
        setIsGroupCreated(true);
      }
    } catch (err) {
      console.error("Error setting up visualization:", err);
    }
    
    // Clean up function
    return () => {
      if (groupRef.current) {
        groupRef.current.remove();
        groupRef.current = null;
        setIsGroupCreated(false);
        setGroupElement(null);
        setColorScale(null);
      }
    };
  }, [hierarchyData, dimensions, svgRef]);

  if (!hierarchyData) {
    console.log("Waiting for hierarchyData");
    return null;
  }

  if (!colorScale) {
    console.log("Waiting for colorScale");
    return null;
  }

  if (!isGroupCreated || !groupElement) {
    console.log("Waiting for group element");
    return null;
  }

  console.log("All dependencies ready, rendering child components");

  return (
    <>
      <CirclePackingZoom 
        svgRef={svgRef} 
        hierarchyData={hierarchyData} 
        dimensions={dimensions} 
        groupElement={groupElement}
      />
      <CircleNodes 
        root={hierarchyData} 
        colorScale={colorScale} 
        setTooltipData={setTooltipData}
        handleNodeClick={handleNodeClick}
        groupElement={groupElement}
      />
      <CircleLabels 
        root={hierarchyData} 
        groupElement={groupElement}
      />
      <WarningIcons 
        root={hierarchyData} 
        groupElement={groupElement}
      />
    </>
  );
};

export default CirclePackingRenderer;
