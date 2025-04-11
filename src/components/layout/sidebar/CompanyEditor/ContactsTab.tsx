
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Trash } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContactsTabProps {
  company: Company;
  newContact: string;
  setNewContact: (value: string) => void;
  onAddContact: () => void;
  onDeleteContact: (contactId: string) => void;
}

export function ContactsTab({
  company,
  newContact,
  setNewContact,
  onAddContact,
  onDeleteContact
}: ContactsTabProps) {
  const handleAddContact = () => {
    if (!newContact.trim()) {
      toast.error("Digite o nome do contato");
      return;
    }
    
    onAddContact();
  }
  
  return (
    <div className="space-y-4">
      {company.contacts && company.contacts.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Contatos cadastrados</h3>
          <ScrollArea className="h-[200px] pr-2">
            <div className="space-y-2">
              {company.contacts.map((contact) => (
                <div key={contact.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDeleteContact(contact.id)} 
                    className="h-7 w-7 hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4">
          Nenhum contato cadastrado
        </div>
      )}
      
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Adicionar novo contato</h3>
        <div className="space-y-2">
          <Input
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            placeholder="Nome do contato"
            className="w-full"
          />
          
          <Button className="w-full" onClick={handleAddContact}>
            Adicionar contato
          </Button>
        </div>
      </div>
    </div>
  );
}
