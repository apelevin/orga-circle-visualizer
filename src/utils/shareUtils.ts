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
    
    // Check if the JSON string is too large (>100KB)
    if (jsonString.length > 100000) {
      console.warn("Sharing data is very large, this may cause issues with URL sharing", {
        dataSize: jsonString.length
      });
    }
    
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
    // Check if the encoded data is too long for a URL
    if (encodedData.length > 2000) {
      console.warn("Encoded data is very long for a URL parameter", {
        length: encodedData.length
      });
    }
    
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

// API URL for server storage
const API_BASE_URL = "https://api.jsonbin.io/v3/b";
const API_KEY = "$2a$10$MHXrC.FyHhj7CDdUH6pHiOF0MeD0jn89N14GKqZTcnCdL7RFLCzk2"; // Public API key for demo

// Save organization data to server
export const saveSharedDataToServer = async (
  id: string,
  organizationData: HierarchyNode | null,
  peopleData: PeopleData[],
  name: string
): Promise<string> => {
  try {
    // Clone the data to avoid circular reference issues
    const cleanOrgData = JSON.parse(JSON.stringify(organizationData));
    const cleanPeopleData = JSON.parse(JSON.stringify(peopleData));
    
    const sharedData = {
      organizationData: cleanOrgData,
      peopleData: cleanPeopleData,
      timestamp: Date.now(),
      name,
      id
    };
    
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
        "X-Bin-Name": `org-viz-${id}`,
        "X-Bin-Private": "false"
      },
      body: JSON.stringify(sharedData)
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Data saved to server successfully:", result);
    
    // Also save locally as a backup
    try {
      saveSharedData(id, organizationData, peopleData, name);
    } catch (localError) {
      console.warn("Could not save to local storage:", localError);
    }
    
    return id;
  } catch (error) {
    console.error("Error saving shared data to server:", error);
    throw new Error("Failed to save shared data to server");
  }
};

// Get organization data from server by ID
export const getSharedDataFromServer = async (id: string): Promise<{
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  name: string;
  timestamp: number;
} | null> => {
  try {
    // First try to find the bin with the org data
    const searchResponse = await fetch(`${API_BASE_URL}/find?query={"id":"${id}"}`, {
      method: "GET",
      headers: {
        "X-Master-Key": API_KEY
      }
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Server error: ${searchResponse.status}`);
    }
    
    const searchResult = await searchResponse.json();
    
    if (!searchResult.count || searchResult.count === 0) {
      console.log("No data found on server for ID:", id);
      return null;
    }
    
    // Get the first match
    const binId = searchResult.records[0].metadata.id;
    
    // Fetch the bin content
    const response = await fetch(`${API_BASE_URL}/${binId}/latest`, {
      method: "GET",
      headers: {
        "X-Master-Key": API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const result = await response.json();
    const data = result.record;
    
    if (!data || !data.organizationData) {
      return null;
    }
    
    return {
      organizationData: data.organizationData,
      peopleData: data.peopleData || [],
      name: data.name || "Organization",
      timestamp: data.timestamp || Date.now()
    };
  } catch (error) {
    console.error("Error retrieving shared data from server:", error);
    return null;
  }
};

// These functions are kept for backward compatibility
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
