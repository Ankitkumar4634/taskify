import { useState, useEffect, useRef } from 'react';
import { Search, Loader, AlertCircle, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function ResponsiveSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [searchType, setSearchType] = useState('Tasks');
  const inputRef = useRef<HTMLInputElement>(null);

  const debounceDelay = 300;
  const debounceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      const fetchResults = async () => {
        if (searchQuery.trim() === '') {
          setSearchResults([]);
          setNoResults(false);
          return;
        }

        setLoading(true);
        try {
          const res = await fetch(
            `/api/search?q=${searchQuery}&type=${searchType.toLowerCase()}`
          );
          const data = await res.json();
          setSearchResults(data);
          setNoResults(data.length === 0);
        } catch (error) {
          console.error('Error fetching search results:', error);
        } finally {
          setLoading(false);
        }
      };

      if (searchQuery) {
        fetchResults();
      } else {
        setSearchResults([]);
        setNoResults(false);
      }
    }, debounceDelay);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, searchType]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleResultClick = (result: any) => {
    window.location.href = `/dashboard/contacts?${result.id}`;
  };

  return (
    <div className="relative flex w-full justify-end">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="outline"
            size="icon"
            className="relative h-8 w-8 rounded-full"
          >
            <Search className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all " />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="z-[9999] w-full border border-gray-300 shadow-lg">
          <div className="flex items-center space-x-2 p-0 px-2">
            <Input
              type="search"
              placeholder={`Search ${searchType.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full "
              ref={inputRef}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex h-8 items-center">
                  {searchType}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="z-[9999] w-32">
                <DropdownMenuItem onClick={() => setSearchType('Contacts')}>
                  Contacts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchType('Tasks')}>
                  Tasks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-2 divide-y divide-gray-300">
            {loading ? (
              <div className="flex items-center justify-center py-2">
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : noResults ? (
              <div className="flex items-center justify-center py-2">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>No results found</span>
              </div>
            ) : (
              searchResults.map((result: any, idx) => (
                <DropdownMenuItem
                  key={idx}
                  className="rounded-none border-none py-2"
                  onClick={() => handleResultClick(result)}
                >
                  {result.fullName || result.title}
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
