
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

// Utility function to create a hierarchical data structure for D3
export const createHierarchy = (data: HierarchyNode) => {
  return d3.hierarchy(data)
    .sum(d => d.value || 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));
};

// Utility function to create the packing layout
export const createPackLayout = (width: number, height: number) => {
  return d3.pack<HierarchyNode>()
    .size([width, height])
    .padding(3);
};

// Create a color scale based on types
export const createColorScale = (types: string[]) => {
  return d3.scaleOrdinal<string>()
    .domain(types)
    .range([
      '#E5DEFF',
      '#D3E4FD',
      '#FDE1D3',
      '#FFDEE2',
      '#F2FCE2',
      '#FEF7CD'
    ]);
};

// Calculate initial transform for centering
export const calculateInitialTransform = (
  width: number, 
  height: number,
  rootX: number,
  rootY: number
) => {
  return d3.zoomIdentity.translate(
    width / 2 - rootX,
    height / 2 - rootY
  ).scale(0.9);
};

// Get node color based on depth and type
export const getNodeColor = (
  d: d3.HierarchyCircularNode<HierarchyNode>, 
  colorScale: d3.ScaleOrdinal<string, string>
) => {
  if (d.depth === 1) {
    return colorScale(d.data.type || 'The others');
  } else if (d.depth === 2) {
    const parentColor = d3.color(colorScale(d.parent?.data.type || 'The others')) || d3.color('#E5DEFF')!;
    return parentColor.darker(0.2).toString();
  }
  return '#FFFFFF';
};
