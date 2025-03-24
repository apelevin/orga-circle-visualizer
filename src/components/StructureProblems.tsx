
import React from 'react';
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StructureProblems;
