
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface CircleRolesListProps {
  roles: { name: string; value: number }[];
  onRoleClick?: (roleName: string) => void;
}

const CircleRolesList: React.FC<CircleRolesListProps> = ({ roles, onRoleClick }) => {
  if (!roles || roles.length === 0) return null;

  return (
    <div className="space-y-3">
      {roles.map((role, index) => (
        <div key={`${role.name}-${index}`} className="flex items-start justify-between group">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-sm hover:bg-transparent hover:underline text-left whitespace-normal flex-1 mr-2 justify-start"
            onClick={() => onRoleClick && onRoleClick(role.name)}
          >
            <span className="line-clamp-2 text-left">{role.name}</span>
            <ExternalLink className="ml-1 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity inline-flex shrink-0" />
          </Button>
          <span className="text-sm font-medium whitespace-nowrap">{role.value.toFixed(2)} FTE</span>
        </div>
      ))}
    </div>
  );
};

export default CircleRolesList;
