
import { MessageProvider } from '@/context/MessageContext';
import MainLayout from '@/components/layout/MainLayout';

const Index = () => {
  return (
    <MessageProvider>
      <div className="min-h-screen bg-background page-transition">
        <MainLayout />
      </div>
    </MessageProvider>
  );
};

export default Index;
