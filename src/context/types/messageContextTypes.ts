
import { Company, Message, UrgencyLevel } from '@/types';

export interface MessageContextProps {
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
