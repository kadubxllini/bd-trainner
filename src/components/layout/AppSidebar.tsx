
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
import { Theme } from "@/types";
import { useMessages } from "@/context/MessageContext";
import { Briefcase, Heart, User } from "lucide-react";

const themes: { label: Theme; icon: React.ElementType }[] = [
  { label: 'Trabalho', icon: Briefcase },
  { label: 'Saúde', icon: Heart },
  { label: 'Pessoal', icon: User }
];

export function AppSidebar() {
  const { activeTheme, setActiveTheme } = useMessages();

  return (
    <Sidebar>
      <SidebarHeader className="py-6">
        <h1 className="text-lg font-semibold text-center">Mensageiro</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <h2 className="px-4 py-2 text-xs font-medium text-muted-foreground">Temas</h2>
          <SidebarMenu>
            {themes.map((theme) => (
              <SidebarMenuItem key={theme.label}>
                <SidebarMenuButton 
                  onClick={() => setActiveTheme(theme.label)}
                  className={`${
                    activeTheme === theme.label 
                      ? 'bg-primary/20 text-primary-foreground' 
                      : 'hover:bg-secondary'
                  } transition-all duration-200`}
                >
                  <theme.icon className="w-5 h-5 mr-2" />
                  <span>{theme.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 text-xs text-center text-muted-foreground">
        Versão 1.0
      </SidebarFooter>
    </Sidebar>
  );
}
