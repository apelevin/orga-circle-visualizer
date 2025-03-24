
import React from "react";
import { HierarchyNode, PeopleData } from "@/types";
import CirclePackingChart from "@/components/CirclePackingChart";
import StructureProblems from "@/components/StructureProblems";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDot, CircleAlert } from "lucide-react";

interface VisualizationTabsProps {
  organizationData: HierarchyNode;
  peopleData: PeopleData[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCircleClick: (nodeName: string) => void;
  onPersonClick: (personName: string) => void;
}

const VisualizationTabs = ({ 
  organizationData, 
  peopleData, 
  activeTab, 
  setActiveTab, 
  onCircleClick, 
  onPersonClick 
}: VisualizationTabsProps) => {
  return (
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
  );
};

export default VisualizationTabs;
