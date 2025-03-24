
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { HierarchyNode, PeopleData } from "@/types";
import { getSharedData, decodeSharedData } from "@/utils/shareUtils";

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
        
        // Check URL parameters for encoded data first
        const urlParams = new URLSearchParams(location.search);
        const encodedData = urlParams.get('data');
        
        // Log what we're working with
        console.log("URL params check:", { 
          hasEncodedData: !!encodedData, 
          idFromParams: id,
          currentPath: location.pathname
        });
        
        if (encodedData) {
          try {
            console.log("Found encoded data in URL, attempting to decode");
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
            // We'll fall back to localStorage if URL decoding fails
          }
        }
        
        // If URL parameter not found or invalid, try localStorage (for backward compatibility)
        if (!id) {
          console.error("No ID parameter found in URL path");
          setError("Invalid share link - no ID parameter found");
          setIsLoading(false);
          return;
        }

        console.log("Fetching shared data with ID:", id);
        const sharedData = getSharedData(id);
        
        if (!sharedData) {
          console.error("No shared data found for ID:", id);
          setError("This shared link has expired or doesn't exist");
          setIsLoading(false);
          return;
        }

        if (!sharedData.organizationData) {
          console.error("Shared data exists but organization data is invalid");
          setError("The shared organization data is invalid");
          setIsLoading(false);
          return;
        }

        console.log("Shared data found:", { 
          hasOrgData: !!sharedData.organizationData,
          peopleCount: sharedData.peopleData?.length || 0,
          name: sharedData.name
        });
        
        setOrganizationData(sharedData.organizationData);
        setPeopleData(sharedData.peopleData || []);
        setOrgName(sharedData.name || "Organization");
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading shared data:", error);
        setError("An error occurred while loading the shared data");
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
