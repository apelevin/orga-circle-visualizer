
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HierarchyNode, PeopleData } from '@/types';
import { getSharedData } from '@/utils/excelParser';
import CirclePackingChart from '@/components/CirclePackingChart';
import Header from '@/components/Header';
import SearchInput from '@/components/SearchInput';
import InfoPanel from '@/components/InfoPanel';
import PersonInfoPanel from '@/components/PersonInfoPanel';
import { AlertTriangle } from 'lucide-react';

const SharedView: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [organizationData, setOrganizationData] = useState<HierarchyNode | null>(null);
  const [peopleData, setPeopleData] = useState<PeopleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<{
    name: string;
    value: number;
    roles?: { name: string; value: number }[];
    parent?: string;
    parentCircles?: string[];
    isRole?: boolean;
  } | null>(null);
  
  const [isPersonPanelOpen, setIsPersonPanelOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) {
      setError('Invalid share link');
      setIsLoading(false);
      return;
    }

    try {
      const sharedData = getSharedData(shareId);
      
      if (!sharedData) {
        setError('This shared organization structure cannot be found or has expired');
        setIsLoading(false);
        return;
      }
      
      setOrganizationData(sharedData.organizationData);
      setPeopleData(sharedData.peopleData || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading shared data:', error);
      setError('Failed to load shared organization structure');
      setIsLoading(false);
    }
  }, [shareId]);

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
        value: 0,
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
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading shared organization data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground text-center">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-4">
        <div className="w-full mx-auto">
          <div className="mb-4 p-4 bg-card rounded-lg border shadow-sm">
            <h2 className="text-2xl font-semibold mb-2">Shared Organization Structure</h2>
            <p className="text-muted-foreground">This organization structure has been shared with you</p>
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
          
          {organizationData ? (
            <div className="flex flex-col items-center">
              <div className="h-[80vh] w-full transition-all duration-500 ease-in-out animate-scale-in">
                <CirclePackingChart data={organizationData} peopleData={peopleData} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
              <p className="text-muted-foreground text-center">This shared organization structure doesn't contain any data</p>
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
            Organization Circle Visualizer — Shared View
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SharedView;
