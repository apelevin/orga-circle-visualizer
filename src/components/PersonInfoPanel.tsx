
import * as React from 'react';
import { PeopleData } from '@/types';
import { X, User, Briefcase, CircleDot } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PersonInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPerson: string | null;
  peopleData: PeopleData[];
  onCircleClick?: (circleName: string) => void;
  onRoleClick?: (roleName: string) => void;
}

const PersonInfoPanel: React.FC<PersonInfoPanelProps> = ({ 
  isOpen, 
  onClose, 
  selectedPerson,
  peopleData = [],
  onCircleClick,
  onRoleClick
}) => {
  if (!selectedPerson) return null;
  
  // Get all assignments for this person
  const personAssignments = peopleData.filter(p => p.personName === selectedPerson);
  
  // Calculate total FTE for this person
  const totalPersonFTE = personAssignments.reduce((sum, p) => sum + p.fte, 0);
  
  // If we get no assignments, show error state
  if (personAssignments.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="overflow-y-auto w-96 max-w-full">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl">{selectedPerson}</SheetTitle>
            <SheetDescription>
              Person Information
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 text-center text-muted-foreground">
            No assignments found for this person.
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  // Group assignments by role to avoid duplicate role entries
  const roleAssignments = personAssignments.reduce((acc, curr) => {
    const key = curr.roleName;
    if (!acc[key]) {
      acc[key] = {
        roleName: curr.roleName,
        circles: [{circleName: curr.circleName, fte: curr.fte}],
        totalFte: curr.fte
      };
    } else {
      acc[key].circles.push({circleName: curr.circleName, fte: curr.fte});
      acc[key].totalFte += curr.fte;
    }
    return acc;
  }, {} as Record<string, {roleName: string, circles: {circleName: string, fte: number}[], totalFte: number}>);
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto w-96 max-w-full">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            {selectedPerson}
          </SheetTitle>
          <SheetDescription>
            Person Information
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total FTE
            </h3>
            <p className="text-lg font-semibold">
              {totalPersonFTE.toFixed(2)}
            </p>
            
            <div className="text-sm text-muted-foreground mt-1">
              <span>Assigned to {Object.keys(roleAssignments).length} {Object.keys(roleAssignments).length === 1 ? 'role' : 'roles'}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <h3 className="text-sm font-medium">Role Assignments</h3>
            </div>
            
            <div className="space-y-4">
              {Object.values(roleAssignments).map((roleGroup, index) => (
                <div key={`${roleGroup.roleName}-${index}`} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-sm hover:underline text-left whitespace-normal flex-1 mr-2 justify-start font-medium text-foreground"
                        onClick={() => onRoleClick && onRoleClick(roleGroup.roleName)}
                      >
                        {roleGroup.roleName}
                      </Button>
                      <Badge variant="outline">{roleGroup.totalFte.toFixed(2)} FTE</Badge>
                    </div>
                    
                    {roleGroup.circles.map((circle, circleIndex) => (
                      <div key={`${circle.circleName}-${circleIndex}`} className="flex items-center gap-1.5">
                        <CircleDot className="h-3.5 w-3.5 text-muted-foreground" />
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-xs hover:underline text-muted-foreground"
                          onClick={() => onCircleClick && onCircleClick(circle.circleName)}
                        >
                          {circle.circleName}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PersonInfoPanel;
