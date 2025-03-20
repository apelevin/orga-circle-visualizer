
import * as XLSX from 'xlsx';
import { Circle, ExcelData, HierarchyNode } from '@/types';

export const parseExcelFile = async (file: File): Promise<ExcelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelData>(worksheet);
        
        resolve(jsonData);
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

export const processExcelData = (data: ExcelData[]): Circle[] => {
  const circleMap = new Map<string, Circle>();
  
  // First pass: create circles and add roles
  data.forEach((row) => {
    const circleName = row["Circle Name"];
    const role = row["Role"];
    
    // Ensure FTE is a valid number
    let fte = 0;
    if (row["FTE Required"] !== undefined && row["FTE Required"] !== null) {
      // Convert to number and ensure it's valid
      fte = parseFloat(row["FTE Required"].toString());
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
    circle.totalFTE += fte;
  });
  
  return Array.from(circleMap.values());
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
