
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

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
export const getColorScale = (uniqueTypes: string[]): d3.ScaleOrdinal<string, string> => {
  console.log("Creating color scale with types:", uniqueTypes);
  
  // Ensure we have at least one type, otherwise d3.scaleOrdinal can behave unexpectedly
  if (!uniqueTypes || !uniqueTypes.length) {
    uniqueTypes = ['Default'];
  }
  
  // Make sure we're not giving more colors than we have in our palette
  const colorsToUse = circleColors.slice(0, Math.min(uniqueTypes.length, circleColors.length));
  
  // If we have more types than colors, cycle through colors
  if (uniqueTypes.length > circleColors.length) {
    for (let i = circleColors.length; i < uniqueTypes.length; i++) {
      colorsToUse.push(circleColors[i % circleColors.length]);
    }
  }
  
  // Create and return the scale
  const scale = d3.scaleOrdinal<string>()
    .domain(uniqueTypes)
    .range(colorsToUse);
  
  // Test the scale to ensure it's working
  const testResult = scale(uniqueTypes[0]);
  console.log(`Test color scale: ${uniqueTypes[0]} -> ${testResult}`);
  
  return scale;
};

// Get color for a node based on its depth and type
export const getNodeColor = (
  d: d3.HierarchyCircularNode<HierarchyNode>, 
  colorScale: d3.ScaleOrdinal<string, string>
): string => {
  // If colorScale is not a function, use fallback colors
  if (typeof colorScale !== 'function') {
    console.warn("Invalid color scale provided to getNodeColor");
    return d.depth === 0 ? '#FFFFFF' : 
           d.depth === 1 ? '#E5DEFF' : 
           d.depth === 2 ? '#D3E4FD' : '#FFFFFF';
  }
  
  try {
    if (d.depth === 0) {
      return '#FFFFFF'; // Root node
    } else if (d.depth === 1) {
      // Use the color based on the circle's type
      const type = d.data.type || 'Undefined';
      const color = colorScale(type);
      console.log(`Node ${d.data.name} (type: ${type}) gets color: ${color}`);
      return color;
    } else if (d.depth === 2) {
      // For roles, darken the parent circle's color
      const parentType = d.parent?.data.type || 'Undefined';
      const baseColor = colorScale(parentType);
      const parentColor = d3.color(baseColor) || d3.color('#E5DEFF')!;
      return parentColor.darker(0.2).toString();
    }
    return '#FFFFFF';
  } catch (error) {
    console.error("Error in getNodeColor:", error);
    return d.depth === 0 ? '#FFFFFF' : 
           d.depth === 1 ? '#E5DEFF' : 
           d.depth === 2 ? '#D3E4FD' : '#FFFFFF';
  }
};
