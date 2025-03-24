
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { HierarchyNode, PeopleData } from "@/types";
import { getSharedData, decodeSharedData } from "@/utils/shareUtils";
import SearchInput from "@/components/SearchInput";
import InfoPanel from "@/components/InfoPanel";
import PersonInfoPanel from "@/components/PersonInfoPanel";
import SharedHeader from "@/components/SharedHeader";
import SharedLoading from "@/components/SharedLoading";
import SharedError from "@/components/SharedError";
import VisualizationTabs from "@/components/VisualizationTabs";
import FooterSection from "@/components/FooterSection";

const SharedView = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [organizationData, setOrganizationData] = useState<HierarchyNode | null>(null);
  const [peopleData, setPeopleData] = useState<PeopleData[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<{
    name: string;
    value: number;
    roles?: { name: string; value: number }[];
    parent?: string;
    parentCircles?: string[];
    isRole?: boolean;
  } | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [isPersonPanelOpen, setIsPersonPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("visualization");
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

  const handleCircleOrRoleClick = (nodeName: string) => {
    if (!organizationData) return;
    
    // First check if it's a circle
    const foundCircle = organizationData.children?.find(c => c.name === nodeName);
    
    if (foundCircle) {
      const roles = foundCircle.children?.map(role => ({
        name: role.name || 'Unnamed Role',
        value: role.value || 0
      })) || [];
      
      setSelectedCircle({
        name: nodeName,
        value: foundCircle.value || 0,
        roles,
        isRole: false
      });
      
      setIsPanelOpen(true);
      return;
    }
    
    // If not a circle, check if it's a role
    let foundRole = false;
    const parentCircles: string[] = [];
    
    organizationData.children?.forEach(circle => {
      circle.children?.forEach(role => {
        if (role.name === nodeName) {
          foundRole = true;
          parentCircles.push(circle.name);
        }
      });
    });
    
    if (foundRole && parentCircles.length > 0) {
      setSelectedCircle({
        name: nodeName,
        value: 0, // This will be calculated in the InfoPanel
        parent: parentCircles[0],
        parentCircles,
        isRole: true
      });
      
      setIsPanelOpen(true);
    }
  };

  const handlePersonClick = (personName: string) => {
    setSelectedPerson(personName);
    setIsPersonPanelOpen(true);
  };

  if (isLoading) {
    return <SharedLoading />;
  }

  if (error || !organizationData) {
    return <SharedError errorMessage={error} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SharedHeader orgName={orgName} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-4">
          <SearchInput 
            organizationData={organizationData}
            peopleData={peopleData}
            onCircleClick={handleCircleOrRoleClick}
            onRoleClick={handleCircleOrRoleClick}
            onPersonClick={handlePersonClick}
          />
        </div>
        
        <div className="flex flex-col items-center">
          <VisualizationTabs 
            organizationData={organizationData}
            peopleData={peopleData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onCircleClick={handleCircleOrRoleClick}
            onPersonClick={handlePersonClick}
          />
        </div>
      </main>
      
      <InfoPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        selectedCircle={selectedCircle}
        peopleData={peopleData}
        onCircleClick={handleCircleOrRoleClick}
        onPersonClick={handlePersonClick}
      />
      
      <PersonInfoPanel
        isOpen={isPersonPanelOpen}
        onClose={() => setIsPersonPanelOpen(false)}
        selectedPerson={selectedPerson}
        peopleData={peopleData}
        onCircleClick={handleCircleOrRoleClick}
        onRoleClick={handleCircleOrRoleClick}
      />
      
      <FooterSection />
    </div>
  );
};

export default SharedView;
