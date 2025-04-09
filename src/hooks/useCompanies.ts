import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Company, UrgencyLevel } from '@/types';
import * as companyService from '@/services/companyService';
import * as contactService from '@/services/contactService';
import * as inProgressService from '@/services/inProgressService';

export const useCompanies = (userId?: string) => {
  const queryClient = useQueryClient();
  
  const { 
    data: companies = [], 
    isLoading: isLoadingCompanies 
  } = useQuery({
    queryKey: ['companies', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const companiesData = await companyService.fetchCompanies(userId);
      
      const companiesWithDetails = await Promise.all(
        companiesData.map(async (company) => {
          let jobPositions = await companyService.fetchCompanyJobPositions(company.id);
          
          const companyDetailsData = await companyService.fetchCompanyDetails(company.id);
          const urgency = companyDetailsData?.urgency as UrgencyLevel | undefined;
          const inProgress = companyDetailsData?.in_progress || null;
          
          const emailsData = await companyService.fetchCompanyEmails(company.id);
          const phonesData = await companyService.fetchCompanyPhones(company.id);
          const contactsData = await companyService.fetchCompanyContacts(company.id);
          const inProgressStatesData = await companyService.fetchCompanyInProgressStates(company.id);

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
    enabled: !!userId
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error("Usuário não autenticado");
      return companyService.createCompany(name, userId);
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
      if (data.selector !== undefined) updateData.selector = data.selector;
      
      await companyService.updateCompanyDetails(id, updateData);
      
      if (data.jobPositions !== undefined) {
        await companyService.updateCompanyJobPositions(id, data.jobPositions);
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
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa removida');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover empresa: ${error.message}`);
    }
  });

  const addCompanyEmailMutation = useMutation({
    mutationFn: async ({ companyId, email, jobPosition, preference }: 
      { companyId: string, email: string, jobPosition?: string, preference?: UrgencyLevel }) => {
      await contactService.addCompanyEmail(companyId, email, jobPosition, preference);
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
    mutationFn: contactService.deleteCompanyEmail,
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
      await contactService.addCompanyPhone(companyId, phone);
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
    mutationFn: contactService.deleteCompanyPhone,
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
      await contactService.addCompanyContact(companyId, name);
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
    mutationFn: contactService.deleteCompanyContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Contato removido');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover contato: ${error.message}`);
    }
  });

  const addCompanyInProgressStateMutation = useMutation({
    mutationFn: async ({ companyId, state }: { companyId: string, state: string }) => {
      await inProgressService.addCompanyInProgressState(companyId, state);
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
      await inProgressService.deleteCompanyInProgressState(companyId, stateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Estado removido');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover estado: ${error.message}`);
    }
  });

  const createCompany = async (name: string) => {
    if (!name.trim()) return;
    await createCompanyMutation.mutateAsync(name);
  };

  const updateCompany = async (id: string, data: Partial<Company>) => {
    await updateCompanyMutation.mutateAsync({ id, data });
  };

  const deleteCompany = async (id: string) => {
    if (companies.length <= 1) {
      toast.error('Não é possível excluir a única empresa');
      return;
    }
    
    await deleteCompanyMutation.mutateAsync(id);
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

  return {
    companies,
    createCompany,
    updateCompany,
    deleteCompany,
    addCompanyEmail,
    deleteCompanyEmail,
    addCompanyPhone,
    deleteCompanyPhone,
    addCompanyContact,
    deleteCompanyContact,
    addCompanyInProgressState,
    deleteCompanyInProgressState,
    isLoadingCompanies
  };
};
