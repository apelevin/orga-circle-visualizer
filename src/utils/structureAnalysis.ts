
import { HierarchyNode, PeopleData } from '@/types';

export interface StructureProblem {
  type: 'person-low-fte' | 'circle-low-fte' | 'circle-high-fte' | 'circle-single-role';
  name: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export const analyzeStructure = (
  organizationData: HierarchyNode | null,
  peopleData: PeopleData[]
): StructureProblem[] => {
  if (!organizationData || !organizationData.children) {
    return [];
  }

  const problems: StructureProblem[] = [];

  // Check for people with FTE < 1
  const peopleWithLowFte = new Map<string, number>();
  peopleData.forEach(person => {
    const currentFte = peopleWithLowFte.get(person.personName) || 0;
    peopleWithLowFte.set(person.personName, currentFte + person.fte);
  });

  peopleWithLowFte.forEach((totalFte, personName) => {
    if (totalFte < 1) {
      problems.push({
        type: 'person-low-fte',
        name: personName,
        details: `Total FTE: ${totalFte.toFixed(2)}`,
        severity: 'medium',
      });
    }
  });

  // Calculate assigned FTE per circle
  const circleAssignedFte = new Map<string, number>();
  peopleData.forEach(person => {
    const currentFte = circleAssignedFte.get(person.circleName) || 0;
    circleAssignedFte.set(person.circleName, currentFte + person.fte);
  });

  // Check remaining issues at the circle level
  organizationData.children.forEach(circle => {
    const circleName = circle.name;
    const totalFte = circle.value || 0;
    const assignedFte = circleAssignedFte.get(circleName) || 0;
    const roleCount = circle.children?.length || 0;

    // Check for circles with Assigned FTE < Total FTE
    if (assignedFte < totalFte && totalFte > 0) {
      problems.push({
        type: 'circle-low-fte',
        name: circleName,
        details: `Required: ${totalFte.toFixed(2)}, Assigned: ${assignedFte.toFixed(2)}`,
        severity: 'high',
      });
    }

    // Check for circles with Total FTE > 12
    if (totalFte > 12) {
      problems.push({
        type: 'circle-high-fte',
        name: circleName,
        details: `Total FTE: ${totalFte.toFixed(2)}`,
        severity: 'high',
      });
    }

    // Check for circles with only one role
    if (roleCount === 1) {
      problems.push({
        type: 'circle-single-role',
        name: circleName,
        details: `Contains only 1 role`,
        severity: 'low',
      });
    }
  });

  return problems;
};
