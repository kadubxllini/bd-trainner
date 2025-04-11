
import { 
  Search, 
  Filter, 
  BriefcaseBusiness, 
  Clock, 
  UserCog, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterMenu } from "./FilterMenu";
import { SidebarSearch } from "./SidebarSearch";
import { UrgencyLevel } from "@/types";

interface SidebarToolbarProps {
  filterOptions: {
    jobPositions: string[];
    urgency: UrgencyLevel | null;
    inProgressState: string | null;
    hasInProgress: boolean;
    selector: string | null;
  };
  isFilterActive: () => boolean;
  clearAllFilters: () => void;
  toggleJobPositionFilter: (position: string, event?: React.MouseEvent) => void;
  toggleUrgencyFilter: (urgency: UrgencyLevel, event?: React.MouseEvent) => void;
  setInProgressStateFilter: (state: string | null, event?: React.MouseEvent) => void;
  setSelectorFilter: (selector: string | null, event?: React.MouseEvent) => void;
  toggleHasInProgressFilter: (event?: React.MouseEvent) => void;
  availableJobPositions: string[];
  availableInProgressStates: string[];
  selectors: string[];
  showFilterMenu: boolean;
  toggleFilterMenu: () => void;
  showSearchInput: boolean;
  toggleSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowJobPositionsManager: (show: boolean) => void;
  setShowDecorrerManager: (show: boolean) => void;
  setShowSelectorsManager: (show: boolean) => void;
  user: any;
  signOut: () => void;
}

export const SidebarToolbar = ({
  filterOptions,
  isFilterActive,
  clearAllFilters,
  toggleJobPositionFilter,
  toggleUrgencyFilter,
  setInProgressStateFilter,
  setSelectorFilter,
  toggleHasInProgressFilter,
  availableJobPositions,
  availableInProgressStates,
  selectors,
  showFilterMenu,
  toggleFilterMenu,
  showSearchInput,
  toggleSearch,
  searchQuery,
  setSearchQuery,
  setShowJobPositionsManager,
  setShowDecorrerManager,
  setShowSelectorsManager,
  user,
  signOut
}: SidebarToolbarProps) => {
  return (
    <div className="px-3 py-2 flex justify-between items-center">
      <h2 className="text-xs font-medium text-muted-foreground">Empresas</h2>
      <div className="flex gap-1">
        <FilterMenu 
          filterOptions={filterOptions}
          isFilterActive={isFilterActive}
          clearAllFilters={clearAllFilters}
          toggleJobPositionFilter={toggleJobPositionFilter}
          toggleUrgencyFilter={toggleUrgencyFilter}
          setInProgressStateFilter={setInProgressStateFilter}
          setSelectorFilter={setSelectorFilter}
          toggleHasInProgressFilter={toggleHasInProgressFilter}
          availableJobPositions={availableJobPositions}
          availableInProgressStates={availableInProgressStates}
          selectors={selectors}
          showFilterMenu={showFilterMenu}
          toggleFilterMenu={toggleFilterMenu}
        />
        
        <SidebarSearch
          showSearchInput={showSearchInput}
          toggleSearch={toggleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowJobPositionsManager(true)} 
          className="h-6 px-1.5"
        >
          <BriefcaseBusiness className="h-3.5 w-3.5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDecorrerManager(true)} 
          className="h-6 px-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowSelectorsManager(true)} 
          className="h-6 px-1.5"
        >
          <UserCog className="h-3.5 w-3.5" />
        </Button>
        
        {user && (
          <Button variant="ghost" size="sm" onClick={signOut} className="h-6 px-1.5">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
