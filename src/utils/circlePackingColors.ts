
import * as d3 from 'd3';

// Define color palette for different circle types
export const circleColors: string[] = [
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

// Create a color scale based on circle types
export const getColorScale = (uniqueTypes: string[]) => {
  return d3.scaleOrdinal<string>()
    .domain(uniqueTypes)
    .range(circleColors.slice(0, uniqueTypes.length));
};

// Get color for a node based on its depth and type
export const getNodeColor = (
  d: d3.HierarchyCircularNode<any>, 
  colorScale: d3.ScaleOrdinal<string, string>
) => {
  if (d.depth === 1) {
    // Use the color based on the circle's type
    return colorScale(d.data.type || 'Undefined');
  } else if (d.depth === 2) {
    // For roles, darken the parent circle's color
    const parentColor = d3.color(colorScale(d.parent?.data.type || 'Undefined')) || d3.color('#E5DEFF')!;
    return parentColor.darker(0.2).toString();
  }
  return '#FFFFFF';
};
