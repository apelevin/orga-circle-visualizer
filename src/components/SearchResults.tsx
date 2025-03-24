
import * as React from 'react';
import { CommandEmpty, CommandGroup, CommandList } from '@/components/ui/command';
import SearchResultItem from '@/components/SearchResultItem';
import { SearchResult } from '@/utils/searchUtils';

interface SearchResultsProps {
  searchTerm: string;
  searchResults: SearchResult[];
  onItemClick: (result: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchTerm,
  searchResults,
  onItemClick
}) => {
  if (searchTerm.trim().length < 4) {
    return (
      <CommandList>
        <CommandEmpty>Type at least 4 characters to search</CommandEmpty>
      </CommandList>
    );
  }
  
  if (searchResults.length === 0) {
    return (
      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>
      </CommandList>
    );
  }
  
  return (
    <CommandList>
      <CommandGroup heading="Search Results">
        {searchResults.map((result) => (
          <SearchResultItem
            key={result.id}
            result={result}
            onSelect={onItemClick}
          />
        ))}
      </CommandGroup>
    </CommandList>
  );
};

export default SearchResults;
