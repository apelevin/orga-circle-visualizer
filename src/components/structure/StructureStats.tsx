
import React from 'react';
import { Users, CircleAlert, Briefcase, Ban, UserX } from 'lucide-react';
import StatCard from './StatCard';
import { StructureProblemStats } from './types';

interface StructureStatsProps {
  stats: StructureProblemStats;
}

const StructureStats: React.FC<StructureStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      <StatCard 
        title="Low FTE People" 
        count={stats['person-low-fte']} 
        icon={<Users className="h-5 w-5 text-amber-500" />}
        description="People with less than 1.0 FTE"
      />
      <StatCard 
        title="Low FTE Circles" 
        count={stats['circle-low-fte']} 
        icon={<CircleAlert className="h-5 w-5 text-red-500" />}
        description="Circles with insufficient FTE"
      />
      <StatCard 
        title="Large Circles" 
        count={stats['circle-high-fte']} 
        icon={<CircleAlert className="h-5 w-5 text-orange-500" />}
        description="Circles exceeding 12 FTE"
      />
      <StatCard 
        title="Single Role Circles" 
        count={stats['circle-single-role']} 
        icon={<Briefcase className="h-5 w-5 text-blue-500" />}
        description="Circles with only one role"
      />
      <StatCard 
        title="Zero FTE Circles" 
        count={stats['circle-zero-fte']} 
        icon={<Ban className="h-5 w-5 text-red-600" />}
        description="Circles with no assigned FTE"
      />
      <StatCard 
        title="Unassigned Roles" 
        count={stats['role-unassigned']} 
        icon={<UserX className="h-5 w-5 text-orange-500" />}
        description="Roles without an assigned person"
      />
    </div>
  );
};

export default StructureStats;
