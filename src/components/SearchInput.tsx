
import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command } from '@/components/ui/command';
import { PeopleData, HierarchyNode } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SearchResults from '@/components/SearchResults';
import { performSearch, SearchResult } from '@/utils/searchUtils';

interface SearchInputProps {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  onCircleClick: (circleName: string) => void;
  onRoleClick: (roleName: string) => void;
  onPersonClick: (personName: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  organizationData,
  peopleData,
  onCircleClick,
  onRoleClick,
  onPersonClick
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Use useEffect to update search results whenever the search term changes
  React.useEffect(() => {
    const results = performSearch(searchTerm, organizationData, peopleData);
    setSearchResults(results);
    
    // Automatically open popover when we have results
    if (searchTerm.trim().length >= 4) {
      setIsOpen(results.length > 0);
    } else {
      setIsOpen(false);
    }
    
    // Log for debugging
    console.log('Search term:', searchTerm, 'Results:', results.length);
  }, [searchTerm, organizationData, peopleData]);

  const handleItemClick = (result: SearchResult) => {
    setIsOpen(false);
    setSearchTerm('');
    
    if (result.type === 'circle') {
      onCircleClick(result.name);
    } else if (result.type === 'role') {
      onRoleClick(result.name);
    } else if (result.type === 'person') {
      onPersonClick(result.name);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    // Focus back on input after clearing
    inputRef.current?.focus();
  };

  // Determine if we should show the suggestions popover
  const shouldShowSuggestions = searchTerm.trim().length >= 4 && searchResults.length > 0;
  
  const noDataAvailable = !organizationData || !peopleData.length;

  return (
    <div className="relative max-w-md w-full mx-auto" ref={searchRef}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search circles, roles, people... (type at least 4 characters)"
              className="pl-9 pr-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              onFocus={() => {
                if (shouldShowSuggestions) {
                  setIsOpen(true);
                }
              }}
              disabled={noDataAvailable}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={handleClearSearch}
                type="button"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)] max-h-80 overflow-auto"
          align="start"
        >
          <Command>
            <SearchResults 
              searchTerm={searchTerm}
              searchResults={searchResults}
              onItemClick={handleItemClick}
            />
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchInput;
