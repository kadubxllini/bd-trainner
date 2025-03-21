import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, Company, CompanyEmail, CompanyPhone, CompanyContact, UrgencyLevel, InProgressState } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MessageContextProps {
  messages: Message[];
  companies: Company[];
  activeCompany: Company | null;
  addMessage: (content: string, fileAttachment?: Message['fileAttachment'], customTimestamp?: number) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  updateMessage: (id: string, data: Partial<Message>) => Promise<void>;
  createCompany: (name: string) => Promise<void>;
  selectCompany: (id: string) => void;
  updateCompany: (id: string, data: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  addCompanyEmail: (companyId: string, email: string, jobPosition?: string, preference?: UrgencyLevel) => Promise<void>;
  deleteCompanyEmail: (emailId: string) => Promise<void>;
  addCompanyPhone: (companyId: string, phone: string) => Promise<void>;
  deleteCompanyPhone: (phoneId: string) => Promise<void>;
  addCompanyContact: (companyId: string, name: string) => Promise<void>;
  deleteCompanyContact: (contactId: string) => Promise<void>;
  addJobPosition: (title: string) => Promise<void>;
  deleteJobPosition: (title: string) => Promise<void>;
  isLoading: boolean;
  availableJobPositions: string[];
  availableInProgressStates: string[];
  addInProgressState: (description: string) => Promise<void>;
  deleteInProgressState: (description: string) => Promise<void>;
  addCompanyInProgressState: (companyId: string, description: string) => Promise<void>;
  deleteCompanyInProgressState: (companyId: string, stateId: string) => Promise<void>;
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
  const [availableJobPositions, setAvailableJobPositions] = useState<string[]>([]);
  const [availableInProgressStates, setAvailableInProgressStates] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobPositions = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('job_positions')
        .select('title')
        .order('title', { ascending: true });
      
      if (error) {
        console.error('Error fetching job positions:', error);
        return;
      }
      
      if (data) {
        setAvailableJobPositions(data.map(job => job.title));
      }
    };
    
    fetchJobPositions();
  }, [user]);

  useEffect(() => {
    const fetchInProgressStates = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('in_progress_states')
        .select('description')
        .order('description', { ascending: true });
      
      if (error) {
        console.error('Error fetching in progress states:', error);
        return;
      }
      
      if (data) {
        setAvailableInProgressStates(data.map(state => state.description));
      }
    };
    
    fetchInProgressStates();
  }, [user]);
  
  useEffect(() => {
    const addDefaultInProgressStates = async () => {
      if (!user || availableInProgressStates.length > 0) return;
      
      const defaultStates = [
        "Aguardando resposta",
        "Em negociação",
        "Entrevista marcada",
        "Entrevista técnica",
        "Proposta enviada",
        "Aguardando feedback",
        "Contrato em análise",
        "Finalizado",
        "Recusado"
      ];
      
      for (const state of defaultStates) {
        await addInProgressStateToDatabase(state);
      }
      
      queryClient.invalidateQueries({ queryKey: ['inProgressStates'] });
    };
    
    addDefaultInProgressStates();
  }, [user, availableInProgressStates.length]);
  
  const { 
    data: companies = [], 
    isLoading: isLoadingCompanies 
  } = useQuery({
    queryKey: ['companies', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (companiesError) {
        toast.error(`Erro ao carregar empresas: ${companiesError.message}`);
        throw companiesError;
      }
      
      const companiesWithDetails = await Promise.all(
        companiesData.map(async (company) => {
          const { data: companyDetailsData, error: companyDetailsError } = await supabase
            .from('companies')
            .select('job_position, urgency, in_progress')
            .eq('id', company.id)
            .single();
            
          const jobPosition = companyDetailsData?.job_position || null;
          const urgency = companyDetailsData?.urgency as UrgencyLevel | undefined;
          const inProgress = companyDetailsData?.in_progress || null;
          
          const { data: emailsData, error: emailsError } = await supabase
            .from('company_emails')
            .select('*')
            .eq('company_id', company.id);
          
          if (emailsError) {
            console.error('Error fetching emails:', emailsError);
          }
          
          const { data: phonesData, error: phonesError } = await supabase
            .from('company_phones')
            .select('*')
            .eq('company_id', company.id);
          
          if (phonesError) {
            console.error('Error fetching phones:', phonesError);
          }
          
          const { data: contactsData, error: contactsError } = await supabase
            .from('company_contacts')
            .select('*')
            .eq('company_id', company.id);
          
          if (contactsError) {
            console.error('Error fetching contacts:', contactsError);
          }

          const { data: inProgressStatesData, error: inProgressStatesError } = await supabase
            .from('company_in_progress')
            .select('*')
            .eq('company_id', company.id);
          
          if (inProgressStatesError) {
            console.error('Error fetching in progress states:', inProgressStatesError);
          }
          
          return {
            id: company.id,
            name: company.name,
            jobPosition: jobPosition,
            urgency: urgency as UrgencyLevel,
            inProgress: inProgress,
            emails: emailsData?.map(email => ({
              id: email.id,
              email: email.email,
              jobPosition: email.job_position,
              preference: email.preference as UrgencyLevel | undefined
            })) || [],
            phones: phonesData?.map(phone => ({
              id: phone.id,
              phone: phone.phone,
            })) || [],
            contacts: contactsData?.map(contact => ({
              id: contact.id,
              name: contact.name,
            })) || [],
            inProgressStates: inProgressStatesData?.map(state => ({
              id: state.id,
              description: state.description,
            })) || [],
            messages: []
          };
        })
      );
      
      return companiesWithDetails;
    },
    enabled: !!user
  });
  
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
  
  useEffect(() => {
    if (!activeCompany && companies.length > 0) {
      setActiveCompany(companies[0]);
    }
  }, [companies, activeCompany]);
  
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
  
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Company> }) => {
      const updateData: any = {};
      
      if (data.name) updateData.name = data.name;
      if (data.jobPosition !== undefined) updateData.job_position = data.jobPosition;
      if (data.urgency !== undefined) updateData.urgency = data.urgency;
      if (data.inProgress !== undefined) updateData.in_progress = data.inProgress;
      
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
  
  const addEmailMutation = useMutation({
    mutationFn: async ({ 
      companyId, 
      email, 
      jobPosition, 
      preference 
    }: { 
      companyId: string, 
      email: string, 
      jobPosition?: string, 
      preference?: UrgencyLevel 
    }) => {
      const { error } = await supabase
        .from('company_emails')
        .insert({ 
          company_id: companyId, 
          email,
          job_position: jobPosition,
          preference
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Email adicionado');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar email: ${error.message}`);
    }
  });
  
  const deleteEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const { error } = await supabase
        .from('company_emails')
        .delete()
        .eq('id', emailId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Email removido');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover email: ${error.message}`);
    }
  });
  
  const addPhoneMutation = useMutation({
    mutationFn: async ({ companyId, phone }: { companyId: string, phone: string }) => {
      const { error } = await supabase
        .from('company_phones')
        .insert({ company_id: companyId, phone });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Telefone adicionado');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar telefone: ${error.message}`);
    }
  });
  
  const deletePhoneMutation = useMutation({
    mutationFn: async (phoneId: string) => {
      const { error } = await supabase
        .from('company_phones')
        .delete()
        .eq('id', phoneId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Telefone removido');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover telefone: ${error.message}`);
    }
  });
  
  const addContactMutation = useMutation({
    mutationFn: async ({ companyId, name }: { companyId: string, name: string }) => {
      const { error } = await supabase
        .from('company_contacts')
        .insert({ company_id: companyId, name });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Contato adicionado');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar contato: ${error.message}`);
    }
  });
  
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('company_contacts')
        .delete()
        .eq('id', contactId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Contato removido');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover contato: ${error.message}`);
    }
  });
  
  const addMessageMutation = useMutation({
    mutationFn: async ({ 
      content, 
      fileAttachment,
      customTimestamp
    }: { 
      content: string, 
      fileAttachment?: Message['fileAttachment'],
      customTimestamp?: number
    }) => {
      if (!user || !activeCompany) return;
      
      let fileData = null;
      
      if (fileAttachment) {
        const fileName = fileAttachment.name;
        const fileUrl = fileAttachment.url;
        const fileType = fileAttachment.type;
        
        fileData = { file_name: fileName, file_url: fileUrl, file_type: fileType };
      }
      
      const timestamp = customTimestamp 
        ? new Date(customTimestamp).toISOString() 
        : new Date().toISOString();
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: content.trim() || (fileAttachment ? '📎 Arquivo anexado' : ''),
          company_id: activeCompany.id,
          user_id: user.id,
          timestamp,
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

  const addJobPositionMutation = useMutation({
    mutationFn: async (title: string) => {
      return await addJobPositionToDatabase(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
      refreshJobPositions();
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar vaga: ${error.message}`);
    }
  });

  const deleteJobPositionMutation = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase
        .from('job_positions')
        .delete()
        .eq('title', title);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
      refreshJobPositions();
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover vaga: ${error.message}`);
    }
  });

  const addJobPositionToDatabase = async (title: string) => {
    const { data: existingPosition } = await supabase
      .from('job_positions')
      .select('*')
      .eq('title', title)
      .single();

    if (existingPosition) {
      return existingPosition;
    }

    const { data, error } = await supabase
      .from('job_positions')
      .insert({ title })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const refreshJobPositions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('job_positions')
      .select('title')
      .order('title', { ascending: true });
    
    if (error) {
      console.error('Error fetching job positions:', error);
      return;
    }
    
    if (data) {
      setAvailableJobPositions(data.map(job => job.title));
    }
  };

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
    
    if (activeCompany && activeCompany.id === id) {
      setActiveCompany(prev => prev ? { ...prev, ...data } : prev);
    }
  };

  const deleteCompany = async (id: string) => {
    if (companies.length <= 1) {
      toast.error('Não é possível excluir a única empresa');
      return;
    }
    
    await deleteCompanyMutation.mutateAsync(id);
    
    if (activeCompany && activeCompany.id === id) {
      const nextCompany = companies.find(c => c.id !== id);
      setActiveCompany(nextCompany || null);
    }
  };

  const addCompanyEmail = async (companyId: string, email: string, jobPosition?: string, preference?: UrgencyLevel) => {
    if (!email.trim()) return;
    await addEmailMutation.mutateAsync({ companyId, email, jobPosition, preference });
  };

  const deleteCompanyEmail = async (emailId: string) => {
    await deleteEmailMutation.mutateAsync(emailId);
  };

  const addCompanyPhone = async (companyId: string, phone: string) => {
    if (!phone.trim()) return;
    await addPhoneMutation.mutateAsync({ companyId, phone });
  };

  const deleteCompanyPhone = async (phoneId: string) => {
    await deletePhoneMutation.mutateAsync(phoneId);
  };

  const addCompanyContact = async (companyId: string, name: string) => {
    if (!name.trim()) return;
    await addContactMutation.mutateAsync({ companyId, name });
  };

  const deleteCompanyContact = async (contactId: string) => {
    await deleteContactMutation.mutateAsync(contactId);
  };

  const addMessage = async (content: string, fileAttachment?: Message['fileAttachment'], customTimestamp?: number) => {
    if ((!content.trim() && !fileAttachment) || !activeCompany) return;
    await addMessageMutation.mutateAsync({ content, fileAttachment, customTimestamp });
  };

  const updateMessage = async (id: string, data: Partial<Message>) => {
    await updateMessageMutation.mutateAsync({ id, data });
  };

  const deleteMessage = async (id: string) => {
    await deleteMessageMutation.mutateAsync(id);
  };

  const addJobPosition = async (title: string) => {
    if (!title.trim()) return;
    await addJobPositionMutation.mutateAsync(title);
  };

  const deleteJobPosition = async (title: string) => {
    await deleteJobPositionMutation.mutateAsync(title);
  };

  const addInProgressStateMutation = useMutation({
    mutationFn: async (description: string) => {
      return await addInProgressStateToDatabase(description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inProgressStates'] });
      refreshInProgressStates();
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar estado: ${error.message}`);
    }
  });

  const deleteInProgressStateMutation = useMutation({
    mutationFn: async (description: string) => {
      const { error } = await supabase
        .from('in_progress_states')
        .delete()
        .eq('description', description);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inProgressStates'] });
      refreshInProgressStates();
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover estado: ${error.message}`);
    }
  });

  const addCompanyInProgressStateMutation = useMutation({
    mutationFn: async ({ companyId, description }: { companyId: string, description: string }) => {
      const { error } = await supabase
        .from('company_in_progress')
        .insert({ company_id: companyId, description });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Estado adicionado');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar estado: ${error.message}`);
    }
  });

  const deleteCompanyInProgressStateMutation = useMutation({
    mutationFn: async ({ companyId, stateId }: { companyId: string, stateId: string }) => {
      const { error } = await supabase
        .from('company_in_progress')
        .delete()
        .eq('id', stateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Estado removido');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover estado: ${error.message}`);
    }
  });

  const addInProgressStateToDatabase = async (description: string) => {
    const { data: existingState } = await supabase
      .from('in_progress_states')
      .select('*')
      .eq('description', description)
      .single();

    if (existingState) {
      return existingState;
    }

    const { data, error } = await supabase
      .from('in_progress_states')
      .insert({ description })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const refreshInProgressStates = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('in_progress_states')
      .select('description')
      .order('description', { ascending: true });
    
    if (error) {
      console.error('Error fetching in progress states:', error);
      return;
    }
    
    if (data) {
      setAvailableInProgressStates(data.map(state => state.description));
    }
  };

  const addInProgressState = async (description: string) => {
    if (!description.trim()) return;
    await addInProgressStateMutation.mutateAsync(description);
  };

  const deleteInProgressState = async (description: string) => {
    await deleteInProgressStateMutation.mutateAsync(description);
  };

  const addCompanyInProgressState = async (companyId: string, description: string) => {
    if (!description.trim()) return;
    await addCompanyInProgressStateMutation.mutateAsync({ companyId, description });
  };

  const deleteCompanyInProgressState = async (companyId: string, stateId: string) => {
    await deleteCompanyInProgressStateMutation.mutateAsync({ companyId, stateId });
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
        addCompanyEmail,
        deleteCompanyEmail,
        addCompanyPhone,
        deleteCompanyPhone,
        addCompanyContact,
        deleteCompanyContact,
        addJobPosition,
        deleteJobPosition,
        isLoading: isLoadingCompanies || isLoadingMessages,
        availableJobPositions,
        availableInProgressStates,
        addInProgressState,
        deleteInProgressState,
        addCompanyInProgressState,
        deleteCompanyInProgressState
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
