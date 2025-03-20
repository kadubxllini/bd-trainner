
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
import { Building, Plus, Pencil, Trash, LogOut, X, Search, Mail, Phone, User } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Company, CompanyEmail, CompanyPhone, CompanyContact } from "@/types";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    isLoading
  } = useMessages();
  
  const { user, signOut } = useAuth();
  const { setOpenMobile } = useSidebar();
  
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newJobPosition, setNewJobPosition] = useState('');
  const [newPreference, setNewPreference] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newContact, setNewContact] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const isMobile = useIsMobile();

  const form = useForm({
    defaultValues: {
      name: '',
      jobPosition: '',
      preference: ''
    }
  });

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company => {
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
      
      setFilteredCompanies(filtered);
    }
  }, [searchQuery, companies]);

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
      jobPosition: '',
      preference: ''
    });
  };

  const saveEditedCompany = () => {
    if (editingCompany) {
      const formData = form.getValues();
      
      if (formData.name.trim()) {
        updateCompany(editingCompany.id, { 
          name: formData.name
        });
      }
    }
  };

  const handleAddEmail = () => {
    if (editingCompany && newEmail.trim()) {
      addCompanyEmail(editingCompany.id, newEmail, newJobPosition, newPreference);
      setNewEmail('');
      setNewJobPosition('');
      setNewPreference('');
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
    setNewPreference('');
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

            <SidebarMenu>
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
                        <Building className="w-5 h-5 mr-2" />
                        <span className="truncate">{company.name}</span>
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
                  <label htmlFor="jobPosition" className="text-sm font-medium">Vaga/Cargo</label>
                  <Input
                    id="jobPosition"
                    {...form.register('jobPosition')}
                    placeholder="Vaga ou cargo oferecido"
                    className="w-full"
                    value={newJobPosition}
                    onChange={(e) => setNewJobPosition(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="preference" className="text-sm font-medium">Preferência</label>
                  <Input
                    id="preference"
                    {...form.register('preference')}
                    placeholder="Preferência da empresa"
                    className="w-full"
                    value={newPreference}
                    onChange={(e) => setNewPreference(e.target.value)}
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
                              <div className="text-sm text-muted-foreground pl-6">
                                Preferência: {item.preference}
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
