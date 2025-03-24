
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import CirclePackingChart from '@/components/CirclePackingChart';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { HierarchyNode, PeopleData } from '@/types';

const Index = () => {
  const [organizationData, setOrganizationData] = useState<HierarchyNode | null>(null);
  const [peopleData, setPeopleData] = useState<PeopleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-10 flex justify-center">
            <FileUpload 
              onFileProcessed={handleFileProcessed} 
              onPeopleFileProcessed={handlePeopleFileProcessed}
              isLoading={isLoading}
            />
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="mt-4 text-muted-foreground">Processing your organization data...</p>
            </div>
          ) : organizationData ? (
            <div className="h-[70vh] w-full transition-all duration-500 ease-in-out animate-scale-in">
              <CirclePackingChart data={organizationData} peopleData={peopleData} />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mt-4 animate-slide-up">
              <EmptyState />
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t border-border/40 mt-auto">
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
