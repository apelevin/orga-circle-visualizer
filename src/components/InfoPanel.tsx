
import React from 'react';
import { Person, PeopleData } from '@/types';
import { X, ExternalLink, Users, User } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCircle: {
    name: string;
    value: number;
    roles?: { name: string; value: number }[];
    parent?: string;
    parentCircles?: string[];
    isRole?: boolean;
  } | null;
  peopleData: PeopleData[];
  onCircleClick?: (circleName: string) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  isOpen, 
  onClose, 
  selectedCircle,
  peopleData = [],
  onCircleClick 
}) => {
  if (!selectedCircle) return null;
  
  const isRoleCircle = selectedCircle.isRole;
  
  // Use the direct value from the circle/role
  const displayValue = selectedCircle.value;
  
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

  const handleCircleClick = (circleName: string) => {
    if (onCircleClick) {
      onCircleClick(circleName);
    }
  };
  
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
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isRoleCircle ? 'FTE Required' : 'Total FTE'}
            </h3>
            <p className="text-lg font-semibold">
              {calculatedTotal.toFixed(2)}
            </p>
            
            {assignedPeople.length > 0 && (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm text-muted-foreground">Assigned:</span>
                <span className="text-sm font-medium">{totalAssignedFTE.toFixed(2)}</span>
                
                {calculatedTotal > 0 && (
                  <Badge variant={totalAssignedFTE >= calculatedTotal ? "secondary" : "destructive"} className="ml-auto">
                    {Math.round((totalAssignedFTE / calculatedTotal) * 100)}%
                  </Badge>
                )}
              </div>
            )}
            
            {isRoleCircle && selectedCircle.parent && (
              <div className="text-sm text-muted-foreground">
                <span>Circle: </span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium text-sm inline-flex items-center"
                  onClick={() => handleCircleClick(selectedCircle.parent!)}
                >
                  {selectedCircle.parent}
                  <ExternalLink className="ml-1 w-3 h-3" />
                </Button>
              </div>
            )}
            
            {/* Show multiple parent circles if available */}
            {isRoleCircle && selectedCircle.parentCircles && selectedCircle.parentCircles.length > 1 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>Also appears in:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCircle.parentCircles
                    .filter(circle => circle !== selectedCircle.parent)
                    .map((circle, index) => (
                      <Badge 
                        key={`${circle}-${index}`} 
                        variant="outline"
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleCircleClick(circle)}
                      >
                        {circle}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Show roles section for circles */}
          {!isRoleCircle && selectedCircle.roles && selectedCircle.roles.length > 0 && (
            <div className="space-y-4 pt-2">
              <Separator />
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Roles</h3>
                <span className="text-xs text-muted-foreground">{selectedCircle.roles.length} roles</span>
              </div>
              
              <div className="space-y-3">
                {selectedCircle.roles.map((role, index) => (
                  <div key={`${role.name}-${index}`} className="flex items-start justify-between group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto text-sm hover:bg-transparent hover:underline text-left whitespace-normal flex-1 mr-2 justify-start"
                      onClick={() => handleCircleClick(role.name)}
                    >
                      <span className="line-clamp-2 text-left">{role.name}</span>
                      <ExternalLink className="ml-1 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity inline-flex shrink-0" />
                    </Button>
                    <span className="text-sm font-medium whitespace-nowrap">{role.value.toFixed(2)} FTE</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* People Assigned Section */}
          {assignedPeople.length > 0 && (
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
                      <div key={`${circleGroup.circleName}-${index}`}>
                        <div className="flex items-baseline justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto text-sm hover:bg-transparent hover:underline text-left whitespace-normal flex-1 mr-2 justify-start"
                            onClick={() => handleCircleClick(circleGroup.circleName)}
                          >
                            <span className="text-sm font-medium">{circleGroup.circleName}</span>
                            <ExternalLink className="ml-1 w-3 h-3 opacity-0 hover:opacity-100 transition-opacity inline-flex shrink-0" />
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {circleGroup.people.length} {circleGroup.people.length === 1 ? 'person' : 'people'} • {circleGroup.totalFTE.toFixed(2)} FTE
                          </span>
                        </div>
                        
                        <div className="mt-1 pl-2 border-l-2 border-muted space-y-1">
                          <ol className="list-decimal pl-5 space-y-1">
                            {circleGroup.people.map((person, pIndex) => (
                              <li key={`${person.personName}-${pIndex}`} className="flex justify-between items-baseline py-1">
                                <span className="text-sm">{person.personName}</span>
                                <span className="text-xs text-muted-foreground">{person.fte.toFixed(2)}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="mt-2">
                      <ol className="list-decimal pl-5 space-y-1">
                        {sortedAssignedPeople.map((person, index) => (
                          <li key={`${person.personName}-${index}`} className="flex justify-between items-baseline py-1">
                            <span className="text-sm">{person.personName}</span>
                            <span className="text-xs text-muted-foreground">{person.fte.toFixed(2)}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {peopleByRole.map((roleGroup, index) => (
                    <div key={`${roleGroup.roleName}-${index}`}>
                      <div className="flex items-baseline justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto text-sm hover:bg-transparent hover:underline text-left whitespace-normal flex-1 mr-2 justify-start"
                          onClick={() => handleCircleClick(roleGroup.roleName)}
                        >
                          <span className="text-sm font-medium">{roleGroup.roleName}</span>
                          <ExternalLink className="ml-1 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity inline-flex shrink-0" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {roleGroup.people.length} {roleGroup.people.length === 1 ? 'person' : 'people'} • {roleGroup.totalFTE.toFixed(2)} FTE
                        </span>
                      </div>
                      
                      <div className="mt-1 pl-2 border-l-2 border-muted space-y-1">
                        <ol className="list-decimal pl-5 space-y-1">
                          {roleGroup.people.map((person, pIndex) => (
                            <li key={`${person.personName}-${pIndex}`} className="flex justify-between items-baseline py-1">
                              <span className="text-sm">{person.personName}</span>
                              <span className="text-xs text-muted-foreground">{person.fte.toFixed(2)}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InfoPanel;
