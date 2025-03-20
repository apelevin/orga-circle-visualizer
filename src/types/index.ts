
export interface Role {
  name: string;
  fte: number;
}

export interface Circle {
  name: string;
  roles: Role[];
  totalFTE: number;
  children?: Circle[];
}

export interface HierarchyNode {
  name: string;
  value?: number;
  children?: HierarchyNode[];
}

export interface ExcelData {
  "Circle Name": string;
  "Role": string;
  "FTE Required": number;
}

export interface CirclePackingNode {
  x: number;
  y: number;
  r: number;
  data: {
    name: string;
    value?: number;
    roles?: Role[];
    children?: any[];
  };
}
