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
  availableJobPositions: string[];
  availableInProgressStates: string[];
  addInProgressState: (state: string) => Promise<void>;
  deleteInProgressState: (state: string) => Promise<void>;
  addCompanyInProgressState: (companyId: string, state: string) => Promise<void>;
  deleteCompanyInProgressState: (companyId: string, stateId: string) => Promise<void>;
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
        .select('state')
        .order('state', { ascending: true });
      
      if (error) {
        console.error('Error fetching in progress states:', error);
        return;
      }
      
      if (data) {
        setAvailableInProgressStates(data.map(item => item.state));
      }
    };
    
    fetchInProgressStates();
  }, [user]);
  
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
          const inProgress = companyDetailsData?.in_progress || undefined;
          
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
            .from('company_in_progress_states')
            .select('*')
            .eq('company_id', company.id);
            
          if (inProgressStatesError) {
            console.error('Error fetching in progress states:', inProgressStatesError);
          }

          return {
            id: company.id,
            name: company.name,
            jobPositions: jobPosition ? [jobPosition] : [], // Convert old jobPosition to array
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
              state: state.state,
            })) || [],
            messages: []
          };
        })
      );
      
      return companiesWithDetails;
    },
    enabled: !!user
  });
  
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
      if (data.jobPositions !== undefined) {
        // Store only the first job position in the old field for backward compatibility
        updateData.job_position = data.jobPositions.length > 0 ? data.jobPositions[0] : null;
      }
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
  
  const addInProgressStateMutation = useMutation({
    mutationFn: async (state: string) => {
      return await addInProgressStateToDatabase(state);
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
    mutationFn: async (state: string) => {
      const { error } = await supabase
        .from('in_progress_states')
        .delete()
        .eq('state', state);
      
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
    mutationFn: async ({ companyId, state }: { companyId: string, state: string }) => {
      const { error } = await supabase
        .from('company_in_progress_states')
        .insert({ company_id: companyId, state });
      
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
        .from('company_in_progress_states')
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

  const addInProgressStateToDatabase = async (state: string) => {
    const { data: existingState } = await supabase
      .from('in_progress_states')
      .select('*')
      .eq('state', state)
      .single();

    if (existingState) {
      return existingState;
    }

    const { data, error } = await supabase
      .from('in_progress_states')
      .insert({ state })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const refreshInProgressStates = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('in_progress_states')
      .select('state')
      .order('state', { ascending: true });
    
    if (error) {
      console.error('Error fetching in progress states:', error);
      return;
    }
    
    if (data) {
      setAvailableInProgressStates(data.map(item => item.state));
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
    await addCompanyEmailMutation.mutateAsync({ companyId, email, jobPosition, preference });
  };

  const deleteCompanyEmail = async (emailId: string) => {
    await deleteCompanyEmailMutation.mutateAsync(emailId);
  };

  const addCompanyPhone = async (companyId: string, phone: string) => {
    if (!phone.trim()) return;
    await addCompanyPhoneMutation.mutateAsync({ companyId, phone });
  };

  const deleteCompanyPhone = async (phoneId: string) => {
    await deleteCompanyPhoneMutation.mutateAsync(phoneId);
  };

  const addCompanyContact = async (companyId: string, name: string) => {
    if (!name.trim()) return;
    await addCompanyContactMutation.mutateAsync({ companyId, name });
  };

  const deleteCompanyContact = async (contactId: string) => {
    await deleteCompanyContactMutation.mutateAsync(contactId);
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

  const addInProgressState = async (state: string) => {
    if (!state.trim()) return;
    await addInProgressStateMutation.mutateAsync(state);
  };

  const deleteInProgressState = async (state: string) => {
    await deleteInProgressStateMutation.mutateAsync(state);
  };

  const addCompanyInProgressState = async (companyId: string, state: string) => {
    if (!state.trim()) return;
    await addCompanyInProgressStateMutation.mutateAsync({ companyId, state });
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
        availableJobPositions,
        availableInProgressStates,
        addInProgressState,
        deleteInProgressState,
        addCompanyInProgressState,
        deleteCompanyInProgressState,
        isLoading: isLoadingCompanies || isLoadingMessages,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
