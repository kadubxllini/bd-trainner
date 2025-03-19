
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, Company } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MessageContextProps {
  messages: Message[];
  companies: Company[];
  activeCompany: Company | null;
  addMessage: (content: string, fileAttachment?: Message['fileAttachment']) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  updateMessage: (id: string, data: Partial<Message>) => Promise<void>;
  createCompany: (name: string) => Promise<void>;
  selectCompany: (id: string) => void;
  updateCompany: (id: string, data: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  isLoading: boolean;
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  
  // Fetch companies
  const { 
    data: companies = [], 
    isLoading: isLoadingCompanies 
  } = useQuery({
    queryKey: ['companies', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error(`Erro ao carregar empresas: ${error.message}`);
        throw error;
      }
      
      return data.map(company => ({
        id: company.id,
        name: company.name,
        email: company.email || undefined,
        phone: company.phone || undefined,
        contactPerson: company.contact_person || undefined,
        messages: []
      }));
    },
    enabled: !!user
  });
  
  // Fetch messages for active company
  const { 
    data: messages = [],
    isLoading: isLoadingMessages
  } = useQuery({
    queryKey: ['messages', activeCompany?.id],
    queryFn: async () => {
      if (!user || !activeCompany) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('company_id', activeCompany.id)
        .order('timestamp', { ascending: true });
      
      if (error) {
        toast.error(`Erro ao carregar mensagens: ${error.message}`);
        throw error;
      }
      
      return data.map(msg => ({
        id: msg.id,
        content: msg.content,
        timestamp: new Date(msg.timestamp).getTime(),
        fileAttachment: msg.file_url ? {
          name: msg.file_name || 'Arquivo',
          url: msg.file_url,
          type: msg.file_type || 'application/octet-stream'
        } : undefined
      }));
    },
    enabled: !!user && !!activeCompany
  });
  
  // Set default active company when companies load
  useEffect(() => {
    if (!activeCompany && companies.length > 0) {
      setActiveCompany(companies[0]);
    }
  }, [companies, activeCompany]);
  
  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from('companies')
        .insert({ name, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success(`Empresa ${data.name} criada`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar empresa: ${error.message}`);
    }
  });
  
  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Company> }) => {
      const updateData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        contact_person: data.contactPerson || null
      };
      
      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa atualizada');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar empresa: ${error.message}`);
    }
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa removida');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover empresa: ${error.message}`);
    }
  });
  
  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async ({ 
      content, 
      fileAttachment 
    }: { 
      content: string, 
      fileAttachment?: Message['fileAttachment'] 
    }) => {
      if (!user || !activeCompany) throw new Error("Empresa não selecionada");
      
      let fileData = null;
      
      if (fileAttachment) {
        const fileName = fileAttachment.name;
        const fileUrl = fileAttachment.url;
        const fileType = fileAttachment.type;
        
        fileData = { file_name: fileName, file_url: fileUrl, file_type: fileType };
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: content.trim() || (fileAttachment ? '📎 Arquivo anexado' : ''),
          company_id: activeCompany.id,
          user_id: user.id,
          ...fileData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeCompany?.id] });
      toast.success('Mensagem enviada');
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    }
  });
  
  // Update message mutation
  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Message> }) => {
      const { error } = await supabase
        .from('messages')
        .update({ content: data.content })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeCompany?.id] });
      toast.success('Mensagem atualizada');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar mensagem: ${error.message}`);
    }
  });
  
  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeCompany?.id] });
      toast.success('Mensagem removida');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover mensagem: ${error.message}`);
    }
  });

  // Function wrappers
  const createCompany = async (name: string) => {
    if (!name.trim()) return;
    await createCompanyMutation.mutateAsync(name);
  };

  const selectCompany = (id: string) => {
    const company = companies.find(c => c.id === id);
    if (company) {
      setActiveCompany(company);
      toast.success(`Empresa ${company.name} selecionada`);
    }
  };

  const updateCompany = async (id: string, data: Partial<Company>) => {
    await updateCompanyMutation.mutateAsync({ id, data });
    
    // Update active company if it's the one being updated
    if (activeCompany && activeCompany.id === id) {
      setActiveCompany(prev => prev ? { ...prev, ...data } : prev);
    }
  };

  const deleteCompany = async (id: string) => {
    // Prevent deleting the last company
    if (companies.length <= 1) {
      toast.error('Não é possível excluir a única empresa');
      return;
    }
    
    await deleteCompanyMutation.mutateAsync(id);
    
    // Reset active company if it's being deleted
    if (activeCompany && activeCompany.id === id) {
      const nextCompany = companies.find(c => c.id !== id);
      setActiveCompany(nextCompany || null);
    }
  };

  const addMessage = async (content: string, fileAttachment?: Message['fileAttachment']) => {
    if ((!content.trim() && !fileAttachment) || !activeCompany) return;
    await addMessageMutation.mutateAsync({ content, fileAttachment });
  };

  const updateMessage = async (id: string, data: Partial<Message>) => {
    await updateMessageMutation.mutateAsync({ id, data });
  };

  const deleteMessage = async (id: string) => {
    await deleteMessageMutation.mutateAsync(id);
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        companies,
        activeCompany,
        addMessage,
        deleteMessage,
        updateMessage,
        createCompany,
        selectCompany,
        updateCompany,
        deleteCompany,
        isLoading: isLoadingCompanies || isLoadingMessages
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
