
import * as React from 'react';
import { CircleDot, Briefcase, Users } from 'lucide-react';
import { CommandItem } from '@/components/ui/command';
import { SearchResult } from '@/utils/searchUtils';

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, onSelect }) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'circle':
        return <CircleDot className="mr-2 h-4 w-4 text-muted-foreground" />;
      case 'role':
        return <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />;
      case 'person':
        return <Users className="mr-2 h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <CommandItem
      key={result.id}
      onSelect={() => onSelect(result)}
      className="flex items-center cursor-pointer"
    >
      {getIconForType(result.type)}
      <span>{result.name}</span>
      <span className="ml-auto text-xs text-muted-foreground capitalize">
        {result.type}
      </span>
    </CommandItem>
  );
};

export default SearchResultItem;
