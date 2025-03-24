
import { useState, useEffect } from 'react';
import { HierarchyNode } from '@/types';

export const useRoleToCirclesMap = (data: HierarchyNode | null) => {
  const [roleToCirclesMap, setRoleToCirclesMap] = useState<Map<string, string[]>>(new Map());
  
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

  return roleToCirclesMap;
};
