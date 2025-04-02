
import { StructureProblem } from '@/utils/structureAnalysis';
import { HierarchyNode, PeopleData } from '@/types';

export interface StructureProblemStats {
  'person-low-fte': number;
  'person-high-fte': number;
  'circle-low-fte': number;
  'circle-high-fte': number;
  'circle-single-role': number;
  'circle-zero-fte': number;
  'role-unassigned': number;
  total: number;
}

export interface StructureProblemsProps {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  onCircleClick?: (circleName: string) => void;
  onPersonClick?: (personName: string) => void;
  onUpdatePerson?: (personName: string, roleName: string, circleName: string, newFte: number) => void;
}
