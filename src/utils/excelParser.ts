
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
        
        // Get raw data as array instead of objects with named keys
        const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        // Skip empty rows
        const nonEmptyRows = rawData.filter(row => {
          if (isPeopleData) {
            return row && row.length >= 4; // Need at least 4 columns for people data
          } else {
            return row && row.length >= 3; // Need at least 3 columns for org data
          }
        });
        
        if (nonEmptyRows.length <= 1) {
          resolve([]);
          return;
        }
        
        // Skip header row and transform data to our desired format
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
            fte: parseFloat(row[2]) || 0,
            type: row[3]?.toString().trim() || 'Undefined'
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
  // Create a Map to store unique circles and their roles
  const circleMap = new Map<string, Circle>();
  
  // Create a Map to track which roles appear in which circles
  const roleToCirclesMap = new Map<string, string[]>();
  
  // Process each row from the Excel data
  data.forEach((row) => {
    const circleName = row.circleName;
    const role = row.role;
    const type = row.type || 'Undefined';
    
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
        totalFTE: 0,
        type: type
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
      type: circle.type,
      children: circle.roles.map(role => ({
        name: role.name,
        value: role.fte
      }))
    }))
  };
};
