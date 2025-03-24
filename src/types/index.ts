
export interface Role {
  name: string;
  fte: number;
  people?: Person[];
}

export interface Person {
  name: string;
  fte: number;
}

export interface Circle {
  name: string;
  roles: Role[];
  totalFTE: number;
  children?: Circle[];
  type?: string; // Add type property for circle categorization
}

export interface HierarchyNode {
  name: string;
  value?: number;
  type?: string; // Add type property for circle categorization
  children?: HierarchyNode[];
}

export interface ExcelData {
  "Circle Name": string;
  "Role": string;
  "FTE Required": number;
  "Circle Type"?: string; // Add optional circle type
}

export interface CirclePackingNode {
  x: number;
  y: number;
  r: number;
  data: {
    name: string;
    value?: number;
    type?: string; // Add type property for circle categorization
    roles?: Role[];
    children?: any[];
  };
}

export interface PeopleData {
  circleName: string;
  roleName: string;
  personName: string;
  fte: number;
}
