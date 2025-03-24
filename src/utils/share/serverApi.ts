
import { HierarchyNode, PeopleData } from "@/types";
import { saveSharedData } from "./localStorage";

// API URL for server storage
const API_BASE_URL = "https://api.jsonbin.io/v3/b";
// Updated API key - using the free tier public key that doesn't require authentication
const API_KEY = "$2b$10$F.Ob4ZkWWyo9SrM8eJ/E/.5jUuyWdm3qxhC5f7VvfcWDI0YGPz/RO";

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
    
    console.log("Saving data to server with ID:", id);
    
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
      console.error("Server responded with status:", response.status);
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
    console.log("Attempting to fetch data from server for ID:", id);
    
    // First try to find the bin with the org data
    const searchResponse = await fetch(`${API_BASE_URL}/find?query={"id":"${id}"}`, {
      method: "GET",
      headers: {
        "X-Master-Key": API_KEY
      }
    });
    
    if (!searchResponse.ok) {
      console.error("Server search responded with status:", searchResponse.status);
      throw new Error(`Server error: ${searchResponse.status}`);
    }
    
    const searchResult = await searchResponse.json();
    console.log("Server search result:", searchResult);
    
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
      console.error("Server data fetch responded with status:", response.status);
      throw new Error(`Server error: ${response.status}`);
    }
    
    const result = await response.json();
    const data = result.record;
    
    if (!data || !data.organizationData) {
      console.log("Retrieved data is invalid or missing organizationData");
      return null;
    }
    
    console.log("Data successfully retrieved from server");
    
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
