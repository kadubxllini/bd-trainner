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

export type UrgencyLevel = 'Baixa' | 'Média' | 'Alta' | 'low' | 'medium' | 'high';

export interface InProgressState {
  id: string;
  state: string;
}

export interface Company {
  id: string;
  name: string;
  jobPositions: string[];
  urgency: UrgencyLevel;
  emails: CompanyEmail[];
  phones: CompanyPhone[];
  contacts: CompanyContact[];
  messages: Message[];
  inProgress?: string;
  inProgressStates: InProgressState[];
}

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
