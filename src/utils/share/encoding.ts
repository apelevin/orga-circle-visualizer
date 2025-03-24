
import { HierarchyNode, PeopleData } from "@/types";

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
