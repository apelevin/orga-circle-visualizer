
import React from 'react';
import { Role } from '@/types';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCircle: {
    name: string;
    value: number;
    roles?: { name: string; value: number }[];
    parent?: string;
    isRole?: boolean;
  } | null;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ isOpen, onClose, selectedCircle }) => {
  if (!selectedCircle) return null;
  
  const isRoleCircle = selectedCircle.isRole;
  
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
              {selectedCircle.value.toFixed(2)}
            </p>
            
            {isRoleCircle && selectedCircle.parent && (
              <div className="text-sm text-muted-foreground">
                <span>Circle: </span>
                <span className="font-medium">{selectedCircle.parent}</span>
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
                  <div key={`${role.name}-${index}`} className="flex items-center justify-between">
                    <span className="text-sm">{role.name}</span>
                    <span className="text-sm font-medium">{role.value.toFixed(2)} FTE</span>
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
