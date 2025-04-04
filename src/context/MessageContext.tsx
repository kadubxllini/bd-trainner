
import React, { createContext, useContext, useState } from 'react';
import { Company, Message } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import { useMessages } from '@/hooks/useMessages';
import { useJobPositions } from '@/hooks/useJobPositions';
import { useInProgressStates } from '@/hooks/useInProgressStates';

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

// Import missing UrgencyLevel type
import { UrgencyLevel } from '@/types';

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
  } = useMessages(activeCompany?.id);
  
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

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};
