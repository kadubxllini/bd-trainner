
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
  jobPositions: string[]; // Changed from jobPosition to jobPositions array
  urgency: UrgencyLevel;
  inProgress: string | null;
  selector: string | null;
  emails: CompanyEmail[];
  phones: CompanyPhone[];
  contacts: CompanyContact[];
  inProgressStates: InProgressState[];
  messages: Message[];
  folderId: string | null; // New field to reference a folder
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

// New interface for folders
export interface Folder {
  id: string;
  name: string;
  color: string;
  companies?: Company[];
}

// Interfaces for RPC function responses
export interface JobPositionResponse {
  job_position: string;
}

export interface CompanyJobPositionsResult {
  success: boolean;
}
