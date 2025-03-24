
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

export const getColorScale = (types: string[]) => {
  const colorPalette = [
    '#E5DEFF', // Soft Purple
    '#D3E4FD', // Soft Blue
    '#FDE1D3', // Soft Peach
    '#FFDEE2', // Soft Pink
    '#F2FCE2', // Soft Green
    '#FEF7CD', // Soft Yellow
    '#FEC6A1', // Soft Orange
    '#F1F0FB', // Soft Gray
    '#8B5CF6', // Vivid Purple
    '#D946EF', // Magenta Pink
    '#F97316', // Bright Orange
    '#0EA5E9'  // Ocean Blue
  ];

  return d3.scaleOrdinal<string>()
    .domain(types)
    .range(colorPalette);
};

export const createHierarchy = (data: HierarchyNode) => {
  return d3.hierarchy(data)
    .sum(d => d.value || 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));
};

export const createPack = (width: number, height: number) => {
  return d3.pack<HierarchyNode>()
    .size([width, height])
    .padding(3);
};

export const getUniqueCircleTypes = (root: d3.HierarchyCircularNode<HierarchyNode>): string[] => {
  return Array.from(new Set(
    root.children?.map(node => (node.data.type || 'Undefined') as string) || ['Undefined']
  ));
};
