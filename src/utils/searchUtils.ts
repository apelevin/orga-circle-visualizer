
import { HierarchyNode, PeopleData } from '@/types';

export interface SearchResult {
  type: 'circle' | 'role' | 'person';
  name: string;
  id: string; // Unique identifier for deduplication
}

export const performSearch = (
  searchTerm: string,
  organizationData: HierarchyNode | null,
  peopleData: PeopleData[]
): SearchResult[] => {
  // Only search if we have a search term with at least 4 characters
  if (!searchTerm.trim() || searchTerm.trim().length < 4) {
    return [];
  }

  const results: SearchResult[] = [];
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  // Sets to track unique entries
  const uniqueCircles = new Set<string>();
  const uniqueRoles = new Set<string>();
  const uniquePeople = new Set<string>();

  // Search circles
  if (organizationData?.children) {
    organizationData.children.forEach(circle => {
      if (circle.name.toLowerCase().includes(normalizedSearchTerm) && !uniqueCircles.has(circle.name)) {
        uniqueCircles.add(circle.name);
        results.push({ 
          type: 'circle', 
          name: circle.name, 
          id: `circle-${circle.name}` 
        });
      }

      // Search roles within circles
      if (circle.children) {
        circle.children.forEach(role => {
          if (role.name.toLowerCase().includes(normalizedSearchTerm) && !uniqueRoles.has(role.name)) {
            uniqueRoles.add(role.name);
            results.push({ 
              type: 'role', 
              name: role.name, 
              id: `role-${role.name}` 
            });
          }
        });
      }
    });
  }

  // Search people
  if (peopleData?.length) {
    peopleData.forEach(person => {
      if (
        person.personName.toLowerCase().includes(normalizedSearchTerm) &&
        !uniquePeople.has(person.personName)
      ) {
        uniquePeople.add(person.personName);
        results.push({ 
          type: 'person', 
          name: person.personName, 
          id: `person-${person.personName}` 
        });
      }
    });
  }

  return results;
};
