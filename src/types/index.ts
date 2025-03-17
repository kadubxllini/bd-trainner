
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
  messages: Message[];
}

export type Theme = 'Trabalho' | 'Saúde' | 'Pessoal';
