
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
import { Company } from "@/types";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export function AppSidebar() {
  const { 
    companies, 
    activeCompany,
    createCompany,
    selectCompany,
    updateCompany,
    deleteCompany,
    isLoading
  } = useMessages();
  
  const { user, signOut } = useAuth();
  const { setOpenMobile } = useSidebar();
  
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const isMobile = useIsMobile();

  // Initialize form
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      contactPerson: ''
    }
  });

  // Update filtered companies when search query or companies change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (company.email && company.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (company.contactPerson && company.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
      );
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
      email: company.email || '',
      phone: company.phone || '',
      contactPerson: company.contactPerson || ''
    });
  };

  const saveEditedCompany = () => {
    if (editingCompany) {
      const formData = form.getValues();
      
      if (formData.name.trim()) {
        updateCompany(editingCompany.id, { 
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          contactPerson: formData.contactPerson
        });
        
        setEditingCompany(null);
      }
    }
  };

  const closeEditDialog = () => {
    setEditingCompany(null);
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

      {/* Edit Company Dialog */}
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
          <div className="py-4 space-y-4">
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
              <label htmlFor="email" className="text-sm font-medium">E-mail</label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  {...form.register('email')}
                  placeholder="E-mail de contato"
                  className="w-full"
                  type="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Telefone</label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  {...form.register('phone')}
                  placeholder="Telefone de contato"
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="contactPerson" className="text-sm font-medium">Pessoa de contato</label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactPerson"
                  {...form.register('contactPerson')}
                  placeholder="Nome da pessoa de contato"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={closeEditDialog}>
              Cancelar
            </Button>
            <Button onClick={saveEditedCompany}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
