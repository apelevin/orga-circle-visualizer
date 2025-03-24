
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
  type: string;
  children?: Circle[];
}

export interface HierarchyNode {
  name: string;
  value?: number;
  type?: string;
  children?: HierarchyNode[];
}

export interface ExcelData {
  "Circle Name": string;
  "Role": string;
  "FTE Required": number;
  "Type"?: string;
}

export interface CirclePackingNode {
  x: number;
  y: number;
  r: number;
  data: {
    name: string;
    value?: number;
    type?: string;
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
