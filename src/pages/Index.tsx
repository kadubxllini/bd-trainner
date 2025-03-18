
import { MessageProvider } from '@/context/MessageContext';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <MessageProvider>
      <div className="min-h-screen bg-background page-transition">
        <MainLayout />
      </div>
    </MessageProvider>
  );
};

export default Index;
