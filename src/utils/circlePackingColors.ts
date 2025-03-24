
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

// Define a more distinct color palette for different circle types
export const circleColors: string[] = [
  '#E5DEFF', // Light purple - for most circles
  '#D3E4FD', // Light blue
  '#FDE1D3', // Light orange/peach
  '#FFDEE2', // Light pink
  '#F2FCE2', // Light green
  '#FFEFD6', // Light yellow
  '#DCF2EF', // Light teal
  '#F8E1FF', // Light magenta
  '#E2F0CB', // Light lime
  '#FFE8D6'  // Light peach
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
           d.depth === 1 ? '#E5DEFF' : 
           d.depth === 2 ? '#D4CBEF' : '#FFFFFF';
  }
  
  try {
    if (d.depth === 0) {
      return '#FFFFFF'; // Root node is white
    } else if (d.depth === 1) {
      // Use the color based on the circle's type
      const type = d.data.type || 'Undefined';
      console.log(`Getting color for ${d.data.name} (type: ${type})`);
      
      // We're now just using a single color for all circles
      // regardless of their type to match the provided image
      return '#E5DEFF'; // Light purple for all circles
    } else if (d.depth === 2) {
      // For roles, slightly darker version of parent color
      // Since parent is always light purple, this is always the same color
      return '#D4CBEF'; // Slightly darker purple for all roles
    }
    return '#FFFFFF'; // Default fallback
  } catch (error) {
    console.error("Error in getNodeColor:", error, "for node:", d.data.name);
    // Fallback colors
    return d.depth === 0 ? '#FFFFFF' : 
           d.depth === 1 ? '#E5DEFF' : 
           d.depth === 2 ? '#D4CBEF' : '#FFFFFF';
  }
};
