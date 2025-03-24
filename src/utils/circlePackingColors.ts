
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

// Define a more vibrant and distinct color palette for different circle types
export const circleColors: string[] = [
  '#8B5CF6', // Vivid Purple
  '#3B82F6', // Bright Blue
  '#F97316', // Bright Orange
  '#EF4444', // Bright Red
  '#10B981', // Emerald Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#D946EF', // Fuchsia
  '#84CC16', // Lime
  '#0EA5E9'  // Sky Blue
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
  
  // Log the mapping for debugging
  console.log("Color mapping:");
  uniqueTypes.forEach((type, i) => {
    console.log(`${type} -> ${colorsToUse[i]}`);
  });
  
  // Create and return the scale
  return d3.scaleOrdinal<string>()
    .domain(uniqueTypes)
    .range(colorsToUse);
};

// Get color for a node based on its depth and type
export const getNodeColor = (
  d: d3.HierarchyCircularNode<HierarchyNode>, 
  colorScale: d3.ScaleOrdinal<string, string>
): string => {
  // For safety, check if colorScale is a function
  if (typeof colorScale !== 'function') {
    console.error("Invalid color scale provided to getNodeColor");
    return d.depth === 0 ? '#FFFFFF' : 
           d.depth === 1 ? '#8B5CF6' : 
           d.depth === 2 ? '#3B82F6' : '#FFFFFF';
  }
  
  try {
    if (d.depth === 0) {
      return '#FFFFFF'; // Root node is white
    } else if (d.depth === 1) {
      // Use the color based on the circle's type
      const type = d.data.type || 'Undefined';
      const color = colorScale(type);
      console.log(`Node ${d.data.name} (type: ${type}) -> color: ${color}`);
      return color;
    } else if (d.depth === 2) {
      // For roles, slightly darker version of parent color
      const parentType = d.parent?.data.type || 'Undefined';
      const baseColor = colorScale(parentType);
      const parentColor = d3.color(baseColor) || d3.color('#8B5CF6')!;
      return parentColor.darker(0.2).toString();
    }
    return '#FFFFFF'; // Default fallback
  } catch (error) {
    console.error("Error in getNodeColor:", error);
    // Fallback colors
    return d.depth === 0 ? '#FFFFFF' : 
           d.depth === 1 ? '#8B5CF6' : 
           d.depth === 2 ? '#3B82F6' : '#FFFFFF';
  }
};
