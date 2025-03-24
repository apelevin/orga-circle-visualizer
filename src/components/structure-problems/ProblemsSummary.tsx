
import React from 'react';
import { StructureProblem } from '@/utils/structureAnalysis';
import { 
  Briefcase, 
  CircleAlert,
  Circle, 
  Users 
} from 'lucide-react';

interface ProblemsSummaryProps {
  problemCounts: {
    'person-low-fte': number;
    'circle-low-fte': number;
    'circle-high-fte': number;
    'circle-single-role': number;
    'circle-zero-fte': number;
  };
}

const ProblemsSummary: React.FC<ProblemsSummaryProps> = ({ problemCounts }) => {
  return (
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
  );
};

export default ProblemsSummary;
