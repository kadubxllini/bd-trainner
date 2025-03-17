
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, Theme, Company } from '@/types';
import { toast } from 'sonner'; // Import directly from sonner package instead of our UI component

interface MessageContextProps {
  messages: Message[];
  companies: Company[];
  activeCompany: Company | null;
  activeTheme: Theme;
  setActiveTheme: (theme: Theme) => void;
  addMessage: (content: string, isTask: boolean) => void;
  toggleTaskStatus: (id: string) => void;
  deleteMessage: (id: string) => void;
  createCompany: (name: string) => void;
  selectCompany: (id: string) => void;
  updateCompany: (id: string, data: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [activeTheme, setActiveTheme] = useState<Theme>('Trabalho');

  // Load data from localStorage on initialization
  useEffect(() => {
    const storedMessages = localStorage.getItem('messages');
    const storedCompanies = localStorage.getItem('companies');
    const storedActiveCompanyId = localStorage.getItem('activeCompanyId');
    
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (error) {
        console.error('Failed to parse stored messages:', error);
        toast.error('Não foi possível carregar as mensagens salvas');
      }
    }
    
    if (storedCompanies) {
      try {
        const parsedCompanies = JSON.parse(storedCompanies);
        setCompanies(parsedCompanies);
        
        // Set active company if stored
        if (storedActiveCompanyId) {
          const company = parsedCompanies.find((c: Company) => c.id === storedActiveCompanyId);
          if (company) {
            setActiveCompany(company);
          }
        }
      } catch (error) {
        console.error('Failed to parse stored companies:', error);
        toast.error('Não foi possível carregar as empresas salvas');
      }
    } else {
      // Create a default company if none exists
      const defaultCompany: Company = {
        id: 'teste',
        name: 'Teste',
        messages: []
      };
      setCompanies([defaultCompany]);
      setActiveCompany(defaultCompany);
      localStorage.setItem('companies', JSON.stringify([defaultCompany]));
      localStorage.setItem('activeCompanyId', defaultCompany.id);
    }
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
    if (activeCompany) {
      localStorage.setItem('activeCompanyId', activeCompany.id);
    }
  }, [companies, activeCompany]);

  const createCompany = (name: string) => {
    if (!name.trim()) return;
    
    const newCompany: Company = {
      id: Date.now().toString(),
      name,
      messages: []
    };
    
    setCompanies(prev => [...prev, newCompany]);
    setActiveCompany(newCompany);
    toast.success(`Empresa ${name} criada`);
  };

  const selectCompany = (id: string) => {
    const company = companies.find(c => c.id === id);
    if (company) {
      setActiveCompany(company);
      toast.success(`Empresa ${company.name} selecionada`);
    }
  };

  const updateCompany = (id: string, data: Partial<Company>) => {
    setCompanies(prev => 
      prev.map(company => 
        company.id === id ? { ...company, ...data } : company
      )
    );
    
    // Update active company if it's the one being updated
    if (activeCompany && activeCompany.id === id) {
      setActiveCompany(prev => prev ? { ...prev, ...data } : prev);
    }
    
    toast.success('Empresa atualizada');
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(company => company.id !== id));
    
    // Reset active company if it's being deleted
    if (activeCompany && activeCompany.id === id) {
      const nextCompany = companies.find(c => c.id !== id);
      setActiveCompany(nextCompany || null);
    }
    
    toast.success('Empresa removida');
  };

  const addMessage = (content: string, isTask: boolean) => {
    if (!content.trim() || !activeCompany) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      theme: activeTheme,
      isTask,
      isCompleted: false,
    };
    
    // Add to general messages list
    setMessages(prev => [...prev, newMessage]);
    
    // Add to company messages
    setCompanies(prev => 
      prev.map(company => 
        company.id === activeCompany.id 
        ? { ...company, messages: [...company.messages, newMessage] } 
        : company
      )
    );
    
    // Update active company
    setActiveCompany(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, newMessage]
      };
    });
    
    toast.success(isTask ? 'Tarefa criada' : 'Mensagem enviada');
  };

  const toggleTaskStatus = (id: string) => {
    // Update general messages
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id && msg.isTask ? { ...msg, isCompleted: !msg.isCompleted } : msg
      )
    );
    
    // Update company messages
    if (activeCompany) {
      setCompanies(prev => 
        prev.map(company => {
          if (company.id === activeCompany.id) {
            const updatedMessages = company.messages.map(msg =>
              msg.id === id && msg.isTask ? { ...msg, isCompleted: !msg.isCompleted } : msg
            );
            return { ...company, messages: updatedMessages };
          }
          return company;
        })
      );
      
      // Update active company
      setActiveCompany(prev => {
        if (!prev) return prev;
        const updatedMessages = prev.messages.map(msg =>
          msg.id === id && msg.isTask ? { ...msg, isCompleted: !msg.isCompleted } : msg
        );
        return { ...prev, messages: updatedMessages };
      });
    }
  };

  const deleteMessage = (id: string) => {
    // Remove from general messages
    setMessages(prev => prev.filter(msg => msg.id !== id));
    
    // Remove from company messages
    if (activeCompany) {
      setCompanies(prev => 
        prev.map(company => {
          if (company.id === activeCompany.id) {
            return { 
              ...company, 
              messages: company.messages.filter(msg => msg.id !== id) 
            };
          }
          return company;
        })
      );
      
      // Update active company
      setActiveCompany(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== id)
        };
      });
    }
    
    toast.success('Item removido');
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        companies,
        activeCompany,
        activeTheme,
        setActiveTheme,
        addMessage,
        toggleTaskStatus,
        deleteMessage,
        createCompany,
        selectCompany,
        updateCompany,
        deleteCompany
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
