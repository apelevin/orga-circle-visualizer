
import * as d3 from 'd3';
import { HierarchyNode } from '@/types';

// Define a more distinct color palette for different circle types
export const circleColors: string[] = [
  '#B0C4DE', // Light blue for KAM/New Logos
  '#E6BCB0', // Peachy red for Content/Events/Creative
  '#DED0F2', // Light purple for VIP/Offices/HR
  '#FFD580', // Light orange for KYC
  '#D8E4BC', // Light green for DnD/Discovery Law
  '#C4D8E2', // Another blue shade
  '#F2D0D0', // Light pink
  '#D0F2E9', // Mint
  '#E2D0F2', // Lavender
  '#F2EAD0'  // Light yellow
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
           d.depth === 1 ? '#B0C4DE' : 
           d.depth === 2 ? '#A4B9D0' : '#FFFFFF';
  }
  
  try {
    if (d.depth === 0) {
      return '#FFFFFF'; // Root node is white
    } else if (d.depth === 1) {
      // Use the color based on the circle's type
      const type = d.data.type || 'Undefined';
      console.log(`Getting color for ${d.data.name} (type: ${type})`);
      
      // Manual color assignments to match the reference image
      if (type.includes('KAM') || type.includes('Logos') || type.includes('Experts')) {
        return '#B0C4DE'; // Light blue
      } else if (type.includes('Content') || type.includes('Events') || type.includes('Creative')) {
        return '#E6BCB0'; // Peachy red
      } else if (type.includes('Discovery')) {
        return '#D8E4BC'; // Light green
      } else if (type.includes('VIP') || type.includes('Offices') || type.includes('HR')) {
        return '#DED0F2'; // Light purple
      } else if (type.includes('KYC') || type.includes('Accounting')) {
        return '#FFD580'; // Light orange
      }
      
      const color = colorScale(type);
      console.log(`Node ${d.data.name} (type: ${type}) -> color: ${color}`);
      return color;
    } else if (d.depth === 2) {
      // For roles, slightly darker version of parent color
      const parentType = d.parent?.data.type || 'Undefined';
      const baseColor = colorScale(parentType);
      console.log(`Role ${d.data.name} (parent type: ${parentType}) -> base color: ${baseColor}`);
      
      if (!baseColor) {
        console.error(`No base color found for parent type: ${parentType}`);
        return '#A4B9D0'; // Fallback color
      }
      
      const parentColor = d3.color(baseColor) || d3.color('#B0C4DE')!;
      return parentColor.darker(0.2).toString();
    }
    return '#FFFFFF'; // Default fallback
  } catch (error) {
    console.error("Error in getNodeColor:", error, "for node:", d.data.name);
    // Fallback colors
    return d.depth === 0 ? '#FFFFFF' : 
           d.depth === 1 ? '#B0C4DE' : 
           d.depth === 2 ? '#A4B9D0' : '#FFFFFF';
  }
};
