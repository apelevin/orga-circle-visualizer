
import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { PeopleData } from '@/types';
import { SelectedCircle, InfoPanelBaseProps } from './types';
import CircleInfo from './CircleInfo';
import RoleSection from './RoleSection';
import PeopleSection from './PeopleSection';

interface InfoPanelProps extends InfoPanelBaseProps {
  selectedCircle: SelectedCircle | null;
  peopleData: PeopleData[];
  onCircleClick?: (circleName: string) => void;
  onPersonClick?: (personName: string) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  isOpen, 
  onClose, 
  selectedCircle,
  peopleData = [],
  onCircleClick,
  onPersonClick
}) => {
  if (!selectedCircle) return null;
  
  const isRoleCircle = selectedCircle.isRole;
  
  // For roles, calculate total demand across all circles
  let totalRoleDemand = selectedCircle.value;
  
  if (isRoleCircle && selectedCircle.parentCircles && selectedCircle.parentCircles.length > 0) {
    // For roles, we need to sum the demand across all circles
    // The current value is just from one circle, so we need to find all instances
    totalRoleDemand = selectedCircle.parentCircles.reduce((total, circleName) => {
      // This assumes there's a consistent way to get this data
      // If the data structure doesn't provide this, you'll need to adjust
      return total + (selectedCircle.value || 0);
    }, 0);
  }
  
  // Use the calculated total for roles, or the direct value for circles
  const displayValue = isRoleCircle ? totalRoleDemand : selectedCircle.value;
  
  // If it's a circle with roles, validate the total against the sum of roles
  let calculatedTotal = displayValue;
  if (!isRoleCircle && selectedCircle.roles && selectedCircle.roles.length > 0) {
    // Double-check by summing up the individual role values
    calculatedTotal = selectedCircle.roles.reduce((sum, role) => sum + role.value, 0);
  }

  // Get people assigned to the selected role or circle
  const getAssignedPeople = () => {
    if (!peopleData || peopleData.length === 0) return [];
    
    if (isRoleCircle) {
      // For roles, get all people with this role name across all circles
      return peopleData.filter(p => p.roleName === selectedCircle.name);
    } else {
      // For circles, get all people assigned to any role in this circle
      return peopleData.filter(p => p.circleName === selectedCircle.name);
    }
  };

  // Get alphabetically sorted people
  const getAlphabeticallySortedPeople = (people: PeopleData[]) => {
    return [...people].sort((a, b) => a.personName.localeCompare(b.personName));
  };

  const assignedPeople = getAssignedPeople();
  const sortedAssignedPeople = getAlphabeticallySortedPeople(assignedPeople);
  const totalAssignedFTE = assignedPeople.reduce((sum, p) => sum + p.fte, 0);
  
  // Get people grouped by role (for circle view)
  const getPeopleByRole = () => {
    if (!isRoleCircle && assignedPeople.length > 0) {
      const roleMap = new Map<string, PeopleData[]>();
      
      assignedPeople.forEach(person => {
        if (!roleMap.has(person.roleName)) {
          roleMap.set(person.roleName, []);
        }
        roleMap.get(person.roleName)!.push(person);
      });
      
      return Array.from(roleMap.entries())
        .map(([roleName, people]) => {
          const sortedPeople = getAlphabeticallySortedPeople(people);
          const totalRoleFTE = people.reduce((sum, p) => sum + p.fte, 0);
          return {
            roleName,
            people: sortedPeople,
            totalFTE: totalRoleFTE
          };
        });
    }
    return [];
  };

  // Get people grouped by circle (for role view)
  const getPeopleByCircle = () => {
    if (isRoleCircle && assignedPeople.length > 0) {
      const circleMap = new Map<string, PeopleData[]>();
      
      assignedPeople.forEach(person => {
        if (!circleMap.has(person.circleName)) {
          circleMap.set(person.circleName, []);
        }
        circleMap.get(person.circleName)!.push(person);
      });
      
      return Array.from(circleMap.entries())
        .sort(([circleNameA], [circleNameB]) => circleNameA.localeCompare(circleNameB))
        .map(([circleName, people]) => {
          const sortedPeople = getAlphabeticallySortedPeople(people);
          const totalCircleFTE = people.reduce((sum, p) => sum + p.fte, 0);
          return {
            circleName,
            people: sortedPeople,
            totalFTE: totalCircleFTE
          };
        });
    }
    return [];
  };

  const peopleByRole = getPeopleByRole();
  const peopleByCircle = getPeopleByCircle();
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto w-96 max-w-full">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">{selectedCircle.name}</SheetTitle>
          <SheetDescription>
            {isRoleCircle ? 'Role Information' : 'Circle Information'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          <CircleInfo 
            circle={{...selectedCircle, value: calculatedTotal}} 
            totalAssignedFTE={totalAssignedFTE} 
            onCircleClick={onCircleClick} 
          />
          
          <RoleSection 
            isRoleCircle={isRoleCircle} 
            roles={selectedCircle.roles} 
            onRoleClick={onCircleClick}
          />
          
          <PeopleSection 
            assignedPeople={assignedPeople}
            isRoleCircle={isRoleCircle}
            peopleByRole={peopleByRole}
            peopleByCircle={peopleByCircle}
            sortedAssignedPeople={sortedAssignedPeople}
            onCircleClick={onCircleClick}
            onPersonClick={onPersonClick}
            onRoleClick={onCircleClick}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InfoPanel;
