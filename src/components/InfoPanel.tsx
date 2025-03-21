
import React from 'react';
import { Role } from '@/types';
import { X, ExternalLink, Users } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  onCircleClick?: (circleName: string) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  isOpen, 
  onClose, 
  selectedCircle,
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

  const handleCircleClick = (circleName: string) => {
    if (onCircleClick) {
      onCircleClick(circleName);
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto">
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
          
          {!isRoleCircle && selectedCircle.roles && selectedCircle.roles.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Roles</h3>
                <span className="text-xs text-muted-foreground">{selectedCircle.roles.length} roles</span>
              </div>
              
              <Separator />
              
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InfoPanel;
