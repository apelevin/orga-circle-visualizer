
import * as React from 'react';
import { useState } from 'react';
import { PeopleData } from '@/types';
import { User, Briefcase, CircleDot, Edit, Scale } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EditFTEDialog from './EditFTEDialog';
import { toast } from 'sonner';

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
  const [editingAssignment, setEditingAssignment] = useState<{
    circleName: string;
    roleName: string;
    fte: number;
  } | null>(null);

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

  const handleEditAssignment = (circleName: string, roleName: string, fte: number) => {
    setEditingAssignment({
      circleName,
      roleName,
      fte
    });
  };

  const handleFTEUpdate = (newFTE: number) => {
    if (editingAssignment) {
      toast.info(`Updated FTE for ${selectedPerson} in ${editingAssignment.circleName} to ${newFTE}`);
      // In a real application, this would save to your backend/data store
      setEditingAssignment(null);
    }
  };
  
  const handleNormalizeFTE = () => {
    if (totalPersonFTE <= 0) {
      toast.error("Cannot normalize when total FTE is zero or negative");
      return;
    }
    
    // Calculate what normalization would look like
    const normalizedAssignments = personAssignments.map(assignment => ({
      ...assignment,
      normalizedFTE: assignment.fte / totalPersonFTE
    }));
    
    const totalNormalizedFTE = normalizedAssignments.reduce((sum, a) => sum + a.normalizedFTE, 0);
    
    // Show what would change in a toast message
    toast.success(
      `Normalized FTE for ${selectedPerson}. Total is now ${totalNormalizedFTE.toFixed(2)}`, 
      {
        description: "In a real application, this would save the normalized values to your database."
      }
    );
  };
  
  return (
    <>
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total FTE
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1.5"
                  onClick={handleNormalizeFTE}
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>Normalize to 1.0</span>
                </Button>
              </div>
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
                        <div key={`${circle.circleName}-${circleIndex}`} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
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
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">{circle.fte.toFixed(2)}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1 h-auto"
                              onClick={() => handleEditAssignment(circle.circleName, roleGroup.roleName, circle.fte)}
                            >
                              <Edit className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
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

      {/* FTE Edit Dialog */}
      {editingAssignment && (
        <EditFTEDialog
          isOpen={!!editingAssignment}
          onClose={() => setEditingAssignment(null)}
          onSave={handleFTEUpdate}
          title="Edit Assignment FTE"
          description={`Update FTE for ${selectedPerson} in ${editingAssignment.circleName}`}
          currentFTE={editingAssignment.fte}
          entityName={selectedPerson || ""}
          entityType="person"
        />
      )}
    </>
  );
};

export default PersonInfoPanel;
