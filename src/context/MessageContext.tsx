
import React, { createContext, useState } from 'react';
import { Company, Message } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import { useMessagesData } from '@/hooks/useMessages'; // Renamed import to avoid conflict
import { useJobPositions } from '@/hooks/useJobPositions';
import { useInProgressStates } from '@/hooks/useInProgressStates';
import { MessageContextProps } from './types/messageContextTypes';

const MessageContext = createContext<MessageContextProps | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  
  const { 
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
  } = useCompanies(user?.id);
  
  const {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    isLoadingMessages
  } = useMessagesData(activeCompany?.id); // Use the renamed import
  
  const {
    jobPositions: availableJobPositions,
    addJobPosition,
    deleteJobPosition
  } = useJobPositions();
  
  const {
    inProgressStates: availableInProgressStates,
    addInProgressState,
    deleteInProgressState,
    isLoadingInProgressStates
  } = useInProgressStates();

  const selectCompany = (id: string) => {
    const company = companies.find(c => c.id === id);
    if (company) {
      setActiveCompany(company);
      toast.success(`Empresa ${company.name} selecionada`);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        companies,
        activeCompany,
        messages,
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

// Export the context itself in case it's needed directly
export { MessageContext };

// Re-export the useMessages hook from the new file
export { useMessages } from './hooks/useMessageContext';
