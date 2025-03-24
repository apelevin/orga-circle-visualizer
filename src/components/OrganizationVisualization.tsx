
import * as React from 'react';
import { CircleDot, CircleAlert, RefreshCw } from 'lucide-react';
import { HierarchyNode, PeopleData } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CirclePackingChart from '@/components/CirclePackingChart';
import StructureProblems from '@/components/StructureProblems';

interface OrganizationVisualizationProps {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  isLoading: boolean;
  onCircleClick: (circleName: string) => void;
  onPersonClick: (personName: string) => void;
  onReset: () => void;
}

const OrganizationVisualization: React.FC<OrganizationVisualizationProps> = ({
  organizationData,
  peopleData,
  isLoading,
  onCircleClick,
  onPersonClick,
  onReset
}) => {
  const [activeTab, setActiveTab] = React.useState("visualization");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="mt-4 text-muted-foreground">Processing your organization data...</p>
      </div>
    );
  }

  if (!organizationData) return null;

  return (
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
            <StructureProblems 
              organizationData={organizationData} 
              peopleData={peopleData} 
              onCircleClick={onCircleClick}
              onPersonClick={onPersonClick}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 flex flex-col items-center">
        <Button 
          variant="outline"
          size="sm"
          onClick={onReset}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-8 py-6 rounded-full"
        >
          <RefreshCw className="h-5 w-5" />
          <span className="text-base">Reset Data</span>
        </Button>
        <p className="mt-3 text-muted-foreground text-sm">
          Reload the page to upload new data
        </p>
      </div>
    </div>
  );
};

export default OrganizationVisualization;
