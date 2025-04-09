
import { useState } from "react";
import { 
  Filter, 
  X, 
  BriefcaseBusiness, 
  AlertCircle, 
  Clock, 
  UserCog,
  Check
} from "lucide-react";
import {
  Button
} from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UrgencyLevel } from "@/types";

interface FilterMenuProps {
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
}

export const FilterMenu = ({
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
  toggleFilterMenu
}: FilterMenuProps) => {
  
  const getUrgencyColor = (urgency?: UrgencyLevel) => {
    switch(urgency) {
      case 'Baixa': return 'bg-green-100 text-green-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Alta': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={toggleFilterMenu} className="h-6 px-1.5 relative">
        <Filter className="h-3.5 w-3.5" />
        {isFilterActive() && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        )}
      </Button>
      
      {showFilterMenu && (
        <div className="px-4 pb-2">
          <div className="space-y-2 p-2 bg-muted/50 rounded-md">
            <div className="flex justify-between items-center">
              <div className="text-xs font-medium">Filtros aplicados:</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); clearAllFilters(); }} 
                className="text-xs h-6"
                disabled={!isFilterActive()}
              >
                Limpar
              </Button>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {filterOptions.jobPositions.map(job => (
                <Badge 
                  key={`job-${job}`} 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-primary/20 text-xs"
                  onClick={(e) => toggleJobPositionFilter(job, e)}
                >
                  <BriefcaseBusiness className="h-3 w-3" />
                  {job}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              
              {filterOptions.urgency && (
                <Badge 
                  variant="secondary" 
                  className={`flex items-center gap-1 text-xs ${getUrgencyColor(filterOptions.urgency)}`}
                  onClick={(e) => toggleUrgencyFilter(filterOptions.urgency!, e)}
                >
                  <AlertCircle className="h-3 w-3" />
                  {filterOptions.urgency}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              
              {filterOptions.hasInProgress && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs"
                  onClick={(e) => toggleHasInProgressFilter(e)}
                >
                  <Clock className="h-3 w-3" />
                  Com estado
                  <X className="h-3 w-3" />
                </Badge>
              )}
              
              {filterOptions.inProgressState && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs"
                  onClick={(e) => setInProgressStateFilter(null, e)}
                >
                  <Clock className="h-3 w-3" />
                  {filterOptions.inProgressState}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              
              {filterOptions.selector && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-purple-100 text-purple-800 text-xs"
                  onClick={(e) => setSelectorFilter(null, e)}
                >
                  <UserCog className="h-3 w-3" />
                  {filterOptions.selector}
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
            
            <div className="text-xs font-medium mt-2">Adicionar filtros:</div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-7 flex items-center gap-1 w-full justify-start" 
                >
                  <BriefcaseBusiness className="h-3 w-3" />
                  Vagas
                  {filterOptions.jobPositions.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {filterOptions.jobPositions.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="space-y-2">
                  <p className="text-xs font-medium">Selecione as vagas:</p>
                  <ScrollArea className="h-[200px] pr-3">
                    <div className="space-y-2">
                      {availableJobPositions.map(job => (
                        <div key={job} className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            id={`job-${job}`}
                            checked={filterOptions.jobPositions.includes(job)}
                            onCheckedChange={() => toggleJobPositionFilter(job)}
                          />
                          <label htmlFor={`job-${job}`} className="text-sm cursor-pointer">{job}</label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-7 flex items-center gap-1 w-full justify-start" 
                >
                  <AlertCircle className="h-3 w-3" />
                  Urgência
                  {filterOptions.urgency && (
                    <Badge variant="secondary" className={`ml-auto ${getUrgencyColor(filterOptions.urgency)}`}>
                      {filterOptions.urgency}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="space-y-2">
                  <p className="text-xs font-medium">Selecione a urgência:</p>
                  <div className="flex flex-col space-y-1">
                    <Button 
                      size="sm" 
                      variant={filterOptions.urgency === 'Baixa' ? "default" : "outline"} 
                      className="text-xs h-7 flex items-center gap-1 justify-start" 
                      onClick={(e) => { e.stopPropagation(); toggleUrgencyFilter('Baixa'); }}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Baixa
                      {filterOptions.urgency === 'Baixa' && <Check className="ml-auto h-3 w-3" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant={filterOptions.urgency === 'Média' ? "default" : "outline"} 
                      className="text-xs h-7 flex items-center gap-1 justify-start" 
                      onClick={(e) => { e.stopPropagation(); toggleUrgencyFilter('Média'); }}
                    >
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Média
                      {filterOptions.urgency === 'Média' && <Check className="ml-auto h-3 w-3" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant={filterOptions.urgency === 'Alta' ? "default" : "outline"} 
                      className="text-xs h-7 flex items-center gap-1 justify-start" 
                      onClick={(e) => { e.stopPropagation(); toggleUrgencyFilter('Alta'); }}
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Alta
                      {filterOptions.urgency === 'Alta' && <Check className="ml-auto h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-7 flex items-center gap-1 w-full justify-start" 
                >
                  <Clock className="h-3 w-3" />
                  Decorrer
                  {(filterOptions.hasInProgress || filterOptions.inProgressState) && (
                    <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                      {filterOptions.inProgressState || "Ativo"}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      id="has-in-progress"
                      checked={filterOptions.hasInProgress}
                      onCheckedChange={() => toggleHasInProgressFilter()}
                    />
                    <label htmlFor="has-in-progress" className="text-sm cursor-pointer">
                      Qualquer estado
                    </label>
                  </div>
                  
                  <p className="text-xs font-medium mt-2">Ou selecione um estado específico:</p>
                  <ScrollArea className="h-[200px] pr-3">
                    <div className="space-y-1">
                      {availableInProgressStates.map(state => (
                        <Button 
                          key={state}
                          size="sm" 
                          variant={filterOptions.inProgressState === state ? "default" : "outline"} 
                          className="text-xs h-7 flex items-center gap-1 justify-start w-full" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setInProgressStateFilter(
                              filterOptions.inProgressState === state ? null : state
                            ); 
                          }}
                        >
                          <Clock className="h-3 w-3" />
                          {state}
                          {filterOptions.inProgressState === state && (
                            <Check className="ml-auto h-3 w-3" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-7 flex items-center gap-1 w-full justify-start" 
                >
                  <UserCog className="h-3 w-3" />
                  Selecionadora
                  {filterOptions.selector && (
                    <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-800">
                      {filterOptions.selector}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="space-y-2">
                  <p className="text-xs font-medium">Selecione a selecionadora:</p>
                  <ScrollArea className="h-[200px] pr-3">
                    <div className="space-y-1">
                      {selectors.map(selector => (
                        <Button 
                          key={selector}
                          size="sm" 
                          variant={filterOptions.selector === selector ? "default" : "outline"} 
                          className="text-xs h-7 flex items-center gap-1 justify-start w-full" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectorFilter(
                              filterOptions.selector === selector ? null : selector
                            ); 
                          }}
                        >
                          <UserCog className="h-3 w-3" />
                          {selector}
                          {filterOptions.selector === selector && (
                            <Check className="ml-auto h-3 w-3" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </>
  );
};
