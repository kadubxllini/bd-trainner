
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import MessagesView from "@/components/views/MessagesView";

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col p-6 overflow-hidden bg-background transition-all duration-300 ease-in-out">
          <MessagesView />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
