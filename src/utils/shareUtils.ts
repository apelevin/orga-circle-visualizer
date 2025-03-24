
import { Circle, HierarchyNode, PeopleData } from "@/types";
import { transformToHierarchy } from "./excelParser";

// Generate a unique ID for the shared link
export const generateShareId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}`;
};

// Compress and encode data for URL sharing
export const encodeDataForSharing = (
  organizationData: HierarchyNode | null,
  peopleData: PeopleData[],
  name: string
): string => {
  try {
    if (!organizationData) {
      throw new Error("No organization data to share");
    }
    
    // Create a sharing object with minimized data
    const sharingObject = {
      org: organizationData,
      people: peopleData,
      name: name || "Organization"
    };
    
    // Stringify and compress
    const jsonString = JSON.stringify(sharingObject);
    
    // Base64 encode
    const encodedData = btoa(encodeURIComponent(jsonString));
    return encodedData;
  } catch (error) {
    console.error("Error encoding data for sharing:", error);
    throw new Error("Failed to encode data for sharing");
  }
};

// Decode data from URL
export const decodeSharedData = (
  encodedData: string
): { organizationData: HierarchyNode | null; peopleData: PeopleData[]; name: string } => {
  try {
    // Decode from base64
    const jsonString = decodeURIComponent(atob(encodedData));
    
    // Parse JSON
    const data = JSON.parse(jsonString);
    
    return {
      organizationData: data.org || null,
      peopleData: data.people || [],
      name: data.name || "Organization"
    };
  } catch (error) {
    console.error("Error decoding shared data:", error);
    throw new Error("Failed to decode shared data");
  }
};

// These functions are kept for backward compatibility but are no longer the primary sharing mechanism
// Store to save shared data
interface SharedData {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  timestamp: number;
  name: string;
}

const STORAGE_KEY = "org-visualizer-shared-data";

// Save organization data to localStorage with the given ID
export const saveSharedData = (
  id: string,
  organizationData: HierarchyNode | null,
  peopleData: PeopleData[],
  name: string
): void => {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    const existingData: Record<string, SharedData> = storage ? JSON.parse(storage) : {};
    
    // Clone the data to avoid circular reference issues
    const cleanOrgData = JSON.parse(JSON.stringify(organizationData));
    const cleanPeopleData = JSON.parse(JSON.stringify(peopleData));
    
    existingData[id] = {
      organizationData: cleanOrgData,
      peopleData: cleanPeopleData,
      timestamp: Date.now(),
      name
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    console.log("Data saved successfully with ID:", id);
  } catch (error) {
    console.error("Error saving shared data:", error);
    throw new Error("Failed to save shared data");
  }
};

// Get organization data by ID
export const getSharedData = (id: string): SharedData | null => {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    if (!storage) return null;
    
    const data: Record<string, SharedData> = JSON.parse(storage);
    return data[id] || null;
  } catch (error) {
    console.error("Error retrieving shared data:", error);
    return null;
  }
};

// Get all saved shares
export const getAllSharedData = (): Record<string, SharedData> => {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    if (!storage) return {};
    
    return JSON.parse(storage);
  } catch (error) {
    console.error("Error retrieving all shared data:", error);
    return {};
  }
};

// Delete a shared data entry
export const deleteSharedData = (id: string): void => {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    if (!storage) return;
    
    const data: Record<string, SharedData> = JSON.parse(storage);
    if (data[id]) {
      delete data[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error deleting shared data:", error);
  }
};
