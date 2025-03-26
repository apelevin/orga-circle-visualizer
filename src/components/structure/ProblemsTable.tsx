
import React from 'react';
import { StructureProblem } from '@/utils/structureAnalysis';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, CircleAlert, Briefcase, Ban, UserX, List } from 'lucide-react';

interface ProblemsTableProps {
  problems: StructureProblem[];
  onItemClick: (problem: StructureProblem) => void;
}

const ProblemsTable: React.FC<ProblemsTableProps> = ({ problems, onItemClick }) => {
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
        return <Ban className="h-4 w-4 text-red-600" />;
      case 'role-unassigned':
        return <UserX className="h-4 w-4 text-orange-500" />;
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
        return 'Circle with no assigned FTE';
      case 'role-unassigned':
        return 'Role with no person assigned';
      default:
        return 'Unknown issue';
    }
  };

  return (
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
                onClick={() => onItemClick(problem)}
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
  );
};

export default ProblemsTable;
