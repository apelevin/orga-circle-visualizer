
import * as React from 'react';
import { User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PeopleData } from '@/types';
import CircleGroup from './CircleGroup';
import RoleGroup from './RoleGroup';
import PeopleList from './PeopleList';

interface PeopleSectionProps {
  assignedPeople: PeopleData[];
  isRoleCircle: boolean;
  peopleByRole: Array<{
    roleName: string;
    people: PeopleData[];
    totalFTE: number;
  }>;
  peopleByCircle: Array<{
    circleName: string;
    people: PeopleData[];
    totalFTE: number;
  }>;
  sortedAssignedPeople: PeopleData[];
  onCircleClick?: (circleName: string) => void;
  onPersonClick?: (personName: string) => void;
  onRoleClick?: (roleName: string) => void;
}

const PeopleSection: React.FC<PeopleSectionProps> = ({ 
  assignedPeople,
  isRoleCircle,
  peopleByRole,
  peopleByCircle,
  sortedAssignedPeople,
  onCircleClick,
  onPersonClick,
  onRoleClick
}) => {
  if (assignedPeople.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <Separator />
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <h3 className="text-sm font-medium">People Assigned</h3>
        <span className="text-xs text-muted-foreground ml-auto">{assignedPeople.length} people</span>
      </div>
      
      {isRoleCircle ? (
        <div className="space-y-4">
          {peopleByCircle.length > 0 ? (
            peopleByCircle.map((circleGroup, index) => (
              <CircleGroup
                key={`${circleGroup.circleName}-${index}`}
                circleName={circleGroup.circleName}
                people={circleGroup.people}
                totalFTE={circleGroup.totalFTE}
                onPersonClick={onPersonClick}
                onCircleClick={onCircleClick}
              />
            ))
          ) : (
            <PeopleList 
              people={sortedAssignedPeople} 
              onPersonClick={onPersonClick} 
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {peopleByRole.map((roleGroup, index) => (
            <RoleGroup
              key={`${roleGroup.roleName}-${index}`}
              roleName={roleGroup.roleName}
              people={roleGroup.people}
              totalFTE={roleGroup.totalFTE}
              onPersonClick={onPersonClick}
              onRoleClick={onRoleClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PeopleSection;
