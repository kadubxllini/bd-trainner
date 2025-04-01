import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useMessages } from "@/context/MessageContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Building, 
  Plus, 
  Pencil, 
  Trash, 
  LogOut, 
  X, 
  Search, 
  Mail, 
  Phone, 
  User, 
  Filter,
  AlertCircle,
  Clock,
  BriefcaseBusiness,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Company, CompanyEmail, CompanyPhone, CompanyContact, UrgencyLevel, InProgressState } from "@/types";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CompanyList } from "./sidebar/CompanyList";
import { InformationTab } from "./sidebar/CompanyEditor/InformationTab";
import { EmailsTab } from "./sidebar/CompanyEditor/EmailsTab";
import { DecorrerTab } from "./sidebar/CompanyEditor/DecorrerTab";

export function AppSidebar() {
  const { 
    companies, 
    activeCompany,
    createCompany,
    selectCompany,
    updateCompany,
    deleteCompany,
    addCompanyEmail,
    deleteCompanyEmail,
    addCompanyPhone,
    deleteCompanyPhone,
    addCompanyContact,
    deleteCompanyContact,
    isLoading,
    availableJobPositions,
    addJobPosition,
    deleteJobPosition,
    availableInProgressStates,
    addInProgressState,
    deleteInProgressState,
  } = useMessages();
  
  const { user, signOut } = useAuth();
  const { setOpenMobile } = useSidebar();
  
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newContact, setNewContact] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'job' | 'urgency' | 'inProgress'>('all');
  const [jobPositionFilter, setJobPositionFilter] = useState<string | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | null>(null);
  const [inProgressFilter, setInProgressFilter] = useState<boolean>(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [customJobPosition, setCustomJobPosition] = useState('');
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [newGlobalJobPosition, setNewGlobalJobPosition] = useState('');
  const [newGlobalInProgressState, setNewGlobalInProgressState] = useState('');
  const [showJobPositionsManager, setShowJobPositionsManager] = useState(false);
  const [showDecorrerManager, setShowDecorrerManager] = useState(false);
  const isMobile = useIsMobile();

  const form = useForm({
    defaultValues: {
      name: '',
      jobPositions: [] as string[],
      urgency: 'Média' as UrgencyLevel,
      inProgress: ''
    }
  });

  useEffect(() => {
    if (searchQuery.trim() === '') {
      let filtered = [...companies];
      
      // Apply filters
      if (filterType === 'job' && jobPositionFilter && filtered.length > 0) {
        filtered = filtered.filter(company => 
          company.jobPositions.includes(jobPositionFilter)
        );
      } else if (filterType === 'urgency' && filtered.length > 0) {
        if (urgencyFilter) {
          filtered = filtered.filter(company => company.urgency === urgencyFilter);
        } else {
          filtered = filtered.filter(company => company.urgency);
        }
      } else if (filterType === 'inProgress' && filtered.length > 0) {
        filtered = filtered.filter(company => 
          (company.inProgressStates && company.inProgressStates.length > 0)
        );
      }
      
      setFilteredCompanies(filtered);
    } else {
      let filtered = companies.filter(company => {
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
      
      // Apply additional filters
      if (filterType === 'job' && jobPositionFilter && filtered.length > 0) {
        filtered = filtered.filter(company => 
          company.jobPositions.includes(jobPositionFilter)
        );
      } else if (filterType === 'urgency' && filtered.length > 0) {
        if (urgencyFilter) {
          filtered = filtered.filter(company => company.urgency === urgencyFilter);
        } else {
          filtered = filtered.filter(company => company.urgency);
        }
      } else if (filterType === 'inProgress' && filtered.length > 0) {
        filtered = filtered.filter(company => 
          (company.inProgressStates && company.inProgressStates.length > 0)
        );
      }
      
      setFilteredCompanies(filtered);
    }
  }, [searchQuery, companies, filterType, urgencyFilter, jobPositionFilter, inProgressFilter]);

  const handleCreateCompany = () => {
    if (newCompanyName.trim()) {
      createCompany(newCompanyName);
      setNewCompanyName('');
      setShowNewCompanyForm(false);
    }
  };

  const startEditingCompany = (company: Company) => {
    setEditingCompany(company);
    form.reset({
      name: company.name,
      jobPositions: company.jobPositions || [],
      urgency: company.urgency || 'Média',
      inProgress: ''
    });
  };

  const saveEditedCompany = () => {
    if (editingCompany) {
      const formData = form.getValues();
      
      if (formData.name.trim()) {
        updateCompany(editingCompany.id, { 
          name: formData.name,
          jobPositions: formData.jobPositions,
          urgency: formData.urgency,
        });
      }
    }
  };

  const handleAddEmail = () => {
    if (editingCompany && newEmail.trim()) {
      addCompanyEmail(editingCompany.id, newEmail);
      setNewEmail('');
    }
  };

  const handleAddPhone = () => {
    if (editingCompany && newPhone.trim()) {
      addCompanyPhone(editingCompany.id, newPhone);
      setNewPhone('');
    }
  };

  const handleAddContact = () => {
    if (editingCompany && newContact.trim()) {
      addCompanyContact(editingCompany.id, newContact);
      setNewContact('');
    }
  };

  const closeEditDialog = () => {
    setEditingCompany(null);
    setNewEmail('');
    setNewPhone('');
    setNewContact('');
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

  const toggleSearch = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const filterByUrgency = (urgency: UrgencyLevel | null) => {
    setUrgencyFilter(urgency);
    setFilterType('urgency');
  };

  const filterByJobPosition = (jobPosition: string | null) => {
    setJobPositionFilter(jobPosition);
    setFilterType('job');
  };

  const handleJobPositionChange = (value: string) => {
    if (value === 'custom') {
      setCustomJobPosition('');
    } else if (value !== 'none') {
      // Add job position to the array if not already present
      const currentPositions = form.getValues().jobPositions || [];
      if (!currentPositions.includes(value)) {
        form.setValue('jobPositions', [...currentPositions, value]);
      }
    }
  };

  const applyCustomJobPosition = () => {
    if (customJobPosition.trim()) {
      const currentPositions = form.getValues().jobPositions || [];
      if (!currentPositions.includes(customJobPosition)) {
        form.setValue('jobPositions', [...currentPositions, customJobPosition]);
      }
      setCustomJobPosition('');
    }
  };

  const handleAddGlobalJobPosition = () => {
    if (newGlobalJobPosition.trim()) {
      addJobPosition(newGlobalJobPosition);
      setNewGlobalJobPosition('');
      toast.success(`Vaga "${newGlobalJobPosition}" adicionada`);
    }
  };

  const handleDeleteJobPosition = (jobPosition: string) => {
    deleteJobPosition(jobPosition);
    toast.success(`Vaga "${jobPosition}" removida`);
  };

  const getUrgencyColor = (urgency?: UrgencyLevel) => {
    switch(urgency) {
      case 'Baixa': return 'bg-green-100 text-green-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIndicator = (urgency?: UrgencyLevel) => {
    switch(urgency) {
      case 'Baixa': 
      case 'low':
        return <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
      case 'Média':
      case 'medium':
        return <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>;
      case 'Alta':
      case 'high':
        return <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>;
      default: 
        return null;
    }
  };

  const handleDeleteCompanyEmail = async (emailId: string) => {
    await deleteCompanyEmail(emailId);
  };

  const handleDeleteCompanyPhone = async (phoneId: string) => {
    await deleteCompanyPhone(phoneId);
  };

  const handleDeleteCompanyContact = async (contactId: string) => {
    await deleteCompanyContact(contactId);
  };

  const filterByInProgress = () => {
    setInProgressFilter(true);
    setFilterType('inProgress');
  };

  const handleAddGlobalInProgressState = async () => {
    if (newGlobalInProgressState.trim()) {
      await addInProgressState(newGlobalInProgressState);
      setNewGlobalInProgressState('');
      toast.success(`Estado "${newGlobalInProgressState}" adicionado`);
    }
  };

  const handleDeleteGlobalInProgressState = async (state: string) => {
    await deleteInProgressState(state);
    toast.success(`Estado "${state}" removido`);
  };

  return (
    <Sidebar>
      <SidebarHeader className="py-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-center flex-1">Mensageiro</h1>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setOpenMobile(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        {isLoading ? (
          <div className="flex justify-center p-4">Carregando...</div>
        ) : (
          <SidebarGroup>
            <div className="px-4 py-2 flex justify-between items-center">
              <h2 className="text-xs font-medium text-muted-foreground">Empresas</h2>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={toggleFilterMenu} className="h-6 px-2 relative">
                  <Filter className="h-4 w-4" />
                  {filterType !== 'all' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleSearch} className="h-6 px-2">
                  <Search className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowJobPositionsManager(true)} 
                  className="h-6 px-2"
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDecorrerManager(true)} 
                  className="h-6 px-2"
                >
                  <Clock className="h-4 w-4" />
                </Button>
                {user && (
                  <Button variant="ghost" size="sm" onClick={signOut} className="h-6 px-2">
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {showFilterMenu && (
              <div className="px-4 pb-2">
                <div className="space-y-2 p-2 bg-muted/50 rounded-md">
                  <div className="text-xs font-medium">Filtrar por:</div>
                  <div className="flex flex-wrap gap-1">
                    <Button 
                      size="sm" 
                      variant={filterType === 'all' ? "default" : "outline"} 
                      className="text-xs h-7" 
                      onClick={() => {
                        setFilterType('all');
                        setUrgencyFilter(null);
                        setJobPositionFilter(null);
                        setInProgressFilter(false);
                      }}
                    >
                      Todos
                    </Button>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          size="sm" 
                          variant={filterType === 'job' ? "default" : "outline"} 
                          className="text-xs h-7 flex items-center gap-1" 
                        >
                          <BriefcaseBusiness className="h-3 w-3" />
                          Vaga
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2 bg-background" align="start">
                        <div className="space-y-2">
                          <p className="text-xs font-medium">Selecione uma vaga:</p>
                          <div className="flex flex-col space-y-1">
                            <ScrollArea className="h-[200px] pr-3">
                              {availableJobPositions.map(job => (
                                <Button 
                                  key={job}
                                  size="sm" 
                                  variant={(filterType === 'job' && jobPositionFilter === job) ? "default" : "outline"} 
                                  className="text-xs h-7 justify-start w-full mb-1"
                                  onClick={() => filterByJobPosition(job)}
                                >
                                  {job}
                                </Button>
                              ))}
                            </ScrollArea>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          size="sm" 
                          variant={filterType === 'urgency' ? "default" : "outline"} 
                          className="text-xs h-7 flex items-center gap-1" 
                        >
                          <AlertCircle className="h-3 w-3" />
                          Urgência
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2 bg-background" align="start">
                        <div className="space-y-2">
                          <p className="text-xs font-medium">Selecione o nível de urgência:</p>
                          <div className="flex flex-col space-y-1">
                            <Button 
                              size="sm" 
                              variant={(filterType === 'urgency' && urgencyFilter === 'Baixa') ? "default" : "outline"} 
                              className="text-xs h-7 flex items-center gap-1 justify-start" 
                              onClick={() => filterByUrgency('Baixa')}
                            >
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Baixa
                            </Button>
                            <Button 
                              size="sm" 
                              variant={(filterType === 'urgency' && urgencyFilter === 'Média') ? "default" : "outline"} 
                              className="text-xs h-7 flex items-center gap-1 justify-start" 
                              onClick={() => filterByUrgency('Média')}
                            >
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              Média
                            </Button>
                            <Button 
                              size="sm" 
                              variant={(filterType === 'urgency' && urgencyFilter === 'Alta') ? "default" : "outline"} 
                              className="text-xs h-7 flex items-center gap-1 justify-start" 
                              onClick={() => filterByUrgency('Alta')}
                            >
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              Alta
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          size="sm" 
                          variant={filterType === 'inProgress' ? "default" : "outline"} 
                          className="text-xs h-7 flex items-center gap-1" 
                        >
                          <Clock className="h-3 w-3" />
                          Decorrer
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2 bg-background z-50" align="start">
                        <div className="space-y-2">
                          <p className="text-xs font-medium">Selecione um estado:</p>
                          <div className="flex flex-col space-y-1">
                            <ScrollArea className="h-[200px] pr-3">
                              {availableInProgressStates.map(state => (
                                <Button 
                                  key={state}
                                  size="sm" 
                                  variant={(filterType === 'inProgress') ? "default" : "outline"}
                                  className="text-xs h-7 justify-start w-full mb-1"
                                  onClick={filterByInProgress}
                                >
                                  {state}
                                </Button>
                              ))}
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs h-7 justify-start w-full mb-1"
                                onClick={filterByInProgress}
                              >
                                Qualquer estado
                              </Button>
                            </ScrollArea>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

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

            <CompanyList
              companies={filteredCompanies}
              activeCompany={activeCompany}
              onCompanySelect={handleCompanySelect}
              onEditCompany={startEditingCompany}
              onDeleteCompany={handleDeleteCompany}
            />

            {showNewCompanyForm ? (
              <div className="p-2">
                <div className="flex gap-2">
                  <Input
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="Nome da empresa"
                    className="h-9 text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleCreateCompany}
                    className="bg-primary/80 hover:bg-primary"
                  >
                    Criar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-2">
                <Button 
                  className="w-full"
                  size="sm"
                  onClick={() => setShowNewCompanyForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Nova Empresa
                </Button>
              </div>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4 text-xs text-center text-muted-foreground">
        {user?.email && (
          <div className="mb-2 text-sm font-medium">{user.email}</div>
        )}
        Versão 1.0
      </SidebarFooter>

      {/* Dialog para gerenciar vagas/empregos */}
      <Dialog
        open={showJobPositionsManager}
        onOpenChange={setShowJobPositionsManager}
      >
        <DialogContent className="sm:max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>Gerenciar Vagas</DialogTitle>
            <DialogDescription>
              Adicione ou remova vagas disponíveis para todas as empresas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                value={newGlobalJobPosition}
                onChange={(e) => setNewGlobalJobPosition(e.target.value)}
                placeholder="Nova vaga"
                className="flex-1"
              />
              <Button onClick={handleAddGlobalJobPosition}>Adicionar</Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Vagas disponíveis</h3>
              <ScrollArea className="h-[200px] pr-3">
                {availableJobPositions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma vaga cadastrada</p>
                ) : (
                  <div className="space-y-2">
                    {availableJobPositions.map(job => (
                      <div key={job} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                        <div className="flex items-center gap-2">
                          <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
                          <span>{job}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteJobPosition(job)} 
                          className="h-7 w-7 hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowJobPositionsManager(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para gerenciar estados "Decorrer" */}
      <Dialog
        open={showDecorrerManager}
        onOpenChange={setShowDecorrerManager}
      >
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

      {/* Dialog para confirmar exclusão de empresa */}
      <AlertDialog open={!!companyToDelete} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a empresa {companyToDelete?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCompany}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para editar empresa */}
      <Dialog 
        open={!!editingCompany} 
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
      >
        <DialogContent className="sm:max-w-md bg-background z-50">
          <DialogHeader>
            <DialogTitle>Editar empresa</DialogTitle>
          </DialogHeader>
          
          {editingCompany && (
            <Tabs defaultValue="info" className="pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
                <TabsTrigger value="emails" className="flex-1">E-mails</TabsTrigger>
                <TabsTrigger value="phones" className="flex-1">Telefones</TabsTrigger>
                <TabsTrigger value="contacts" className="flex-1">Contatos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="pt-4">
                <InformationTab
                  form={form}
                  company={editingCompany}
                  availableJobPositions={availableJobPositions}
                  customJobPosition={customJobPosition}
                  setCustomJobPosition={setCustomJobPosition}
                  handleJobPositionChange={handleJobPositionChange}
                  applyCustomJobPosition={applyCustomJobPosition}
                  onSave={saveEditedCompany}
                />
              </TabsContent>
              
              <TabsContent value="emails" className="pt-4">
                <EmailsTab
                  company={editingCompany}
                  newEmail={newEmail}
                  setNewEmail={setNewEmail}
                  onAddEmail={handleAddEmail}
                  onDeleteEmail={handleDeleteCompanyEmail}
                />
              </TabsContent>
              
              <TabsContent value="phones" className="pt-4">
                <div className="space-y-4">
                  {editingCompany.phones.length > 0 ? (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Telefones cadastrados</h3>
                      <div className="space-y-2">
                        {editingCompany.phones.map((phone) => (
                          <div key={phone.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{phone.phone}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteCompanyPhone(phone.id)} 
                              className="h-7 w-7 hover:text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      Nenhum telefone cadastrado
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-2">Adicionar novo telefone</h3>
                    <div className="space-y-2">
                      <Input
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Telefone"
                        className="w-full"
                      />
                      
                      <Button className="w-full" onClick={handleAddPhone}>
                        Adicionar telefone
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contacts" className="pt-4">
                <div className="space-y-4">
                  {editingCompany.contacts.length > 0 ? (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Contatos cadastrados</h3>
                      <div className="space-y-2">
                        {editingCompany.contacts.map((contact) => (
                          <div key={contact.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{contact.name}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteCompanyContact(contact.id)} 
                              className="h-7 w-7 hover:text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      Nenhum contato cadastrado
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-2">Adicionar novo contato</h3>
                    <div className="space-y-2">
                      <Input
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        placeholder="Nome do contato"
                        className="w-full"
                      />
                      
                      <Button className="w-full" onClick={handleAddContact}>
                        Adicionar contato
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
