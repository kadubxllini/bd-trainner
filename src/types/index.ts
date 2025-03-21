
export interface Message {
  id: string;
  content: string;
  timestamp: number;
  fileAttachment?: {
    name: string;
    url: string;
    type: string;
  };
}

export interface Company {
  id: string;
  name: string;
  jobPosition: string | null;
  urgency: UrgencyLevel;
  inProgress: string | null;
  emails: CompanyEmail[];
  phones: CompanyPhone[];
  contacts: CompanyContact[];
  inProgressStates: InProgressState[];
  messages: Message[];
}

export interface CompanyEmail {
  id: string;
  email: string;
  jobPosition?: string;
  preference?: UrgencyLevel;
}

export interface CompanyPhone {
  id: string;
  phone: string;
}

export interface CompanyContact {
  id: string;
  name: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'Baixa' | 'Média' | 'Alta';

export interface InProgressState {
  id: string;
  description: string;
}
