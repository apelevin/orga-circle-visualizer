import * as XLSX from 'xlsx';
import { Circle, ExcelData, HierarchyNode, PeopleData } from '@/types';

export const parseExcelFile = async (file: File, isPeopleData = false): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        const nonEmptyRows = rawData.filter(row => {
          if (isPeopleData) {
            return row && row.length >= 4;
          } else {
            return row && row.length >= 3;
          }
        });
        
        if (nonEmptyRows.length <= 1) {
          resolve([]);
          return;
        }
        
        if (isPeopleData) {
          const jsonData = nonEmptyRows.slice(1).map(row => ({
            circleName: row[0]?.toString().trim() || 'Unknown Circle',
            roleName: row[1]?.toString().trim() || 'Unknown Role',
            personName: row[2]?.toString().trim() || 'Unknown Person',
            fte: parseFloat(row[3]) || 0
          }));
          resolve(jsonData);
        } else {
          const jsonData = nonEmptyRows.slice(1).map(row => ({
            circleName: row[0]?.toString().trim() || 'Unknown Circle',
            role: row[1]?.toString().trim() || 'Unknown Role',
            fte: parseFloat(row[2]) || 0
          }));
          resolve(jsonData);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};

export const processExcelData = (data: any[]): Circle[] => {
  const circleMap = new Map<string, Circle>();
  const roleToCirclesMap = new Map<string, string[]>();
  
  data.forEach((row) => {
    const circleName = row.circleName;
    const role = row.role;
    
    let fte = 0;
    if (row.fte !== undefined && row.fte !== null) {
      fte = parseFloat(row.fte.toString());
      if (isNaN(fte)) fte = 0;
    }
    
    if (!circleMap.has(circleName)) {
      circleMap.set(circleName, {
        name: circleName,
        roles: [],
        totalFTE: 0
      });
    }
    
    const circle = circleMap.get(circleName)!;
    circle.roles.push({ name: role, fte });
    
    if (roleToCirclesMap.has(role)) {
      if (!roleToCirclesMap.get(role)!.includes(circleName)) {
        roleToCirclesMap.get(role)!.push(circleName);
      }
    } else {
      roleToCirclesMap.set(role, [circleName]);
    }
  });
  
  for (const circle of circleMap.values()) {
    circle.totalFTE = circle.roles.reduce((sum, role) => sum + role.fte, 0);
  }
  
  return Array.from(circleMap.values());
};

export const processPeopleData = (data: any[]): PeopleData[] => {
  return data.map(row => ({
    circleName: row.circleName,
    roleName: row.roleName,
    personName: row.personName,
    fte: parseFloat(row.fte) || 0
  }));
};

export const transformToHierarchy = (circles: Circle[]): HierarchyNode => {
  return {
    name: "Organization",
    children: circles.map(circle => ({
      name: circle.name,
      value: circle.totalFTE,
      children: circle.roles.map(role => ({
        name: role.name,
        value: role.fte
      }))
    }))
  };
};

export const generateShareableId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const storeSharedData = (organizationData: HierarchyNode, peopleData: PeopleData[]): string => {
  const shareId = generateShareableId();
  const sharedData = {
    organizationData,
    peopleData,
    createdAt: new Date().toISOString()
  };

  const existingShares = JSON.parse(localStorage.getItem('orgShares') || '{}');
  existingShares[shareId] = sharedData;
  localStorage.setItem('orgShares', JSON.stringify(existingShares));

  return shareId;
};

export const getSharedData = (shareId: string): { organizationData: HierarchyNode, peopleData: PeopleData[] } | null => {
  const existingShares = JSON.parse(localStorage.getItem('orgShares') || '{}');
  return existingShares[shareId] || null;
};
