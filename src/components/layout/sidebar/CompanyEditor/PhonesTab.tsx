
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Trash } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

interface PhonesTabProps {
  company: Company;
  newPhone: string;
  setNewPhone: (value: string) => void;
  onAddPhone: () => void;
  onDeletePhone: (phoneId: string) => void;
}

export function PhonesTab({
  company,
  newPhone,
  setNewPhone,
  onAddPhone,
  onDeletePhone
}: PhonesTabProps) {
  // Phone validation
  const handleAddPhone = () => {
    // Basic phone validation
    const phoneRegex = /^[0-9\s\(\)\-\+]+$/;
    
    if (!newPhone.trim()) {
      toast.error("Digite um número de telefone");
      return;
    }

    if (!phoneRegex.test(newPhone)) {
      toast.error("Formato de telefone inválido");
      return;
    }

    onAddPhone();
  }

  return (
    <div className="space-y-4">
      {company.phones.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Telefones cadastrados</h3>
          <div className="space-y-2">
            {company.phones.map((phone) => (
              <div key={phone.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{phone.phone}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDeletePhone(phone.id)} 
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
          Nenhum telefone cadastrado
        </div>
      )}
      
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Adicionar novo telefone</h3>
        <div className="space-y-2">
          <Input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Telefone"
            className="w-full"
          />
          
          <Button className="w-full" onClick={handleAddPhone}>
            Adicionar telefone
          </Button>
        </div>
      </div>
    </div>
  );
}
