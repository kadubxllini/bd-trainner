
import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/context/MessageContext';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MessagesView = () => {
  const { activeCompany, addMessage, deleteMessage } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const companyMessages = activeCompany?.messages || [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [companyMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && activeCompany) {
      addMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: number) => {
    return formatRelative(new Date(timestamp), new Date(), {
      locale: ptBR,
    });
  };

  return (
    <div className="flex flex-col h-full glass-morphism rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center">
        <h2 className="text-lg font-medium">
          {activeCompany ? activeCompany.name : 'Selecione uma empresa'}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!activeCompany ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Selecione uma empresa para visualizar mensagens.
            </p>
          </div>
        ) : companyMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Nenhuma mensagem ainda.<br />
              Envie sua primeira mensagem!
            </p>
          </div>
        ) : (
          companyMessages.map((message) => (
            <div key={message.id} className="animate-slide-up relative">
              <div className="message-bubble message-bubble-sent">
                <p>{message.content}</p>
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {formatMessageTime(message.timestamp)}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteMessage(message.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-white/10">
        {activeCompany && (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma mensagem..."
              className="bg-secondary/50 border-white/10 focus-visible:ring-primary/50"
              disabled={!activeCompany}
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              className="bg-primary/80 hover:bg-primary"
              disabled={!activeCompany}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
