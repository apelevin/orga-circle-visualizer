
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Briefcase, 
  CircleAlert,
  Circle, 
  List, 
  Users 
} from 'lucide-react';

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
  
  const getProblemIcon = (type: StructureProblem['type']) => {
    switch (type) {
      case 'person-low-fte':
        return <Users className="h-4 w-4 text-amber-500" />;
      case 'circle-low-fte':
        return <CircleAlert className="h-4 w-4 text-red-500" />;
      case 'circle-high-fte':
        return <CircleAlert className="h-4 w-4 text-red-500" />;
      case 'circle-single-role':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'circle-zero-fte':
        return <Circle className="h-4 w-4 text-gray-500" />;
      default:
        return <List className="h-4 w-4" />;
    }
  };

  const getProblemDescription = (type: StructureProblem['type']) => {
    switch (type) {
      case 'person-low-fte':
        return 'Person with less than 1.0 FTE';
      case 'circle-low-fte':
        return 'Circle with insufficient assigned FTE';
      case 'circle-high-fte':
        return 'Circle exceeding 12 FTE (too large)';
      case 'circle-single-role':
        return 'Circle with only one role';
      case 'circle-zero-fte':
        return 'Circle with 0 FTE';
      default:
        return 'Unknown issue';
    }
  };
  
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
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No structure problems detected!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your organization structure is well-balanced
              </p>
            </div>
          ) : (
            <>
              {/* Dashboard Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                <div className="rounded-md border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-medium">People with Low FTE</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{problemCounts['person-low-fte']}</p>
                </div>
                
                <div className="rounded-md border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CircleAlert className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium">Circles with Low FTE</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{problemCounts['circle-low-fte']}</p>
                </div>
                
                <div className="rounded-md border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CircleAlert className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium">Circles with High FTE</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{problemCounts['circle-high-fte']}</p>
                </div>
                
                <div className="rounded-md border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium">Single Role Circles</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{problemCounts['circle-single-role']}</p>
                </div>
                
                <div className="rounded-md border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium">Zero FTE Circles</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{problemCounts['circle-zero-fte']}</p>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((problem, index) => (
                    <TableRow key={`${problem.type}-${problem.name}-${index}`}>
                      <TableCell className="flex items-center gap-2">
                        {getProblemIcon(problem.type)}
                        <span className="text-xs sm:text-sm">
                          {getProblemDescription(problem.type)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <button 
                          onClick={() => handleItemClick(problem)}
                          className="hover:text-primary hover:underline focus:outline-none focus:text-primary transition-colors"
                        >
                          {problem.name}
                        </button>
                      </TableCell>
                      <TableCell>{problem.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StructureProblems;
