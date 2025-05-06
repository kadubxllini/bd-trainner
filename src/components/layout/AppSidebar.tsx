import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader as SidebarHeaderBase, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { useMessages } from "@/context/hooks/useMessageContext";
import { useAuth } from "@/context/AuthContext";
import { useSelectors } from "@/hooks/useSelectors";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Company, Message, UrgencyLevel, Folder } from "@/types";
import { CompanyList } from "./sidebar/CompanyList";
import { NewCompanyForm } from "./sidebar/NewCompanyForm";
import { JobPositionsManager } from "./sidebar/managers/JobPositionsManager";
import { SelectorsManager } from "./sidebar/managers/SelectorsManager";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarToolbar } from "./sidebar/SidebarToolbar";
import { CompanyDeleteDialog } from "./sidebar/CompanyDeleteDialog";
import { CompanyEditDialog } from "./sidebar/CompanyEditor/CompanyEditDialog";
import { FolderList } from "./sidebar/FolderList";
import { FolderEditDialog } from "./sidebar/FolderEditDialog";
import { FolderDeleteDialog } from "./sidebar/FolderDeleteDialog";
interface FilterOptions {
  jobPositions: string[];
  urgency: UrgencyLevel | null;
  inProgressState: string | null;
  hasInProgress: boolean;
  selector: string | null;
}
interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string | null;
  initialContent: string;
  onSave: (id: string, content: string) => Promise<void>;
}
const EditDialog = ({
  isOpen,
  onClose,
  messageId,
  initialContent,
  onSave
}: EditDialogProps) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);
  const handleSave = async () => {
    if (!messageId) return;
    try {
      setIsSaving(true);
      await onSave(messageId, content);
      onClose();
      toast.success("Mensagem atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      toast.error("Erro ao atualizar mensagem");
    } finally {
      setIsSaving(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar mensagem</DialogTitle>
          <DialogDescription>
            Edite o conteúdo da mensagem abaixo
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input value={content} onChange={e => setContent(e.target.value)} placeholder="Conteúdo da mensagem" className="w-full" autoFocus />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !content.trim()}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
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
    messages,
    updateMessage,
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveCompanyToFolder,
    toggleFolderExpanded,
    isFolderExpanded
  } = useMessages();
  const {
    selectors,
    addSelector,
    deleteSelector
  } = useSelectors();
  const {
    user,
    signOut
  } = useAuth();
  const {
    setOpenMobile
  } = useSidebar();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInitialContent, setEditInitialContent] = useState("");
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
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyEditDialogOpen, setCompanyEditDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderEditDialogOpen, setFolderEditDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const isMobile = useIsMobile();
  const openEditDialog = (message: Message) => {
    console.log("Opening edit dialog for message:", message);
    if (!message || !message.id) {
      console.error("Invalid message object:", message);
      toast.error("Erro ao abrir diálogo de edição");
      return;
    }
    setEditingMessageId(message.id);
    setEditInitialContent(message.content || "");
    setEditDialogOpen(true);
  };
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingMessageId(null);
    setEditInitialContent("");
  };
  const saveEditedMessage = async (id: string, content: string) => {
    console.log("Saving edited message:", id, content);
    if (!id || !content.trim()) {
      throw new Error("ID da mensagem ou conteúdo inválido");
    }
    try {
      await updateMessage(id, {
        content
      });
    } catch (error) {
      console.error("Error saving edited message:", error);
      throw error;
    }
  };
  useEffect(() => {
    window.editMessage = openEditDialog;
  }, []);
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
      filtered = filtered.filter(company => company.jobPositions.some(position => filterOptions.jobPositions.includes(position)));
    }
    if (filterOptions.urgency) {
      filtered = filtered.filter(company => company.urgency === filterOptions.urgency);
    }
    if (filterOptions.hasInProgress) {
      filtered = filtered.filter(company => company.inProgressStates && company.inProgressStates.length > 0);
    }
    if (filterOptions.inProgressState) {
      filtered = filtered.filter(company => company.inProgress === filterOptions.inProgressState);
    }
    if (filterOptions.selector) {
      filtered = filtered.filter(company => company.selector === filterOptions.selector);
    }
    setFilteredCompanies(filtered);
  }, [searchQuery, companies, filterOptions]);
  const isFilterActive = () => {
    return filterOptions.jobPositions.length > 0 || filterOptions.urgency !== null || filterOptions.hasInProgress || filterOptions.inProgressState !== null || filterOptions.selector !== null;
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
    setEditingCompany(company);
    setCompanyEditDialogOpen(true);
  };
  const closeCompanyEditDialog = () => {
    setCompanyEditDialogOpen(false);
    setEditingCompany(null);
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
  const handleCreateFolder = async (name: string, color: string) => {
    try {
      await createFolder(name, color);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Erro ao criar pasta');
    }
  };
  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder(id);
      toast.success('Pasta removida com sucesso');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Erro ao remover pasta');
    }
  };
  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderEditDialogOpen(true);
  };

  const closeFolderEditDialog = () => {
    setFolderEditDialogOpen(false);
    setEditingFolder(null);
  };

  return <Sidebar>
      <SidebarHeader isMobile={isMobile} />
      
      <SidebarContent>
        {isLoading ? <div className="flex justify-center p-4">Carregando...</div> : <SidebarGroup>
            <SidebarToolbar filterOptions={filterOptions} isFilterActive={isFilterActive} clearAllFilters={clearAllFilters} toggleJobPositionFilter={toggleJobPositionFilter} toggleUrgencyFilter={toggleUrgencyFilter} setInProgressStateFilter={setInProgressStateFilter} setSelectorFilter={setSelectorFilter} toggleHasInProgressFilter={toggleHasInProgressFilter} availableJobPositions={availableJobPositions} availableInProgressStates={availableInProgressStates} selectors={selectors} showFilterMenu={showFilterMenu} toggleFilterMenu={toggleFilterMenu} showSearchInput={showSearchInput} toggleSearch={toggleSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setShowJobPositionsManager={setShowJobPositionsManager} setShowDecorrerManager={setShowDecorrerManager} setShowSelectorsManager={setShowSelectorsManager} user={user} signOut={signOut} />

            <FolderList 
              folders={folders}
              companies={filteredCompanies}
              activeCompany={activeCompany}
              onCompanySelect={handleCompanySelect}
              onEditCompany={handleEditCompany}
              onDeleteCompany={handleDeleteCompany}
              onCreateFolder={handleCreateFolder}
              onEditFolder={handleEditFolder}
              onDeleteFolder={(folder) => setFolderToDelete(folder)}
              onMoveCompanyToFolder={moveCompanyToFolder}
              isFolderExpanded={isFolderExpanded}
              toggleFolderExpanded={toggleFolderExpanded}
            />

            <NewCompanyForm onCreateCompany={handleCreateCompany} />
          </SidebarGroup>}
      </SidebarContent>
      
      <SidebarFooter className="p-4 text-xs text-center text-muted-foreground">
        {user?.email && <div className="mb-2 text-sm font-medium">{user.email}</div>}
        Versão 1.0
      </SidebarFooter>

      <EditDialog isOpen={editDialogOpen} onClose={closeEditDialog} messageId={editingMessageId} initialContent={editInitialContent} onSave={saveEditedMessage} />

      <Dialog open={showJobPositionsManager} onOpenChange={setShowJobPositionsManager}>
        <JobPositionsManager availableJobPositions={availableJobPositions} onAddJobPosition={handleAddGlobalJobPosition} onDeleteJobPosition={handleDeleteJobPosition} showJobPositionsManager={showJobPositionsManager} setShowJobPositionsManager={setShowJobPositionsManager} />
      </Dialog>

      <Dialog open={showDecorrerManager} onOpenChange={setShowDecorrerManager}>
        <DialogContent className="sm:max-w-md bg-navy">
          <DialogHeader>
            <DialogTitle>Gerenciar Estados Decorrer</DialogTitle>
            <DialogDescription>
              Adicione ou remova estados de "Decorrer" disponíveis para todas as empresas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input placeholder="Novo estado global" className="flex-1" value="" onChange={() => {}} onKeyDown={e => {
              if (e.key === 'Enter') {
                // Handled differently now
              }
            }} />
              <Button onClick={() => {}}>Adicionar</Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Estados disponíveis</h3>
              <div className="h-[200px] overflow-y-auto pr-3">
                {availableInProgressStates.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum estado cadastrado</p> : <div className="space-y-2">
                    {availableInProgressStates.map(state => <div key={state} className="flex justify-between items-center p-2 border rounded-md bg-navy-light">
                        <span>{state}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGlobalInProgressState(state)} className="h-7 w-7 hover:text-destructive">
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>)}
                  </div>}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowDecorrerManager(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSelectorsManager} onOpenChange={setShowSelectorsManager}>
        <SelectorsManager selectors={selectors} onAddSelector={handleAddGlobalSelector} onDeleteSelector={handleDeleteSelector} showSelectorsManager={showSelectorsManager} setShowSelectorsManager={setShowSelectorsManager} />
      </Dialog>

      <CompanyDeleteDialog companyToDelete={companyToDelete} setCompanyToDelete={setCompanyToDelete} onConfirmDelete={confirmDeleteCompany} />
      
      <CompanyEditDialog company={editingCompany} isOpen={companyEditDialogOpen} onClose={closeCompanyEditDialog} />
      
      <FolderEditDialog 
        folder={editingFolder}
        isOpen={folderEditDialogOpen}
        onClose={closeFolderEditDialog}
        onUpdate={updateFolder}
      />
      
      <FolderDeleteDialog 
        folderToDelete={folderToDelete}
        setFolderToDelete={setFolderToDelete}
        onConfirmDelete={handleDeleteFolder}
      />
    </Sidebar>;
}
