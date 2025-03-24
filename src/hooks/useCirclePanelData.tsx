
import { useState, useEffect } from 'react';
import { HierarchyNode, PeopleData } from '@/types';
import { toast } from "sonner";

export const useCirclePanelData = (data: HierarchyNode) => {
  const [roleToCirclesMap, setRoleToCirclesMap] = useState<Map<string, string[]>>(new Map());
  
  // When data changes, update the role-to-circles mapping
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

  const handleCircleOrRoleClick = (nodeName: string, hierarchyData: d3.HierarchyCircularNode<HierarchyNode> | null, handleNodeClick: (event: React.MouseEvent | null, d: d3.HierarchyCircularNode<HierarchyNode>) => void) => {
    if (!hierarchyData) return;
    
    const foundCircle = hierarchyData
      .descendants()
      .find(node => node.depth === 1 && node.data.name === nodeName);
      
    const foundRole = !foundCircle ? 
      hierarchyData
        .descendants()
        .find(node => node.depth === 2 && node.data.name === nodeName) : 
      null;
      
    if (foundCircle || foundRole) {
      const targetNode = foundCircle || foundRole;
      
      if (targetNode) {
        handleNodeClick(null, targetNode);
      }
    } else {
      toast.error(`Could not find "${nodeName}" in the visualization`);
    }
  };

  return { roleToCirclesMap, handleCircleOrRoleClick };
};
