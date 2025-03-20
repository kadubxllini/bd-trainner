import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Company, CompanyEmail, CompanyPhone, CompanyContact, UrgencyLevel } from "@/types";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

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
    availableJobPositions
  } = useMessages();
  
  const { user, signOut } = useAuth();
  const { setOpenMobile } = useSidebar();
  
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newJobPosition, setNewJobPosition] = useState('');
  const [newUrgency, setNewUrgency] = useState<UrgencyLevel>('Média');
  const [newPhone, setNewPhone] = useState('');
  const [newContact, setNewContact] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'job' | 'urgency' | 'inProgress'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [customJobPosition, setCustomJobPosition] = useState('');
  const isMobile = useIsMobile();

  const form = useForm({
    defaultValues: {
      name: '',
      jobPosition: '',
      urgency: 'Média' as UrgencyLevel,
      inProgress: ''
    }
  });

  useEffect(() => {
    if (searchQuery.trim() === '') {
      let filtered = [...companies];
      
      // Apply filters
      if (filterType === 'job' && filtered.length > 0) {
        filtered = filtered.filter(company => company.jobPosition && company.jobPosition.trim() !== '');
      } else if (filterType === 'urgency' && filtered.length > 0) {
        if (urgencyFilter) {
          filtered = filtered.filter(company => company.urgency === urgencyFilter);
        } else {
          filtered = filtered.filter(company => company.urgency);
        }
      } else if (filterType === 'inProgress' && filtered.length > 0) {
        filtered = filtered.filter(company => company.inProgress && company.inProgress.trim() !== '');
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
      if (filterType === 'job' && filtered.length > 0) {
        filtered = filtered.filter(company => company.jobPosition && company.jobPosition.trim() !== '');
      } else if (filterType === 'urgency' && filtered.length > 0) {
        if (urgencyFilter) {
          filtered = filtered.filter(company => company.urgency === urgencyFilter);
        } else {
          filtered = filtered.filter(company => company.urgency);
        }
      } else if (filterType === 'inProgress' && filtered.length > 0) {
        filtered = filtered.filter(company => company.inProgress && company.inProgress.trim() !== '');
      }
      
      setFilteredCompanies(filtered);
    }
  }, [searchQuery, companies, filterType, urgencyFilter]);

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
      jobPosition: company.jobPosition || '',
      urgency: company.urgency || 'Média',
      inProgress: company.inProgress || ''
    });
  };

  const saveEditedCompany = () => {
    if (editingCompany) {
      const formData = form.getValues();
      
      if (formData.name.trim()) {
        updateCompany(editingCompany.id, { 
          name: formData.name,
          jobPosition: formData.jobPosition || undefined,
          urgency: formData.urgency,
          inProgress: formData.inProgress || undefined
        });
      }
    }
  };

  const handleAddEmail = () => {
    if (editingCompany && newEmail.trim()) {
      addCompanyEmail(editingCompany.id, newEmail, newJobPosition, newUrgency);
      setNewEmail('');
      setNewJobPosition('');
      setNewUrgency('Média');
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
    setNewJobPosition('');
    setNewUrgency('Média');
    setNewPhone('');
    setNewContact('');
  };

  const handleDeleteCompany = (companyId: string) => {
    deleteCompany(companyId);
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

  const handleJobPositionChange = (value: string) => {
    if (value === 'custom') {
      setCustomJobPosition('');
    } else {
      form.setValue('jobPosition', value);
    }
  };

  const applyCustomJobPosition = () => {
    if (customJobPosition.trim()) {
      form.setValue('jobPosition', customJobPosition);
      setCustomJobPosition('');
    }
  };

  const getUrgencyColor = (urgency?: UrgencyLevel) => {
    switch(urgency) {
      case 'Baixa': return 'bg-green-100 text-green-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Alta': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIndicator = (urgency?: UrgencyLevel) => {
    switch(urgency) {
      case 'Baixa': return <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
      case 'Média': return <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>;
      case 'Alta': return <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>;
      default: return null;
    }
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
                      }}
                    >
                      Todos
                    </Button>
                    <Button 
                      size="sm" 
                      variant={filterType === 'job' ? "default" : "outline"} 
                      className="text-xs h-7" 
                      onClick={() => {
                        setFilterType('job');
                        setUrgencyFilter(null);
                      }}
                    >
                      Vaga
                    </Button>
                    <Button 
                      size="sm" 
                      variant={filterType === 'inProgress' ? "default" : "outline"} 
                      className="text-xs h-7" 
                      onClick={() => {
                        setFilterType('inProgress');
                        setUrgencyFilter(null);
                      }}
                    >
                      Em decorrer
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium">Urgência:</div>
                    <div className="flex flex-wrap gap-1">
                      <Button 
                        size="sm" 
                        variant={(filterType === 'urgency' && !urgencyFilter) ? "default" : "outline"} 
                        className="text-xs h-7" 
                        onClick={() => filterByUrgency(null)}
                      >
                        Todas
                      </Button>
                      <Button 
                        size="sm" 
                        variant={(filterType === 'urgency' && urgencyFilter === 'Baixa') ? "default" : "outline"} 
                        className="text-xs h-7 flex items-center gap-1" 
                        onClick={() => filterByUrgency('Baixa')}
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Baixa
                      </Button>
                      <Button 
                        size="sm" 
                        variant={(filterType === 'urgency' && urgencyFilter === 'Média') ? "default" : "outline"} 
                        className="text-xs h-7 flex items-center gap-1" 
                        onClick={() => filterByUrgency('Média')}
                      >
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Média
                      </Button>
                      <Button 
                        size="sm" 
                        variant={(filterType === 'urgency' && urgencyFilter === 'Alta') ? "default" : "outline"} 
                        className="text-xs h-7 flex items-center gap-1" 
                        onClick={() => filterByUrgency('Alta')}
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Alta
                      </Button>
                    </div>
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

            <SidebarMenu className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
              {filteredCompanies.map((company) => (
                <ContextMenu key={company.id}>
                  <ContextMenuTrigger>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => handleCompanySelect(company.id)}
                        className={`${
                          activeCompany?.id === company.id 
                            ? 'bg-primary/20 text-primary-foreground' 
                            : 'hover:bg-secondary'
                        } transition-all duration-200`}
                      >
                        <div className="flex items-center w-full">
                          <Building className="w-5 h-5 mr-2 flex-shrink-0" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center">
                              <span className="truncate">{company.name}</span>
                              {company.inProgress && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span className="truncate">Decorrer</span>
                                </span>
                              )}
                            </div>
                            {company.jobPosition && (
                              <span className="text-xs text-muted-foreground truncate">
                                Vaga: {company.jobPosition}
                              </span>
                            )}
                            {company.urgency && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                {getUrgencyIndicator(company.urgency)}
                                <span className="truncate">
                                  Urgência: {company.urgency}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => startEditingCompany(company)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar empresa
                    </ContextMenuItem>
                    <ContextMenuItem 
                      onClick={() => handleDeleteCompany(company.id)} 
                      className="text-destructive"
                      disabled={companies.length <= 1}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir empresa
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}

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
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setShowNewCompanyForm(true)}
                    className="hover:bg-secondary transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span>Nova Empresa</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 text-xs text-center text-muted-foreground">
        {user?.email && (
          <div className="mb-2 text-sm font-medium">{user.email}</div>
        )}
        Versão 1.0
      </SidebarFooter>

      <Dialog 
        open={!!editingCompany} 
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar empresa</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
              <TabsTrigger value="emails" className="flex-1">E-mails</TabsTrigger>
              <TabsTrigger value="phones" className="flex-1">Telefones</TabsTrigger>
              <TabsTrigger value="contacts" className="flex-1">Contatos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome da empresa</label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Nome da empresa"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="jobPosition" className="text-sm font-medium">Vaga</label>
                  <Select
                    value={form.watch('jobPosition') || ''}
                    onValueChange={handleJobPositionChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a vaga" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma vaga</SelectItem>
                      {availableJobPositions.map(job => (
                        <SelectItem key={job} value={job}>{job}</SelectItem>
                      ))}
                      <SelectItem value="custom">Personalizada...</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {customJobPosition !== '' && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={customJobPosition}
                        onChange={(e) => setCustomJobPosition(e.target.value)}
                        placeholder="Digite a vaga personalizada"
                        className="flex-1"
                      />
                      <Button size="sm" onClick={applyCustomJobPosition}>Aplicar</Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Urgência</label>
                  <Select
                    value={form.watch('urgency')}
                    onValueChange={(value) => form.setValue('urgency', value as UrgencyLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa" className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        Baixa
                      </SelectItem>
                      <SelectItem value="Média" className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                        Média
                      </SelectItem>
                      <SelectItem value="Alta" className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                        Alta
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="decorrer" className="text-sm font-medium">Em decorrer</label>
                  <Textarea
                    id="decorrer"
                    {...form.register('inProgress')}
                    placeholder="Detalhes sobre o status em decorrer..."
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="emails" className="pt-4 space-y-4">
              <div className="space-y-2">
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Novo e-mail"
                  className="mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newJobPosition}
                    onChange={(e) => setNewJobPosition(e.target.value)}
                    placeholder="Vaga"
                    className="col-span-1"
                  />
                  <Select
                    value={newUrgency}
                    onValueChange={(value) => setNewUrgency(value as UrgencyLevel)}
                  >
                    <SelectTrigger className="col-span-1">
                      <SelectValue placeholder="Urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddEmail} size="sm" className="w-full">Adicionar</Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">E-mails cadastrados</h3>
                {editingCompany?.emails.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum e-mail cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {editingCompany?.emails.map(item => (
                      <div key={item.id} className="flex flex-col p-2 border rounded-md bg-secondary/20">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{item.email}</span>
                            </div>
                            {item.jobPosition && (
                              <div className="text-sm text-muted-foreground pl-6">
                                Vaga: {item.jobPosition}
                              </div>
                            )}
                            {item.preference && (
                              <div className="text-sm flex items-center pl-6">
                                {getUrgencyIndicator(item.preference as UrgencyLevel)}
                                <span className="text-muted-foreground">
                                  Urgência: {item.preference}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteCompanyEmail(item.id)} 
                            className="h-7 w-7 hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="phones" className="pt-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Novo telefone"
                  className="flex-1"
                />
                <Button onClick={handleAddPhone} size="sm">Adicionar</Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Telefones cadastrados</h3>
                {editingCompany?.phones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum telefone cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {editingCompany?.phones.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{item.phone}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteCompanyPhone(item.id)} 
                          className="h-7 w-7 hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="contacts" className="pt-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="Novo contato"
                  className="flex-1"
                />
                <Button onClick={handleAddContact} size="sm">Adicionar</Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Contatos cadastrados</h3>
                {editingCompany?.contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum contato cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {editingCompany?.contacts.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{item.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteCompanyContact(item.id)} 
                          className="h-7 w-7 hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="secondary" onClick={closeEditDialog}>
              Cancelar
            </Button>
            <Button onClick={() => {
              saveEditedCompany();
              closeEditDialog();
            }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
