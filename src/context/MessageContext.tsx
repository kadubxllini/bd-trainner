
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, Company, CompanyEmail, CompanyPhone, CompanyContact, UrgencyLevel, InProgressState } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MessageContextProps {
  companies: Company[];
  activeCompany: Company | null;
  messages: Message[];
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

  const { 
    data: inProgressStatesData = [],
    isLoading: isLoadingInProgressStates,
    refetch: refetchInProgressStates
  } = useQuery({
    queryKey: ['inProgressStates'],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('in_progress_states')
          .select('description')
          .order('description', { ascending: true });
        
        if (error) {
          console.error('Error fetching in progress states:', error);
          return [];
        }
        
        if (data) {
          const descriptions = data.map(item => item.description);
          setAvailableInProgressStates(descriptions);
          console.log("Fetched in-progress states:", descriptions);
          return descriptions;
        }
        
        return [];
      } catch (err) {
        console.error('Exception fetching in progress states:', err);
        return [];
      }
    },
    enabled: !!user
  });

  useEffect(() => {
    if (inProgressStatesData.length > 0) {
      setAvailableInProgressStates(inProgressStatesData);
    }
  }, [inProgressStatesData]);
  
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
          // Fetch job positions from the company_job_positions table
          const { data: jobPositionsData, error: jobPositionsError } = await supabase
            .from('company_job_positions')
            .select('job_position')
            .eq('company_id', company.id);
          
          if (jobPositionsError) {
            console.error('Error fetching job positions:', jobPositionsError);
          }
          
          // Combine job positions from the new table and legacy field
          const jobPositions = jobPositionsData?.map(item => item.job_position) || [];
          if (company.job_position && !jobPositions.includes(company.job_position)) {
            jobPositions.push(company.job_position);
          }
          
          const { data: companyDetailsData } = await supabase
            .from('companies')
            .select('urgency, in_progress')
            .eq('id', company.id)
            .single();
            
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
            .from('company_in_progress')
            .select('*')
            .eq('company_id', company.id);
            
          if (inProgressStatesError) {
            console.error('Error fetching in progress states:', inProgressStatesError);
          }

          return {
            id: company.id,
            name: company.name,
            jobPositions: jobPositions,
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
    data: messagesData = [], 
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
        console.error('Error fetching messages:', error);
        toast.error(`Erro ao carregar mensagens: ${error.message}`);
        return [];
      }
      
      return data.map(message => ({
        id: message.id,
        content: message.content,
        timestamp: new Date(message.timestamp).getTime(),
        fileAttachment: message.file_url ? {
          name: message.file_name || 'arquivo',
          url: message.file_url,
          type: message.file_type || ''
        } : undefined
      }));
    },
    enabled: !!user && !!activeCompany
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
      if (data.urgency !== undefined) updateData.urgency = data.urgency;
      if (data.inProgress !== undefined) updateData.in_progress = data.inProgress;
      
      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Handle job positions separately using the new company_job_positions table
      if (data.jobPositions !== undefined) {
        // Delete existing job positions
        const { error: deletePositionsError } = await supabase
          .from('company_job_positions')
          .delete()
          .eq('company_id', id);
        
        if (deletePositionsError) {
          console.error('Error deleting job positions:', deletePositionsError);
          throw deletePositionsError;
        }
        
        // Add new job positions if any
        if (data.jobPositions.length > 0) {
          const positionsToInsert = data.jobPositions.map(position => ({
            company_id: id,
            job_position: position
          }));
          
          // Insert each position separately to avoid type issues
          for (const position of positionsToInsert) {
            const { error: insertError } = await supabase
              .from('company_job_positions')
              .insert(position);
            
            if (insertError) {
              console.error('Error inserting job position:', insertError);
              throw insertError;
            }
          }
        }
      }
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
      const { data, error } = await addInProgressStateToDatabase(state);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      console.log("Successfully added in-progress state");
      queryClient.invalidateQueries({ queryKey: ['inProgressStates'] });
      refetchInProgressStates();
    },
    onError: (error: any) => {
      console.error("Error in addInProgressStateMutation:", error);
      toast.error(`Erro ao adicionar estado: ${error.message}`);
    }
  });
  
  const deleteInProgressStateMutation = useMutation({
    mutationFn: async (state: string) => {
      console.log("Deleting state from database:", state);
      const { error } = await supabase
        .from('in_progress_states')
        .delete()
        .eq('description', state);
      
      if (error) throw error;
    },
    onSuccess: () => {
      console.log("Successfully deleted in-progress state");
      queryClient.invalidateQueries({ queryKey: ['inProgressStates'] });
      refetchInProgressStates();
    },
    onError: (error: any) => {
      console.error("Error in deleteInProgressStateMutation:", error);
      toast.error(`Erro ao remover estado: ${error.message}`);
    }
  });

  const addCompanyInProgressStateMutation = useMutation({
    mutationFn: async ({ companyId, state }: { companyId: string, state: string }) => {
      console.log(`Adding in-progress state '${state}' to company with ID ${companyId}`);
      
      if (!state.trim()) {
        throw new Error("Estado não pode estar vazio");
      }
      
      if (!companyId) {
        throw new Error("ID da empresa não fornecido");
      }

      const { error } = await supabase
        .from('company_in_progress')
        .insert({ company_id: companyId, description: state });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Estado adicionado à empresa');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar estado à empresa: ${error.message}`);
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

  const addInProgressStateToDatabase = async (state: string) => {
    console.log("Adding state to database:", state);
    
    try {
      const { data: existingState, error: checkError } = await supabase
        .from('in_progress_states')
        .select('*')
        .eq('description', state)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing state:", checkError);
        return { error: checkError };
      }

      if (existingState) {
        console.log("State already exists:", existingState);
        return { data: existingState, error: null };
      }

      console.log("Adding new state to database:", state);
      const { data, error } = await supabase
        .from('in_progress_states')
        .insert({ description: state })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding state to database:", error);
        return { error };
      }
      
      console.log("State added successfully:", data);
      
      await refreshInProgressStates();
      
      return { data, error: null };
    } catch (err) {
      console.error("Exception in addInProgressStateToDatabase:", err);
      return { data: null, error: err };
    }
  };

  const refreshInProgressStates = async () => {
    console.log("Refreshing in-progress states...");
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('in_progress_states')
        .select('description')
        .order('description', { ascending: true });
      
      if (error) {
        console.error('Error fetching in progress states:', error);
        return;
      }
      
      if (data) {
        const descriptions = data.map(item => item.description);
        console.log("Refreshed in-progress states:", descriptions);
        setAvailableInProgressStates(descriptions);
      }
    } catch (err) {
      console.error("Error refreshing in-progress states:", err);
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
    if (!state.trim()) {
      toast.error("Digite um estado para adicionar");
      return;
    }
    
    console.log("Adding in-progress state:", state);
    try {
      await addInProgressStateMutation.mutateAsync(state);
      await refreshInProgressStates();
    } catch (error) {
      console.error("Error in addInProgressState:", error);
      toast.error(`Erro ao adicionar estado: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }
  };

  const deleteInProgressState = async (state: string) => {
    console.log("Deleting in-progress state:", state);
    try {
      await deleteInProgressStateMutation.mutateAsync(state);
      await refreshInProgressStates();
    } catch (error) {
      console.error("Error in deleteInProgressState:", error);
      toast.error(`Erro ao remover estado: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }
  };

  const addCompanyInProgressState = async (companyId: string, state: string) => {
    if (!state.trim()) {
      toast.error("Digite um estado para adicionar");
      return;
    }
    
    if (!companyId) {
      toast.error("ID da empresa não fornecido");
      return;
    }
    
    console.log(`Adding in-progress state '${state}' to company with ID ${companyId}`);
    await addCompanyInProgressStateMutation.mutateAsync({ companyId, state });
  };

  const deleteCompanyInProgressState = async (companyId: string, stateId: string) => {
    await deleteCompanyInProgressStateMutation.mutateAsync({ companyId, stateId });
  };

  const addCompanyEmailMutation = useMutation({
    mutationFn: async ({ companyId, email, jobPosition, preference }: 
      { companyId: string, email: string, jobPosition?: string, preference?: UrgencyLevel }) => {
      const { error } = await supabase
        .from('company_emails')
        .insert({ company_id: companyId, email, job_position: jobPosition, preference });
      
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

  const deleteCompanyEmailMutation = useMutation({
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

  const addCompanyPhoneMutation = useMutation({
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

  const deleteCompanyPhoneMutation = useMutation({
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

  const addCompanyContactMutation = useMutation({
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

  const deleteCompanyContactMutation = useMutation({
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
    mutationFn: async ({ content, fileAttachment, customTimestamp }: 
      { content: string, fileAttachment?: Message['fileAttachment'], customTimestamp?: number }) => {
      if (!activeCompany || !user) throw new Error("No active company or user");

      const messageData = {
        content,
        company_id: activeCompany.id,
        user_id: user.id,
        timestamp: customTimestamp ? new Date(customTimestamp).toISOString() : new Date().toISOString(),
        file_name: fileAttachment?.name,
        file_url: fileAttachment?.url,
        file_type: fileAttachment?.type
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    }
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Message> }) => {
      const updateData: any = {};
      
      if (data.content !== undefined) updateData.content = data.content;
      
      const { error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
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
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Mensagem removida');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover mensagem: ${error.message}`);
    }
  });

  const addJobPositionMutation = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase
        .from('job_positions')
        .insert({ title });
      
      if (error) throw error;
      
      const { data } = await supabase
        .from('job_positions')
        .select('title')
        .order('title', { ascending: true });
      
      if (data) {
        setAvailableJobPositions(data.map(job => job.title));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
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
      
      const { data } = await supabase
        .from('job_positions')
        .select('title')
        .order('title', { ascending: true });
      
      if (data) {
        setAvailableJobPositions(data.map(job => job.title));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover vaga: ${error.message}`);
    }
  });

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

  return (
    <MessageContext.Provider
      value={{
        companies,
        activeCompany,
        messages: messagesData,
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
        isLoading: isLoadingCompanies || isLoadingMessages || isLoadingInProgressStates,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
