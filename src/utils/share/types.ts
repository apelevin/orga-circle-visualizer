
import { HierarchyNode, PeopleData } from "@/types";

// Shared data types
export interface SharedData {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  timestamp: number;
  name: string;
}
