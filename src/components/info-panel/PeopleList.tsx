
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PeopleGroupProps } from './types';

const PeopleList: React.FC<PeopleGroupProps> = ({ people, onPersonClick }) => {
  return (
    <div className="mt-2">
      <ol className="list-decimal pl-5 space-y-1">
        {people.map((person, index) => (
          <li key={`${person.personName}-${index}`} className="flex justify-between items-baseline py-1">
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
  );
};

export default PeopleList;
