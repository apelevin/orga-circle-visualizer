
import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import CircleRolesList from './CircleRolesList';

interface RoleSectionProps {
  isRoleCircle: boolean;
  roles?: { name: string; value: number }[];
  onRoleClick?: (roleName: string) => void;
}

const RoleSection: React.FC<RoleSectionProps> = ({ isRoleCircle, roles, onRoleClick }) => {
  if (isRoleCircle || !roles || roles.length === 0) return null;
  
  return (
    <div className="space-y-4 pt-2">
      <Separator />
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Roles</h3>
        <span className="text-xs text-muted-foreground">{roles.length} roles</span>
      </div>
      
      <CircleRolesList roles={roles} onRoleClick={onRoleClick} />
    </div>
  );
};

export default RoleSection;
