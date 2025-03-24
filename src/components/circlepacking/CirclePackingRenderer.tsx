
import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!svgRef.current || !hierarchyData) {
      console.error("Missing SVG ref or hierarchy data");
      return;
    }

    renderCount.current += 1;
    console.log(`Rendering CirclePacking (render #${renderCount.current})`);
    
    try {
      const svg = d3.select(svgRef.current);
      
      // Clear svg content first
      svg.selectAll('*').remove();
      
      const root = hierarchyData;
      
      // Create a container group for all visualization elements
      svg.append('g');
      
      // Get unique types for color mapping
      const types = new Set<string>();
      
      root.children?.forEach((d) => {
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
  }, [hierarchyData, dimensions, svgRef]);

  if (!hierarchyData || !colorScale) {
    console.log("Waiting for hierarchyData or colorScale");
    return null;
  }

  return (
    <>
      <CircleNodes 
        root={hierarchyData} 
        colorScale={colorScale} 
        setTooltipData={setTooltipData}
        handleNodeClick={handleNodeClick}
      />
      <CircleLabels root={hierarchyData} />
      <WarningIcons root={hierarchyData} />
      <CirclePackingZoom 
        svgRef={svgRef} 
        hierarchyData={hierarchyData} 
        dimensions={dimensions} 
      />
    </>
  );
};

export default CirclePackingRenderer;
