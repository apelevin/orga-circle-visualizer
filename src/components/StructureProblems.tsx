
import React, { useMemo } from 'react';
import { HierarchyNode, PeopleData } from '@/types';
import { analyzeStructure, StructureProblem } from '@/utils/structureAnalysis';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { CircleAlert } from 'lucide-react';
import ProblemsSummary from './structure-problems/ProblemsSummary';
import ProblemsTable from './structure-problems/ProblemsTable';
import EmptyState from './structure-problems/EmptyState';

interface StructureProblemsProps {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  onCircleClick?: (circleName: string) => void;
  onPersonClick?: (personName: string) => void;
}

const StructureProblems: React.FC<StructureProblemsProps> = ({ 
  organizationData, 
  peopleData,
  onCircleClick,
  onPersonClick
}) => {
  const problems = analyzeStructure(organizationData, peopleData);
  
  // Count problems by type for dashboard display
  const problemCounts = useMemo(() => {
    const counts = {
      'person-low-fte': 0,
      'circle-low-fte': 0,
      'circle-high-fte': 0, 
      'circle-single-role': 0,
      'circle-zero-fte': 0
    };
    
    problems.forEach(problem => {
      if (counts.hasOwnProperty(problem.type)) {
        counts[problem.type as keyof typeof counts]++;
      }
    });
    
    return counts;
  }, [problems]);
  
  const handleItemClick = (problem: StructureProblem) => {
    if (problem.type === 'person-low-fte' && onPersonClick) {
      onPersonClick(problem.name);
    } else if (
      ['circle-low-fte', 'circle-high-fte', 'circle-single-role', 'circle-zero-fte'].includes(problem.type) && 
      onCircleClick
    ) {
      onCircleClick(problem.name);
    }
  };

  if (!organizationData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please upload organization data to analyze structure problems</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleAlert className="h-5 w-5 text-red-500" />
            Structure Problems ({problems.length})
          </CardTitle>
          <CardDescription>
            Analysis of organizational structure issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {problems.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Dashboard Summary */}
              <ProblemsSummary problemCounts={problemCounts} />
              
              {/* Problems Table */}
              <ProblemsTable 
                problems={problems} 
                onItemClick={handleItemClick}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StructureProblems;
