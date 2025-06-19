'use client';

import * as React from 'react';

import { Search, User, UserPlus } from 'lucide-react';

import { AthleteEntity } from '@/lib/db/entities/types';
import { Button } from '@/components/atoms/button/button';
import { Input } from '@/components/atoms/input/input';
import { cn } from '@/lib/utils/ui';
import { useAthleteSearch } from '@/hooks/useAthlete';

interface SearchResultsProps {
  onSelect?: (athlete: AthleteEntity) => void;
  onRegisterNew?: () => void;
  selectedAthleteId?: string | null;
  minimumSearchLength?: number;
  showRegisterButton?: boolean;
  label?: string;
  placeholder?: string;
  noResultsMessage?: string;
  className?: string;
}

/**
 * A specialized component for searching and selecting athletes
 */
export const SearchResults: React.FC<SearchResultsProps> = ({
  onSelect,
  onRegisterNew,
  selectedAthleteId = null,
  minimumSearchLength = 2,
  showRegisterButton = true,
  label = 'Search Athletes',
  placeholder = 'Search by name...',
  noResultsMessage = 'No athletes found',
  className,
}) => {
  // State for the search input
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Search for athletes when the query is long enough
  const { data: searchResults, isLoading } = useAthleteSearch(searchQuery.length >= minimumSearchLength ? searchQuery : '');
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle athlete selection
  const handleAthleteSelect = (athlete: AthleteEntity) => {
    if (onSelect) {
      onSelect(athlete);
    }
  };
  
  // Handle "Register New" button click
  const handleRegisterNew = () => {
    if (onRegisterNew) {
      onRegisterNew();
    }
  };
  
  // Whether to show search results
  const showResults = searchQuery.length >= minimumSearchLength;
  
  // Whether to show the "No results" message
  const showNoResults = showResults && !isLoading && (!searchResults || searchResults.length === 0);
  
  return (
    <div className={cn('search-results space-y-3', className)}>
      {/* Search Input */}
      <div>
        <Input
          label={label}
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={placeholder}
          leftIcon={<Search className="h-4 w-4" />}
        />
        
        {searchQuery.length > 0 && searchQuery.length < minimumSearchLength && (
          <p className="mt-1 text-xs text-gray-500">
            Enter at least {minimumSearchLength} characters to search
          </p>
        )}
      </div>
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-4 text-center">
          <div className="inline-block animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2 text-sm text-gray-500">Searching...</span>
        </div>
      )}
      
      {/* Search Results */}
      {showResults && !isLoading && searchResults && searchResults.length > 0 && (
        <div className="border-1 rounded-md overflow-hidden divide-y">
          {searchResults.map((athlete) => (
            <div
              key={athlete.id}
              className={cn(
                'flex items-center p-3 hover:bg-gray-50 cursor-pointer',
                selectedAthleteId === athlete.id && 'bg-primary-light'
              )}
              onClick={() => handleAthleteSelect(athlete)}
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {athlete.fn} {athlete.mi ? athlete.mi + '. ' : ''}{athlete.ln}
                </div>
                {athlete.e && <div className="text-sm text-gray-500">{athlete.e}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No Results Message */}
      {showNoResults && (
        <div className="py-4 text-center">
          <p className="text-gray-500 mb-4">{noResultsMessage}</p>
          
          {showRegisterButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegisterNew}
              className="flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register New Athlete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};