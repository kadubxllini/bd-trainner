
import { Company, CompanyEmail, UrgencyLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailsTabProps {
  company: Company;
  availableJobPositions: string[];
  newEmail: string;
  setNewEmail: (value: string) => void;
  newJobPosition: string;
  setNewJobPosition: (value: string) => void;
  newUrgency: UrgencyLevel;
  setNewUrgency: (value: UrgencyLevel) => void;
  onAddEmail: () => void;
  onDeleteEmail: (emailId: string) => void;
}

export function EmailsTab({
  company,
  availableJobPositions,
  newEmail,
  setNewEmail,
  newJobPosition,
  setNewJobPosition,
  newUrgency,
  setNewUrgency,
  onAddEmail,
  onDeleteEmail
}: EmailsTabProps) {
  const getUrgencyColor = (urgency?: UrgencyLevel) => {
    switch(urgency) {
      case 'Baixa': return 'bg-green-100 text-green-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIndicator = (urgency?: UrgencyLevel) => {
    switch(urgency) {
      case 'Baixa': 
      case 'low':
        return <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
      case 'Média':
      case 'medium':
        return <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>;
      case 'Alta':
      case 'high':
        return <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>;
      default: 
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {company.emails.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">E-mails cadastrados</h3>
          <div className="space-y-2">
            {company.emails.map((email) => (
              <div key={email.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{email.email}</span>
                  </div>
                  {email.jobPosition && (
                    <div className="text-xs text-muted-foreground ml-6">
                      Vaga: {email.jobPosition}
                    </div>
                  )}
                  {email.preference && (
                    <div className="ml-6 flex items-center text-xs">
                      <span className={`px-1.5 py-0.5 rounded-full ${getUrgencyColor(email.preference)} inline-flex items-center mt-1`}>
                        {getUrgencyIndicator(email.preference)}
                        <span>Urgência: {email.preference}</span>
                      </span>
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDeleteEmail(email.id)} 
                  className="h-7 w-7 hover:text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4">
          Nenhum e-mail cadastrado
        </div>
      )}
      
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Adicionar novo e-mail</h3>
        <div className="space-y-2">
          <Input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full"
          />
          
          <Select
            value={newJobPosition}
            onValueChange={setNewJobPosition}
          >
            <SelectTrigger>
              <SelectValue placeholder="Vaga (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhuma vaga</SelectItem>
              {availableJobPositions.map(job => (
                <SelectItem key={job} value={job}>{job}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={newUrgency}
            onValueChange={(value) => setNewUrgency(value as UrgencyLevel)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Urgência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Baixa" className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Baixa</span>
                </div>
              </SelectItem>
              <SelectItem value="Média" className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Média</span>
                </div>
              </SelectItem>
              <SelectItem value="Alta" className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Alta</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="w-full" onClick={onAddEmail}>
            Adicionar e-mail
          </Button>
        </div>
      </div>
    </div>
  );
}
