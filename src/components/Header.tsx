
import React from 'react';
import { HierarchyNode, PeopleData } from '@/types';
import { Circle, Briefcase, Users } from 'lucide-react';

interface HeaderProps {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
}

const Header: React.FC<HeaderProps> = ({ organizationData, peopleData }) => {
  // Calculate total circles, roles, and people
  const totalCircles = organizationData?.children?.length || 0;
  
  const totalRoles = organizationData?.children?.reduce((total, circle) => {
    return total + (circle.children?.length || 0);
  }, 0) || 0;
  
  // Get unique people count (avoiding duplicates)
  const uniquePeople = new Set(peopleData.map(person => person.personName));
  const totalPeople = uniquePeople.size;

  return (
    <header className="w-full pb-6 md:pb-8 pt-8 px-6 animate-fade-in">
      <div className="max-w-screen-xl mx-auto">
        {organizationData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 bg-card rounded-lg border border-border p-4">
            <MetricCard 
              title="Total Circles" 
              value={totalCircles}
              icon={<Circle className="h-5 w-5 text-primary" />}
            />
            <MetricCard 
              title="Total Roles" 
              value={totalRoles}
              icon={<Briefcase className="h-5 w-5 text-indigo-500" />}
            />
            <MetricCard 
              title="Total People" 
              value={totalPeople}
              icon={<Users className="h-5 w-5 text-green-500" />}
            />
          </div>
        )}
      </div>
    </header>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => {
  return (
    <div className="flex items-center p-2">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default Header;
