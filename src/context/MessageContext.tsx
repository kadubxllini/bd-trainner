
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, Theme } from '@/types';
import { toast } from '@/components/ui/sonner';

interface MessageContextProps {
  messages: Message[];
  activeTheme: Theme;
  setActiveTheme: (theme: Theme) => void;
  addMessage: (content: string, isTask: boolean) => void;
  toggleTaskStatus: (id: string) => void;
  deleteMessage: (id: string) => void;
}

const MessageContext = createContext<MessageContextProps | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTheme, setActiveTheme] = useState<Theme>('Trabalho');

  // Load messages from localStorage on initialization
  useEffect(() => {
    const storedMessages = localStorage.getItem('messages');
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (error) {
        console.error('Failed to parse stored messages:', error);
        toast.error('Não foi possível carregar as mensagens salvas');
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  const addMessage = (content: string, isTask: boolean) => {
    if (!content.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      theme: activeTheme,
      isTask,
      isCompleted: false,
    };
    
    setMessages(prev => [...prev, newMessage]);
    toast.success(isTask ? 'Tarefa criada' : 'Mensagem enviada');
  };

  const toggleTaskStatus = (id: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id && msg.isTask ? { ...msg, isCompleted: !msg.isCompleted } : msg
      )
    );
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    toast.success('Item removido');
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        activeTheme,
        setActiveTheme,
        addMessage,
        toggleTaskStatus,
        deleteMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
