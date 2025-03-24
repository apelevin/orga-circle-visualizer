
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
  const [colorScale, setColorScale] = React.useState<d3.ScaleOrdinal<string, string> | null>(null);
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
      }
      
      console.log("SVG group created:", g.node() ? "success" : "failed");
      
      // Wait a tick to ensure the group is in the DOM
      setTimeout(() => {
        if (g.node()) {
          setIsGroupCreated(true);
          console.log("Group creation confirmed after timeout");
        } else {
          console.error("Failed to create SVG group even after timeout");
        }
      }, 0);
      
      // Get unique types for color mapping
      const types = new Set<string>();
      
      hierarchyData.children?.forEach((d) => {
        const type = d.data.type || 'Undefined';
        types.add(type);
      });
      
      // Create array from the set of unique types
      const uniqueTypes = Array.from(types);
      
      // Create a color scale
      const newColorScale = getColorScale(uniqueTypes);
      setColorScale(newColorScale);
    } catch (err) {
      console.error("Error rendering visualization:", err);
    }
    
    // Clean up function
    return () => {
      if (groupRef.current) {
        groupRef.current.remove();
        groupRef.current = null;
        setIsGroupCreated(false);
        setGroupElement(null);
      }
    };
  }, [hierarchyData, dimensions, svgRef]);

  if (!hierarchyData || !colorScale) {
    console.log("Waiting for hierarchyData or colorScale");
    return null;
  }

  return (
    <>
      {isGroupCreated && groupElement && (
        <>
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
          <CirclePackingZoom 
            svgRef={svgRef} 
            hierarchyData={hierarchyData} 
            dimensions={dimensions} 
            groupElement={groupElement}
          />
        </>
      )}
    </>
  );
};

export default CirclePackingRenderer;
