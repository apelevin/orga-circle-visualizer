
import React from 'react';
import { StructureProblem } from '@/utils/structureAnalysis';
import { 
  Briefcase, 
  CircleAlert,
  Circle, 
  List, 
  Users 
} from 'lucide-react';

interface ProblemIconProps {
  type: StructureProblem['type'];
}

const ProblemIcon: React.FC<ProblemIconProps> = ({ type }) => {
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

export default ProblemIcon;
