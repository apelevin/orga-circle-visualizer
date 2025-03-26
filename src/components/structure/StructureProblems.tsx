
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
import StructureStats from './StructureStats';
import ProblemsTable from './ProblemsTable';
import type { StructureProblemsProps } from './types';

const StructureProblems: React.FC<StructureProblemsProps> = ({ 
  organizationData, 
  peopleData,
  onCircleClick,
  onPersonClick
}) => {
  const problems = analyzeStructure(organizationData, peopleData);
  
  const problemStats = useMemo(() => {
    const stats = {
      'person-low-fte': 0,
      'circle-low-fte': 0,
      'circle-high-fte': 0,
      'circle-single-role': 0,
      'circle-zero-fte': 0,
      'role-unassigned': 0,
      total: 0
    };
    
    problems.forEach(problem => {
      stats[problem.type]++;
      stats.total++;
    });
    
    return stats;
  }, [problems]);
  
  const handleItemClick = (problem: StructureProblem) => {
    if (problem.type === 'person-low-fte' && onPersonClick) {
      onPersonClick(problem.name);
    } else if (
      ['circle-low-fte', 'circle-high-fte', 'circle-single-role', 'circle-zero-fte'].includes(problem.type) && 
      onCircleClick
    ) {
      onCircleClick(problem.name);
    } else if (problem.type === 'role-unassigned' && onCircleClick) {
      const match = problem.details.match(/in\s+(.+)$/);
      if (match && match[1]) {
        onCircleClick(match[1]);
      }
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
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No structure problems detected!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your organization structure is well-balanced
              </p>
            </div>
          ) : (
            <>
              <StructureStats stats={problemStats} />
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
