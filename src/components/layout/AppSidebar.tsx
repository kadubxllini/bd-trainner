
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
} from "@/components/ui/sidebar";
import { useMessages } from "@/context/MessageContext";
import { useAuth } from "@/context/AuthContext";
import { Building, Plus, Pencil, Trash, LogOut } from "lucide-react";
import { useState } from "react";
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
  
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editedCompanyName, setEditedCompanyName] = useState('');
  const isMobile = useIsMobile();

  const handleCreateCompany = () => {
    if (newCompanyName.trim()) {
      createCompany(newCompanyName);
      setNewCompanyName('');
      setShowNewCompanyForm(false);
    }
  };

  const startEditingCompany = (company: Company) => {
    setEditingCompany(company);
    setEditedCompanyName(company.name);
  };

  const saveEditedCompany = () => {
    if (editingCompany && editedCompanyName.trim()) {
      updateCompany(editingCompany.id, { name: editedCompanyName });
      setEditingCompany(null);
      setEditedCompanyName('');
    }
  };

  const closeEditDialog = () => {
    setEditingCompany(null);
    setEditedCompanyName('');
  };

  const handleDeleteCompany = (companyId: string) => {
    deleteCompany(companyId);
  };

  return (
    <Sidebar>
      <SidebarHeader className="py-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-center flex-1">Mensageiro</h1>
        {isMobile && <SidebarTrigger className="md:hidden" />}
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className="flex justify-center p-4">Carregando...</div>
        ) : (
          <SidebarGroup>
            <div className="px-4 py-2 flex justify-between items-center">
              <h2 className="text-xs font-medium text-muted-foreground">Empresas</h2>
              {user && (
                <Button variant="ghost" size="sm" onClick={signOut} className="h-6 px-2">
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
            <SidebarMenu>
              {companies.map((company) => (
                <ContextMenu key={company.id}>
                  <ContextMenuTrigger>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => selectCompany(company.id)}
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
          <div className="py-4">
            <Input
              value={editedCompanyName}
              onChange={(e) => setEditedCompanyName(e.target.value)}
              placeholder="Nome da empresa"
              className="w-full"
            />
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
