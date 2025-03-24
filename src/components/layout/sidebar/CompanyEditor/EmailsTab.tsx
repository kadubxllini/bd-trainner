
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Trash } from "lucide-react";
import { toast } from "sonner";

interface EmailsTabProps {
  company: Company;
  availableJobPositions: string[];
  newEmail: string;
  setNewEmail: (value: string) => void;
  newJobPosition: string;
  setNewJobPosition: (value: string) => void;
  newUrgency: string;
  setNewUrgency: (value: string) => void;
  onAddEmail: () => void;
  onDeleteEmail: (emailId: string) => void;
}

export function EmailsTab({
  company,
  newEmail,
  setNewEmail,
  onAddEmail,
  onDeleteEmail
}: EmailsTabProps) {
  const handleAddEmail = () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!newEmail.trim()) {
      toast.error("Digite um endereço de e-mail");
      return;
    }

    if (!emailRegex.test(newEmail)) {
      toast.error("Formato de e-mail inválido");
      return;
    }

    onAddEmail();
  }
  
  return (
    <div className="space-y-4">
      {company.emails && company.emails.length > 0 ? (
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
          
          <Button className="w-full" onClick={handleAddEmail}>
            Adicionar e-mail
          </Button>
        </div>
      </div>
    </div>
  );
}
