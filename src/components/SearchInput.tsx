
import * as React from 'react';
import { Search, X, Users, CircleDot, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { PeopleData, HierarchyNode } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SearchInputProps {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  onCircleClick: (circleName: string) => void;
  onRoleClick: (roleName: string) => void;
  onPersonClick: (personName: string) => void;
}

interface SearchResult {
  type: 'circle' | 'role' | 'person';
  name: string;
  id: string; // Unique identifier for deduplication
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

  React.useEffect(() => {
    // Only search if we have a search term with at least 4 characters
    if (!searchTerm.trim() || searchTerm.trim().length < 4) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    // Sets to track unique entries
    const uniqueCircles = new Set<string>();
    const uniqueRoles = new Set<string>();
    const uniquePeople = new Set<string>();

    // Search circles
    if (organizationData?.children) {
      organizationData.children.forEach(circle => {
        if (circle.name.toLowerCase().includes(normalizedSearchTerm) && !uniqueCircles.has(circle.name)) {
          uniqueCircles.add(circle.name);
          results.push({ 
            type: 'circle', 
            name: circle.name, 
            id: `circle-${circle.name}` 
          });
        }

        // Search roles within circles
        if (circle.children) {
          circle.children.forEach(role => {
            if (role.name.toLowerCase().includes(normalizedSearchTerm) && !uniqueRoles.has(role.name)) {
              uniqueRoles.add(role.name);
              results.push({ 
                type: 'role', 
                name: role.name, 
                id: `role-${role.name}` 
              });
            }
          });
        }
      });
    }

    // Search people
    if (peopleData?.length) {
      peopleData.forEach(person => {
        if (
          person.personName.toLowerCase().includes(normalizedSearchTerm) &&
          !uniquePeople.has(person.personName)
        ) {
          uniquePeople.add(person.personName);
          results.push({ 
            type: 'person', 
            name: person.personName, 
            id: `person-${person.personName}` 
          });
        }
      });
    }

    setSearchResults(results);
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

  // Determine if we should show the suggestions popover
  const shouldShowSuggestions = searchTerm.trim().length >= 4 && searchResults.length > 0;
  
  const noDataAvailable = !organizationData || !peopleData.length;

  return (
    <div className="relative max-w-md w-full mx-auto" ref={searchRef}>
      <Popover open={isOpen && shouldShowSuggestions} onOpenChange={setIsOpen}>
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
                if (e.target.value.trim().length >= 4) setIsOpen(true);
                else setIsOpen(false);
              }}
              onFocus={() => {
                if (searchTerm.trim().length >= 4 && searchResults.length > 0) setIsOpen(true);
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
          className="p-0 w-[var(--radix-popover-trigger-width)] max-h-80"
          align="start"
          onInteractOutside={(e) => {
            // Prevent closing when interacting with popover content
            e.preventDefault();
          }}
        >
          <Command>
            <CommandList>
              {searchTerm.trim().length < 4 ? (
                <CommandEmpty>Type at least 4 characters to search</CommandEmpty>
              ) : searchResults.length === 0 ? (
                <CommandEmpty>No results found</CommandEmpty>
              ) : (
                <CommandGroup heading="Search Results">
                  {searchResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleItemClick(result)}
                      className="flex items-center cursor-pointer"
                    >
                      {getIconForType(result.type)}
                      <span>{result.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground capitalize">
                        {result.type}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchInput;
