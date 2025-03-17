
export interface Message {
  id: string;
  content: string;
  timestamp: number;
}

export interface Company {
  id: string;
  name: string;
  messages: Message[];
}

export type Theme = 'Trabalho' | 'Saúde' | 'Pessoal';
