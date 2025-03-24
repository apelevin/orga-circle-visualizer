import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { HierarchyNode, PeopleData } from "@/types";
import { getSharedData, decodeSharedData, getSharedDataFromServer } from "@/utils/share";

export interface UseSharedDataReturn {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  orgName: string;
  isLoading: boolean;
  error: string | null;
}

export const useSharedData = (): UseSharedDataReturn => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [organizationData, setOrganizationData] = useState<HierarchyNode | null>(null);
  const [peopleData, setPeopleData] = useState<PeopleData[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedData = async () => {
      try {
        setIsLoading(true);
        console.log("Loading shared data...");
        
        // If we have an ID, prioritize using that method (more reliable)
        if (id) {
          console.log("Found ID in URL path, attempting to load data by ID:", id);
          
          // First try to get data from server
          const serverData = await getSharedDataFromServer(id);
          
          if (serverData && serverData.organizationData) {
            console.log("Successfully loaded data from server by ID:", {
              hasOrgData: !!serverData.organizationData,
              peopleCount: serverData.peopleData?.length || 0,
              name: serverData.name,
              timestamp: new Date(serverData.timestamp).toLocaleString()
            });
            
            setOrganizationData(serverData.organizationData);
            setPeopleData(serverData.peopleData || []);
            setOrgName(serverData.name || "Organization");
            setIsLoading(false);
            return;
          }
          
          // If server fails, try local storage as fallback
          const sharedData = getSharedData(id);
          
          if (sharedData && sharedData.organizationData) {
            console.log("Successfully loaded data from local storage by ID:", {
              hasOrgData: !!sharedData.organizationData,
              peopleCount: sharedData.peopleData?.length || 0,
              name: sharedData.name,
              timestamp: new Date(sharedData.timestamp).toLocaleString()
            });
            
            setOrganizationData(sharedData.organizationData);
            setPeopleData(sharedData.peopleData || []);
            setOrgName(sharedData.name || "Organization");
            setIsLoading(false);
            return;
          } else {
            // Check if localStorage is available but the data isn't found
            try {
              if (typeof localStorage !== 'undefined') {
                console.error("Data not found for ID:", id);
                setError(`This shared link with ID "${id}" has expired or doesn't exist. The shared data could not be found.`);
              } else {
                console.error("localStorage is not available in this browser context");
                setError(`Unable to access browser storage. This might be due to privacy settings or using incognito/private browsing mode.`);
              }
            } catch (storageError) {
              console.error("Error accessing localStorage:", storageError);
              setError(`Cannot access browser storage. This might be due to privacy settings or using incognito/private browsing mode.`);
            }
          }
        }
        
        // Check URL parameters for encoded data
        const urlParams = new URLSearchParams(location.search);
        const encodedData = urlParams.get('data');
        
        // Log what we're working with
        console.log("URL params check:", {
          hasEncodedData: !!encodedData,
          encodedDataLength: encodedData?.length || 0,
          idFromParams: id,
          currentPath: location.pathname
        });
        
        if (encodedData) {
          try {
            console.log("Found encoded data in URL, attempting to decode");
            
            // Check if encoded data is too large and redirect to error if needed
            if (encodedData.length > 4000) {
              console.error("Encoded data exceeds safe URL parameter limits:", encodedData.length);
              setError("The shared data is too large for URL parameters. Please use the ID-based share link instead.");
              setIsLoading(false);
              return;
            }
            
            // Try to decode the data from URL
            const { organizationData: decodedOrgData, peopleData: decodedPeopleData, name } = decodeSharedData(encodedData);
            
            if (!decodedOrgData) {
              console.error("Decoded data is invalid - missing organization data");
              throw new Error("Invalid organization data in URL");
            }
            
            console.log("Successfully decoded data from URL", {
              hasOrgData: !!decodedOrgData,
              peopleCount: decodedPeopleData?.length || 0,
              name
            });
            
            setOrganizationData(decodedOrgData);
            setPeopleData(decodedPeopleData || []);
            setOrgName(name || "Organization");
            setIsLoading(false);
            return;
          } catch (decodeError) {
            console.error("Error decoding shared data from URL:", decodeError);
            setError("Could not decode the shared data from the URL. The link might be corrupted or invalid.");
            setIsLoading(false);
            return;
          }
        }
        
        // If we reach here, we couldn't load data from either method
        if (id) {
          setError(`This shared link with ID "${id}" has expired or doesn't exist. The shared data could not be found.`);
        } else {
          setError("Invalid share link - missing required data. Please ask for a new share link.");
        }
        
        setIsLoading(false);
        
      } catch (error) {
        console.error("Unexpected error loading shared data:", error);
        setError("An unexpected error occurred while loading the shared data. Please try again.");
        setIsLoading(false);
      }
    };

    loadSharedData();
  }, [id, location.search, navigate]);

  return {
    organizationData,
    peopleData,
    orgName,
    isLoading,
    error
  };
};
