
export type Theme = 'Trabalho' | 'Saúde' | 'Pessoal';

export interface Message {
  id: string;
  content: string;
  timestamp: number;
  theme: Theme;
  isTask: boolean;
  isCompleted?: boolean;
}
