
import React, { useState } from "react";
import { useSharedData } from "@/hooks/useSharedData";
import { useParams } from "react-router-dom";
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
  // Use our custom hook for data loading
  const { organizationData, peopleData, orgName, isLoading, error } = useSharedData();

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
  
  // If still loading data, show the loading component
  if (isLoading) {
    return <SharedLoading />;
  }

  // If there was an error or no data, show the error component
  if (error || !organizationData) {
    return <SharedError errorMessage={error} shareId={id} />;
  }

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
