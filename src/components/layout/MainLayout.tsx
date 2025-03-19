
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import MessagesView from "@/components/views/MessagesView";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useMessages } from "@/context/MessageContext";

const MobileMenuToggle = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="md:hidden fixed top-4 left-4 z-50" 
      onClick={toggleSidebar}
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Open menu</span>
    </Button>
  );
};

const CompanyInfo = () => {
  const { activeCompany } = useMessages();
  
  if (!activeCompany) return null;
  
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm text-muted-foreground">
      {activeCompany.contacts.length > 0 && (
        <div className="flex flex-col">
          <span className="font-medium mb-1">Contatos:</span>
          {activeCompany.contacts.map(contact => (
            <div key={contact.id} className="flex items-center gap-1 ml-2 mb-1">
              <User className="h-4 w-4" />
              <span>{contact.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {activeCompany.emails.length > 0 && (
        <div className="flex flex-col">
          <span className="font-medium mb-1">E-mails:</span>
          {activeCompany.emails.map(item => (
            <div key={item.id} className="flex items-center gap-1 ml-2 mb-1">
              <Mail className="h-4 w-4" />
              <span>{item.email}</span>
            </div>
          ))}
        </div>
      )}
      
      {activeCompany.phones.length > 0 && (
        <div className="flex flex-col">
          <span className="font-medium mb-1">Telefones:</span>
          {activeCompany.phones.map(item => (
            <div key={item.id} className="flex items-center gap-1 ml-2 mb-1">
              <Phone className="h-4 w-4" />
              <span>{item.phone}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MainLayout = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden bg-background transition-all duration-300 ease-in-out">
          <MobileMenuToggle />
          <CompanyInfo />
          <MessagesView />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
