
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SidebarSearchProps {
  showSearchInput: boolean;
  toggleSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SidebarSearch = ({
  showSearchInput,
  toggleSearch,
  searchQuery,
  setSearchQuery
}: SidebarSearchProps) => {
  return (
    <>
      <Button variant="ghost" size="sm" onClick={toggleSearch} className="h-6 px-1.5">
        <Search className="h-3.5 w-3.5" />
      </Button>
      
      {showSearchInput && (
        <div className="px-4 pb-2">
          <Input 
            placeholder="Pesquisar empresas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      )}
    </>
  );
};
