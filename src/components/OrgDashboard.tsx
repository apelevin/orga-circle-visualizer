
import React, { useMemo } from 'react';
import { HierarchyNode, PeopleData } from '@/types';
import { Circle, Briefcase, Users } from 'lucide-react';

interface OrgDashboardProps {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
}

const OrgDashboard: React.FC<OrgDashboardProps> = ({ 
  organizationData, 
  peopleData 
}) => {
  const metrics = useMemo(() => {
    if (!organizationData) {
      return {
        circleCount: 0,
        roleCount: 0,
        peopleCount: 0
      };
    }

    const circleCount = organizationData.children?.length || 0;
    
    let roleCount = 0;
    organizationData.children?.forEach(circle => {
      roleCount += circle.children?.length || 0;
    });

    // Count unique people (a person might have multiple roles)
    const uniquePeople = new Set<string>();
    peopleData.forEach(person => {
      uniquePeople.add(person.personName);
    });

    return {
      circleCount,
      roleCount,
      peopleCount: uniquePeople.size
    };
  }, [organizationData, peopleData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
      <div className="bg-white/50 rounded-lg p-4 shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Circle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">{metrics.circleCount}</h3>
            <p className="text-muted-foreground">Total Circles</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/50 rounded-lg p-4 shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">{metrics.roleCount}</h3>
            <p className="text-muted-foreground">Total Roles</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/50 rounded-lg p-4 shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">{metrics.peopleCount}</h3>
            <p className="text-muted-foreground">Total People</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;
