
import * as XLSX from 'xlsx';
import { Circle, ExcelData, HierarchyNode } from '@/types';

export const parseExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Get raw data as array instead of objects with named keys
        const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        // Skip empty rows
        const nonEmptyRows = rawData.filter(row => row && row.length >= 3);
        
        if (nonEmptyRows.length <= 1) {
          resolve([]);
          return;
        }
        
        // Skip header row and transform data to our desired format
        const jsonData = nonEmptyRows.slice(1).map(row => ({
          circleName: row[0]?.toString().trim() || 'Unknown Circle',
          role: row[1]?.toString().trim() || 'Unknown Role',
          fte: parseFloat(row[2]) || 0
        }));
        
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

export const processExcelData = (data: any[]): Circle[] => {
  // Create a Map to store unique circles and their roles
  const circleMap = new Map<string, Circle>();
  
  // Create a Map to track which roles appear in which circles
  const roleToCirclesMap = new Map<string, string[]>();
  
  // Process each row from the Excel data
  data.forEach((row) => {
    const circleName = row.circleName;
    const role = row.role;
    
    // Ensure FTE is a valid number
    let fte = 0;
    if (row.fte !== undefined && row.fte !== null) {
      // Convert to number and ensure it's valid
      fte = parseFloat(row.fte.toString());
      if (isNaN(fte)) fte = 0;
    }
    
    // Create the circle if it doesn't exist yet
    if (!circleMap.has(circleName)) {
      circleMap.set(circleName, {
        name: circleName,
        roles: [],
        totalFTE: 0
      });
    }
    
    // Add the role to the circle
    const circle = circleMap.get(circleName)!;
    circle.roles.push({ name: role, fte });
    
    // Track which circles a role appears in
    if (roleToCirclesMap.has(role)) {
      if (!roleToCirclesMap.get(role)!.includes(circleName)) {
        roleToCirclesMap.get(role)!.push(circleName);
      }
    } else {
      roleToCirclesMap.set(role, [circleName]);
    }
  });
  
  // Calculate the correct totalFTE for each circle
  for (const circle of circleMap.values()) {
    // Sum up the FTE values from all roles in this circle
    circle.totalFTE = circle.roles.reduce((sum, role) => sum + role.fte, 0);
  }
  
  return Array.from(circleMap.values());
};

export const transformToHierarchy = (circles: Circle[]): HierarchyNode => {
  return {
    name: "Organization",
    children: circles.map(circle => ({
      name: circle.name,
      value: circle.totalFTE, // This is the correct totalFTE from all roles
      children: circle.roles.map(role => ({
        name: role.name,
        value: role.fte
      }))
    }))
  };
};
