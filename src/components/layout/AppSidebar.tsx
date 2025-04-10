import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarHeader as SidebarHeaderBase,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useMessages } from "@/context/hooks/useMessageContext";
import { useAuth } from "@/context/AuthContext";
import { useSelectors } from "@/hooks/useSelectors";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Company, UrgencyLevel } from "@/types";
import { CompanyList } from "./sidebar/CompanyList";
import { NewCompanyForm } from "./sidebar/NewCompanyForm";
import { JobPositionsManager } from "./sidebar/managers/JobPositionsManager";
import { SelectorsManager } from "./sidebar/managers/SelectorsManager";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarToolbar } from "./sidebar/SidebarToolbar";
import { CompanyDeleteDialog } from "./sidebar/CompanyDeleteDialog";
import { DecorrerTab } from "./sidebar/CompanyEditor/DecorrerTab";

interface FilterOptions {
  jobPositions: string[];
  urgency: UrgencyLevel | null;
  inProgressState: string | null;
  hasInProgress: boolean;
  selector: string | null;
}

export function AppSidebar() {
  const { 
    companies, 
    activeCompany,
    createCompany,
    selectCompany,
    updateCompany,
    deleteCompany,
    isLoading,
    availableJobPositions,
    addJobPosition,
    deleteJobPosition,
    availableInProgressStates,
    addInProgressState,
    deleteInProgressState,
  } = useMessages();
  
  const { selectors, addSelector, deleteSelector } = useSelectors();
  const { user, signOut } = useAuth();
  const { setOpenMobile } = useSidebar();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    jobPositions: [],
    urgency: null,
    inProgressState: null,
    hasInProgress: false,
    selector: null
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [showJobPositionsManager, setShowJobPositionsManager] = useState(false);
  const [showDecorrerManager, setShowDecorrerManager] = useState(false);
  const [showSelectorsManager, setShowSelectorsManager] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    let filtered = [...companies];
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(company => {
        if (company.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return true;
        }
        
        if (company.emails.some(e => e.email.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return true;
        }
        
        if (company.phones.some(p => p.phone.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return true;
        }
        
        if (company.contacts.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return true;
        }
        
        return false;
      });
    }
    
    if (filterOptions.jobPositions.length > 0) {
      filtered = filtered.filter(company => 
        company.jobPositions.some(position => 
          filterOptions.jobPositions.includes(position)
        )
      );
    }
    
    if (filterOptions.urgency) {
      filtered = filtered.filter(company => 
        company.urgency === filterOptions.urgency
      );
    }
    
    if (filterOptions.hasInProgress) {
      filtered = filtered.filter(company => 
        (company.inProgressStates && company.inProgressStates.length > 0)
      );
    }
    
    if (filterOptions.inProgressState) {
      filtered = filtered.filter(company => 
        company.inProgress === filterOptions.inProgressState
      );
    }
    
    if (filterOptions.selector) {
      filtered = filtered.filter(company => 
        company.selector === filterOptions.selector
      );
    }
    
    setFilteredCompanies(filtered);
  }, [searchQuery, companies, filterOptions]);

  const isFilterActive = () => {
    return (
      filterOptions.jobPositions.length > 0 || 
      filterOptions.urgency !== null ||
      filterOptions.hasInProgress ||
      filterOptions.inProgressState !== null ||
      filterOptions.selector !== null
    );
  };

  const clearAllFilters = () => {
    setFilterOptions({
      jobPositions: [],
      urgency: null,
      inProgressState: null,
      hasInProgress: false,
      selector: null
    });
  };

  const toggleJobPositionFilter = (position: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setFilterOptions(prev => {
      if (prev.jobPositions.includes(position)) {
        return {
          ...prev,
          jobPositions: prev.jobPositions.filter(p => p !== position)
        };
      } else {
        return {
          ...prev,
          jobPositions: [...prev.jobPositions, position]
        };
      }
    });
  };

  const toggleUrgencyFilter = (urgency: any, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setFilterOptions(prev => ({
      ...prev,
      urgency: prev.urgency === urgency ? null : urgency
    }));
  };

  const setInProgressStateFilter = (state: string | null, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setFilterOptions(prev => ({
      ...prev,
      inProgressState: state
    }));
  };

  const setSelectorFilter = (selector: string | null, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setFilterOptions(prev => ({
      ...prev,
      selector: selector
    }));
  };

  const toggleHasInProgressFilter = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setFilterOptions(prev => ({
      ...prev,
      hasInProgress: !prev.hasInProgress
    }));
  };

  const handleCreateCompany = (name: string) => {
    if (name.trim()) {
      createCompany(name);
    }
  };

  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company);
  };

  const confirmDeleteCompany = () => {
    if (companyToDelete) {
      deleteCompany(companyToDelete.id);
      setCompanyToDelete(null);
    }
  };

  const handleCompanySelect = (companyId: string) => {
    selectCompany(companyId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleEditCompany = (company: Company) => {
    console.log("Edit company:", company);
  };  

  const toggleSearch = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleAddGlobalJobPosition = (jobPosition: string) => {
    if (jobPosition.trim()) {
      addJobPosition(jobPosition);
      toast.success(`Vaga "${jobPosition}" adicionada`);
    }
  };

  const handleDeleteJobPosition = (jobPosition: string) => {
    deleteJobPosition(jobPosition);
    toast.success(`Vaga "${jobPosition}" removida`);
  };

  const handleAddGlobalSelector = (selector: string) => {
    if (selector.trim()) {
      addSelector(selector);
      toast.success(`Selecionadora "${selector}" adicionada`);
    }
  };

  const handleDeleteSelector = (selector: string) => {
    deleteSelector(selector);
    toast.success(`Selecionadora "${selector}" removida`);
  };

  const handleAddGlobalInProgressState = async (state: string) => {
    if (state.trim()) {
      try {
        await addInProgressState(state);
        toast.success(`Estado "${state}" adicionado`);
      } catch (error) {
        console.error('Error adding in-progress state:', error);
        toast.error('Erro ao adicionar estado');
      }
    }
  };

  const handleDeleteGlobalInProgressState = async (state: string) => {
    try {
      await deleteInProgressState(state);
      toast.success(`Estado "${state}" removido`);
    } catch (error) {
      console.error('Error deleting in-progress state:', error);
      toast.error('Erro ao remover estado');
    }
  };

  return (
    <Sidebar>
      <SidebarHeaderBase className="py-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-center flex-1">Mensageiro</h1>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setOpenMobile(false)}
          >
            <SidebarHeader isMobile={isMobile} />
          </Button>
        )}
      </SidebarHeaderBase>
      
      <SidebarContent>
        {isLoading ? (
          <div className="flex justify-center p-4">Carregando...</div>
        ) : (
          <SidebarGroup>
            <SidebarToolbar 
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
              showSearchInput={showSearchInput}
              toggleSearch={toggleSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setShowJobPositionsManager={setShowJobPositionsManager}
              setShowDecorrerManager={setShowDecorrerManager}
              setShowSelectorsManager={setShowSelectorsManager}
              user={user}
              signOut={signOut}
            />

            <CompanyList
              companies={filteredCompanies}
              activeCompany={activeCompany}
              onCompanySelect={handleCompanySelect}
              onEditCompany={handleEditCompany}
              onDeleteCompany={handleDeleteCompany}
            />

            <NewCompanyForm onCreateCompany={handleCreateCompany} />
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4 text-xs text-center text-muted-foreground">
        {user?.email && (
          <div className="mb-2 text-sm font-medium">{user.email}</div>
        )}
        Versão 1.0
      </SidebarFooter>

      <Dialog open={showJobPositionsManager} onOpenChange={setShowJobPositionsManager}>
        <JobPositionsManager 
          availableJobPositions={availableJobPositions}
          onAddJobPosition={handleAddGlobalJobPosition}
          onDeleteJobPosition={handleDeleteJobPosition}
          showJobPositionsManager={showJobPositionsManager}
          setShowJobPositionsManager={setShowJobPositionsManager}
        />
      </Dialog>

      <Dialog open={showDecorrerManager} onOpenChange={setShowDecorrerManager}>
        <DialogContent className="sm:max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>Gerenciar Estados Decorrer</DialogTitle>
            <DialogDescription>
              Adicione ou remova estados de "Decorrer" disponíveis para todas as empresas.
            </DialogDescription>
          </DialogHeader>
          
          <DecorrerTab
            company={activeCompany || {} as Company} 
            availableInProgressStates={availableInProgressStates}
            onAddGlobalInProgressState={handleAddGlobalInProgressState}
            onDeleteGlobalInProgressState={handleDeleteGlobalInProgressState}
          />
          
          <DialogFooter>
            <Button onClick={() => setShowDecorrerManager(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSelectorsManager} onOpenChange={setShowSelectorsManager}>
        <SelectorsManager 
          selectors={selectors}
          onAddSelector={handleAddGlobalSelector}
          onDeleteSelector={handleDeleteSelector}
          showSelectorsManager={showSelectorsManager}
          setShowSelectorsManager={setShowSelectorsManager}
        />
      </Dialog>

      <CompanyDeleteDialog 
        companyToDelete={companyToDelete}
        setCompanyToDelete={setCompanyToDelete}
        onConfirmDelete={confirmDeleteCompany}
      />
    </Sidebar>
  );
}
