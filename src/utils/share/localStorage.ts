
import { HierarchyNode, PeopleData } from "@/types";
import { SharedData } from "./types";

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

// Get organization data by ID from localStorage
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

// Get all saved shares from localStorage
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

// Delete a shared data entry from localStorage
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
