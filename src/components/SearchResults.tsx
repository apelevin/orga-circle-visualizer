
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
  return (
    <CommandList>
      {searchTerm.trim().length < 4 ? (
        <CommandEmpty>Type at least 4 characters to search</CommandEmpty>
      ) : searchResults.length === 0 ? (
        <CommandEmpty>No results found</CommandEmpty>
      ) : (
        <CommandGroup heading="Search Results">
          {searchResults.map((result) => (
            <SearchResultItem
              key={result.id}
              result={result}
              onSelect={onItemClick}
            />
          ))}
        </CommandGroup>
      )}
    </CommandList>
  );
};

export default SearchResults;
