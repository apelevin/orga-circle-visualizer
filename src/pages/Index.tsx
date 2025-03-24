
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import FileUpload from '@/components/FileUpload';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import SearchInput from '@/components/SearchInput';
import InfoPanel from '@/components/InfoPanel';
import PersonInfoPanel from '@/components/PersonInfoPanel';
import ShareButton from '@/components/ShareButton';
import OrganizationVisualization from '@/components/OrganizationVisualization';
import FooterSection from '@/components/FooterSection';
import { HierarchyNode, PeopleData } from '@/types';

const Index = () => {
  const navigate = useNavigate();
  const [organizationData, setOrganizationData] = React.useState<HierarchyNode | null>(null);
  const [peopleData, setPeopleData] = React.useState<PeopleData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [selectedCircle, setSelectedCircle] = React.useState<{
    name: string;
    value: number;
    roles?: { name: string; value: number }[];
    parent?: string;
    parentCircles?: string[];
    isRole?: boolean;
  } | null>(null);
  const [selectedPerson, setSelectedPerson] = React.useState<string | null>(null);
  const [isPersonPanelOpen, setIsPersonPanelOpen] = React.useState(false);

  const handleFileProcessed = (data: HierarchyNode) => {
    setIsLoading(true);
    
    // Simulate a slight delay to show loading state
    setTimeout(() => {
      setOrganizationData(data);
      setIsLoading(false);
    }, 800);
  };

  const handlePeopleFileProcessed = (data: PeopleData[]) => {
    setPeopleData(data);
  };

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

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-4">
        <div className="w-full mx-auto">
          <div className="mb-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <FileUpload 
              onFileProcessed={handleFileProcessed} 
              onPeopleFileProcessed={handlePeopleFileProcessed}
              isLoading={isLoading}
              hasOrganizationData={!!organizationData}
              hasPeopleData={peopleData.length > 0}
            />
            
            <div className="flex gap-2">
              {organizationData && (
                <ShareButton 
                  organizationData={organizationData}
                  peopleData={peopleData}
                />
              )}
            </div>
          </div>
          
          {(organizationData || peopleData.length > 0) && (
            <div className="mb-4">
              <SearchInput 
                organizationData={organizationData}
                peopleData={peopleData}
                onCircleClick={handleCircleOrRoleClick}
                onRoleClick={handleCircleOrRoleClick}
                onPersonClick={handlePersonClick}
              />
            </div>
          )}
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="mt-4 text-muted-foreground">Processing your organization data...</p>
            </div>
          ) : organizationData ? (
            <OrganizationVisualization 
              organizationData={organizationData}
              peopleData={peopleData}
              isLoading={isLoading}
              onCircleClick={handleCircleOrRoleClick}
              onPersonClick={handlePersonClick}
              onReset={handleReset}
            />
          ) : (
            <div className="max-w-3xl mx-auto mt-4 animate-slide-up">
              <EmptyState />
            </div>
          )}
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

export default Index;
