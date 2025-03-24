
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { SelectedCircle } from './types';

interface CircleInfoProps {
  circle: SelectedCircle;
  totalAssignedFTE: number;
  onCircleClick?: (circleName: string) => void;
}

const CircleInfo: React.FC<CircleInfoProps> = ({ 
  circle, 
  totalAssignedFTE, 
  onCircleClick 
}) => {
  const calculatedTotal = circle.value;
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Total FTE</h3>
      <p className="text-lg font-semibold">{calculatedTotal.toFixed(2)}</p>
      
      {totalAssignedFTE > 0 && (
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
      
      {/* Show multiple parent circles if this is a role and has parent circles */}
      {circle.isRole && circle.parentCircles && circle.parentCircles.length > 1 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>Also appears in:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {circle.parentCircles
              .filter(c => c !== circle.parent)
              .map((circleName, index) => (
                <Badge 
                  key={`${circleName}-${index}`} 
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onCircleClick && onCircleClick(circleName)}
                >
                  {circleName}
                </Badge>
              ))}
          </div>
        </div>
      )}
      
      {/* Show parent circle if this is a role */}
      {circle.isRole && circle.parent && (
        <div className="text-sm text-muted-foreground">
          <span>Circle: </span>
          <Button 
            variant="link" 
            className="p-0 h-auto font-medium text-sm inline-flex items-center"
            onClick={() => onCircleClick && onCircleClick(circle.parent!)}
          >
            {circle.parent}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CircleInfo;
