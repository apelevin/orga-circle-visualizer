
import { Circle, HierarchyNode, PeopleData } from "@/types";
import { transformToHierarchy } from "./excelParser";

// Store to save shared data
interface SharedData {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  timestamp: number;
  name: string;
}

const STORAGE_KEY = "org-visualizer-shared-data";

// Generate a unique ID for the shared link
export const generateShareId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}`;
};

// Save organization data to localStorage with the given ID
export const saveSharedData = (
  id: string,
  organizationData: HierarchyNode | null,
  peopleData: PeopleData[],
  name: string
): void => {
  const storage = localStorage.getItem(STORAGE_KEY);
  const existingData: Record<string, SharedData> = storage ? JSON.parse(storage) : {};
  
  existingData[id] = {
    organizationData,
    peopleData,
    timestamp: Date.now(),
    name
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
};

// Get organization data by ID
export const getSharedData = (id: string): SharedData | null => {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (!storage) return null;
  
  const data: Record<string, SharedData> = JSON.parse(storage);
  return data[id] || null;
};

// Get all saved shares
export const getAllSharedData = (): Record<string, SharedData> => {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (!storage) return {};
  
  return JSON.parse(storage);
};

// Delete a shared data entry
export const deleteSharedData = (id: string): void => {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (!storage) return;
  
  const data: Record<string, SharedData> = JSON.parse(storage);
  if (data[id]) {
    delete data[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};
