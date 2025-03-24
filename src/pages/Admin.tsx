
import * as React from 'react';
import AdminZone from '@/components/AdminZone';
import Header from '@/components/Header';
import CirclePackingChart from '@/components/CirclePackingChart';
import InfoPanel from '@/components/InfoPanel';
import PersonInfoPanel from '@/components/PersonInfoPanel';
import { HierarchyNode, PeopleData } from '@/types';

const Admin = () => {
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <AdminZone 
            onFileProcessed={handleFileProcessed}
            onPeopleFileProcessed={handlePeopleFileProcessed}
            organizationData={organizationData}
            peopleData={peopleData}
            isLoading={isLoading}
          />
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="mt-4 text-muted-foreground">Processing your organization data...</p>
            </div>
          ) : organizationData ? (
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Organization Preview</h2>
              <div className="h-[50vh] w-full transition-all duration-500 ease-in-out animate-scale-in">
                <CirclePackingChart data={organizationData} peopleData={peopleData} />
              </div>
            </div>
          ) : null}
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
      
      <footer className="py-4 border-t border-border/40 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Organization Circle Visualizer — Admin Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
