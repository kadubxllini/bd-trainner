
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MessagesView from "@/components/views/MessagesView";
import TasksView from "@/components/views/TasksView";

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col p-6 overflow-hidden bg-background transition-all duration-300 ease-in-out">
          <Tabs defaultValue="messages" className="w-full h-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 glass-morphism border border-white/10">
              <TabsTrigger 
                value="messages" 
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground transition-all"
              >
                Mensagens
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground transition-all"
              >
                Tarefas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="messages" className="h-full flex-1 animate-fade-in">
              <MessagesView />
            </TabsContent>
            <TabsContent value="tasks" className="h-full flex-1 animate-fade-in">
              <TasksView />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
