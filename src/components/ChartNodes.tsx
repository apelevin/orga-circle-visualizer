
import React from 'react';
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

interface ChartNodesProps {
  root: d3.HierarchyCircularNode<HierarchyNode>;
  colorScale: d3.ScaleOrdinal<string, string>;
  onNodeClick: (event: React.MouseEvent, d: d3.HierarchyCircularNode<HierarchyNode>) => void;
  onNodeHover: (d: d3.HierarchyCircularNode<HierarchyNode> | null) => void;
}

const ChartNodes: React.FC<ChartNodesProps> = ({ 
  root, 
  colorScale, 
  onNodeClick,
  onNodeHover
}) => {
  const handleMouseOver = (event: React.MouseEvent, d: d3.HierarchyCircularNode<HierarchyNode>) => {
    const target = event.currentTarget as SVGCircleElement;
    d3.select(target)
      .transition()
      .duration(300)
      .attr('r', d.r * 1.05);

    onNodeHover(d);
  };

  const handleMouseOut = (event: React.MouseEvent) => {
    const target = event.currentTarget as SVGCircleElement;
    const datum = d3.select(target).datum() as d3.HierarchyCircularNode<HierarchyNode>;
    
    d3.select(target)
      .transition()
      .duration(300)
      .attr('r', datum.r);
    
    onNodeHover(null);
  };

  return (
    <>
      {root.descendants().slice(1).map((node, index) => (
        <circle
          key={`node-${index}`}
          className="circle-node"
          cx={node.x}
          cy={node.y}
          r={node.r}
          style={{
            fill: node.depth === 1 
              ? colorScale(node.data.type || 'Undefined')
              : node.depth === 2
                ? d3.color(colorScale(node.parent?.data.type || 'Undefined'))?.darker(0.2).toString() || '#E5DEFF'
                : '#FFFFFF',
            stroke: node.depth === 1 ? 'rgba(0,0,0,0.05)' : 'none',
            strokeWidth: 1,
            cursor: 'pointer'
          }}
          onClick={(event) => onNodeClick(event, node)}
          onMouseOver={(event) => handleMouseOver(event, node)}
          onMouseOut={handleMouseOut}
        />
      ))}
    </>
  );
};

export default ChartNodes;
