import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { HierarchyNode, PeopleData } from "@/types";
import { getSharedData } from "@/utils/shareUtils";
import CirclePackingChart from "@/components/CirclePackingChart";
import SearchInput from "@/components/SearchInput";
import InfoPanel from "@/components/InfoPanel";
import PersonInfoPanel from "@/components/PersonInfoPanel";
import StructureProblems from "@/components/StructureProblems";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDot, CircleAlert } from "lucide-react";
import { toast } from "sonner";

const SharedView = () => {
  const { id } = useParams<{ id: string }>();
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

  useEffect(() => {
    if (!id) {
      toast.error("Invalid share link");
      navigate("/");
      return;
    }

    const sharedData = getSharedData(id);
    
    if (!sharedData || !sharedData.organizationData) {
      setIsLoading(false);
      toast.error("This shared link has expired or doesn't exist");
      setTimeout(() => navigate("/"), 3000);
      return;
    }

    setOrganizationData(sharedData.organizationData);
    setPeopleData(sharedData.peopleData || []);
    setOrgName(sharedData.name || "Organization");
    setIsLoading(false);
  }, [id, navigate]);

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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading shared organization data...</p>
      </div>
    );
  }

  if (!organizationData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-xl font-semibold">This shared link has expired or doesn't exist</p>
        <Button asChild className="mt-4">
          <Link to="/">Go to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{orgName}</h1>
          </div>
        </div>
      </header>
      
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
          <Tabs 
            defaultValue="visualization" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mb-4"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="visualization" className="flex items-center gap-2">
                <CircleDot className="h-4 w-4" />
                <span>Visualization</span>
              </TabsTrigger>
              <TabsTrigger value="problems" className="flex items-center gap-2">
                <CircleAlert className="h-4 w-4" />
                <span>Structure Problems</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="visualization" className="w-full">
              <div className="h-[80vh] w-full transition-all duration-500 ease-in-out animate-scale-in">
                <CirclePackingChart data={organizationData} peopleData={peopleData} />
              </div>
            </TabsContent>
            
            <TabsContent value="problems" className="w-full mt-4">
              <div className="min-h-[70vh] w-full transition-all duration-500 ease-in-out animate-scale-in">
                <StructureProblems organizationData={organizationData} peopleData={peopleData} />
              </div>
            </TabsContent>
          </Tabs>
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
            Organization Circle Visualizer — View shared organization structure
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SharedView;
