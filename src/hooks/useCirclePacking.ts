
import { useState, useEffect } from 'react';
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

  return { hierarchyData, roleToCirclesMap, error };
};
