
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import { useMessages } from "@/context/MessageContext";
import { Building, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { 
    companies, 
    activeCompany,
    createCompany,
    selectCompany 
  } = useMessages();
  
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);

  const handleCreateCompany = () => {
    if (newCompanyName.trim()) {
      createCompany(newCompanyName);
      setNewCompanyName('');
      setShowNewCompanyForm(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="py-6">
        <h1 className="text-lg font-semibold text-center">Mensageiro</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <h2 className="px-4 py-2 text-xs font-medium text-muted-foreground">Empresas</h2>
          <SidebarMenu>
            {companies.map((company) => (
              <SidebarMenuItem key={company.id}>
                <SidebarMenuButton 
                  onClick={() => selectCompany(company.id)}
                  className={`${
                    activeCompany?.id === company.id 
                      ? 'bg-primary/20 text-primary-foreground' 
                      : 'hover:bg-secondary'
                  } transition-all duration-200`}
                >
                  <Building className="w-5 h-5 mr-2" />
                  <span>{company.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
      </SidebarContent>
      <SidebarFooter className="p-4 text-xs text-center text-muted-foreground">
        Versão 1.0
      </SidebarFooter>
    </Sidebar>
  );
}
