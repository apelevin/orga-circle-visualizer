
import { useState, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { HierarchyNode, CirclePackingNode, PeopleData } from '@/types';

interface UseCirclePackingProps {
  data: HierarchyNode;
  dimensions: { width: number; height: number };
}

interface UseCirclePackingReturn {
  hierarchyData: d3.HierarchyCircularNode<HierarchyNode> | null;
  roleToCirclesMap: Map<string, string[]>;
  error: string | null;
  zoomToNode: (nodeName: string) => void;
  resetZoom: () => void;
}

export const useCirclePacking = ({ data, dimensions }: UseCirclePackingProps): UseCirclePackingReturn => {
  const [hierarchyData, setHierarchyData] = useState<d3.HierarchyCircularNode<HierarchyNode> | null>(null);
  const [roleToCirclesMap, setRoleToCirclesMap] = useState<Map<string, string[]>>(new Map());
  const [error, setError] = useState<string | null>(null);
  
  // Build role to circles mapping
  useEffect(() => {
    if (!data || !data.children) return;
    
    const newRoleToCirclesMap = new Map<string, string[]>();
    
    data.children.forEach(circle => {
      if (!circle.children) return;
      
      circle.children.forEach(role => {
        const roleName = role.name;
        const circleName = circle.name;
        
        if (newRoleToCirclesMap.has(roleName)) {
          newRoleToCirclesMap.get(roleName)!.push(circleName);
        } else {
          newRoleToCirclesMap.set(roleName, [circleName]);
        }
      });
    });
    
    setRoleToCirclesMap(newRoleToCirclesMap);
  }, [data]);

  // Process hierarchy data
  useEffect(() => {
    if (!data) {
      console.error("Missing required data");
      return;
    }

    if (!data.children || data.children.length === 0) {
      setError("No valid organization data found");
      return;
    }

    setError(null);
    
    try {
      const hierarchy = d3.hierarchy(data)
        .sum(d => d.value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));
      
      console.log("Hierarchy values:", {
        root: hierarchy.value,
        children: hierarchy.children?.map(c => ({ 
          name: c.data.name, 
          value: c.value,
          type: c.data.type,
          childrenSum: c.children?.reduce((sum, child) => sum + (child.value || 0), 0)
        }))
      });
      
      const pack = d3.pack<HierarchyNode>()
        .size([dimensions.width, dimensions.height])
        .padding(3);
      
      const root = pack(hierarchy);
      
      setHierarchyData(root);
      
      console.log("D3 hierarchy created:", {
        root: root,
        children: root.children?.length,
        depth: root.depth,
        height: root.height
      });
    } catch (err) {
      console.error("Error processing hierarchy data:", err);
      setError("Failed to process the organization data");
    }
  }, [data, dimensions]);

  // Function to zoom to a specific node
  const zoomToNode = useCallback((nodeName: string) => {
    if (!hierarchyData) return;
    
    // Find the node by name
    const targetNode = hierarchyData
      .descendants()
      .find(node => node.data.name === nodeName);
    
    if (!targetNode) {
      console.warn(`Node with name ${nodeName} not found`);
      return;
    }
    
    // We'll use this information in the CirclePackingRenderer
    // to implement the actual zoom effect
    const svgElement = document.querySelector('svg');
    if (svgElement) {
      const zoomBehavior = d3.select(svgElement).property("__zoom");
      if (zoomBehavior) {
        const k = Math.min(
          dimensions.width / (targetNode.r * 2.2),
          dimensions.height / (targetNode.r * 2.2)
        );
        
        const transform = d3.zoomIdentity
          .translate(
            dimensions.width / 2 - targetNode.x * k,
            dimensions.height / 2 - targetNode.y * k
          )
          .scale(k);
        
        d3.select(svgElement)
          .transition()
          .duration(750)
          .call(zoomBehavior.transform, transform);
      }
    }
  }, [hierarchyData, dimensions]);

  // Function to reset zoom to default view
  const resetZoom = useCallback(() => {
    const svgElement = document.querySelector('svg');
    if (svgElement && hierarchyData) {
      const zoomBehavior = d3.select(svgElement).property("__zoom");
      if (zoomBehavior) {
        const initialTransform = d3.zoomIdentity.translate(
          dimensions.width / 2 - hierarchyData.x,
          dimensions.height / 2 - hierarchyData.y
        ).scale(0.9);
        
        d3.select(svgElement)
          .transition()
          .duration(750)
          .call(zoomBehavior.transform, initialTransform);
      }
    }
  }, [hierarchyData, dimensions]);

  return { hierarchyData, roleToCirclesMap, error, zoomToNode, resetZoom };
};
