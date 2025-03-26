
import { StructureProblem } from '@/utils/structureAnalysis';

export interface StructureProblemStats {
  'person-low-fte': number;
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
}
