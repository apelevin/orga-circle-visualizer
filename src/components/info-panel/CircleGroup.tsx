
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { CircleGroupProps } from './types';

const CircleGroup: React.FC<CircleGroupProps> = ({ 
  circleName, 
  people, 
  totalFTE, 
  onPersonClick, 
  onCircleClick 
}) => {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto text-sm hover:bg-transparent hover:underline text-left whitespace-normal flex-1 mr-2 justify-start"
          onClick={() => onCircleClick && onCircleClick(circleName)}
        >
          <span className="text-sm font-medium">{circleName}</span>
          <ExternalLink className="ml-1 w-3 h-3 opacity-0 hover:opacity-100 transition-opacity inline-flex shrink-0" />
        </Button>
        <span className="text-xs text-muted-foreground">
          {people.length} {people.length === 1 ? 'person' : 'people'} • {totalFTE.toFixed(2)} FTE
        </span>
      </div>
      
      <div className="mt-1 pl-2 border-l-2 border-muted space-y-1">
        <ol className="list-decimal pl-5 space-y-1">
          {people.map((person, pIndex) => (
            <li key={`${person.personName}-${pIndex}`} className="flex justify-between items-baseline py-1">
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-foreground hover:underline font-normal"
                onClick={() => onPersonClick && onPersonClick(person.personName)}
              >
                {person.personName}
              </Button>
              <span className="text-xs text-muted-foreground">{person.fte.toFixed(2)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default CircleGroup;
