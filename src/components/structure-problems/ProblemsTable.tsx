
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
import ProblemIcon from './ProblemIcon';
import ProblemDescription from './ProblemDescription';

interface ProblemsTableProps {
  problems: StructureProblem[];
  onItemClick: (problem: StructureProblem) => void;
}

const ProblemsTable: React.FC<ProblemsTableProps> = ({ 
  problems,
  onItemClick
}) => {
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
              <ProblemIcon type={problem.type} />
              <span className="text-xs sm:text-sm">
                <ProblemDescription type={problem.type} />
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
