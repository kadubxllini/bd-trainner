
export interface Message {
  id: string;
  content: string;
  timestamp: number;
  fileAttachment?: {
    name: string;
    url: string;
    type: string;
  };
  theme?: Theme;
}

export interface CompanyEmail {
  id: string;
  email: string;
  jobPosition?: string;
  preference?: string;
}

export interface CompanyPhone {
  id: string;
  phone: string;
}

export interface CompanyContact {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  emails: CompanyEmail[];
  phones: CompanyPhone[];
  contacts: CompanyContact[];
  messages: Message[];
}

export type Theme = 'Trabalho' | 'Saúde' | 'Pessoal';
