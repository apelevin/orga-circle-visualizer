
import * as React from 'react';
import { Link } from 'react-router-dom';
import FileUpload from '@/components/FileUpload';
import CirclePackingChart from '@/components/CirclePackingChart';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import SearchInput from '@/components/SearchInput';
import InfoPanel from '@/components/InfoPanel';
import PersonInfoPanel from '@/components/PersonInfoPanel';
import { HierarchyNode, PeopleData } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings } from 'lucide-react';

const Index = () => {
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
            
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Admin Zone</span>
              </Link>
            </Button>
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
            <div className="flex flex-col items-center">
              <div className="h-[80vh] w-full transition-all duration-500 ease-in-out animate-scale-in">
                <CirclePackingChart data={organizationData} peopleData={peopleData} />
              </div>
              
              {(organizationData || peopleData.length > 0) && (
                <div className="mt-4 flex flex-col items-center">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-8 py-6 rounded-full"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-base">Reset Data</span>
                  </Button>
                  <p className="mt-3 text-muted-foreground text-sm">
                    Reload the page to upload new data
                  </p>
                </div>
              )}
            </div>
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
      
      <footer className="py-4 border-t border-border/40 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Organization Circle Visualizer — Upload an Excel file to visualize your organization structure
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
