
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewCompanyFormProps {
  onCreateCompany: (name: string) => void;
}

export const NewCompanyForm = ({ onCreateCompany }: NewCompanyFormProps) => {
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  const handleCreateCompany = () => {
    if (newCompanyName.trim()) {
      onCreateCompany(newCompanyName);
      setNewCompanyName('');
      setShowNewCompanyForm(false);
    }
  };

  return (
    <div className="p-2">
      {showNewCompanyForm ? (
        <div className="flex gap-2">
          <Input
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            placeholder="Nome da empresa"
            className="h-9 text-sm"
          />
          <Button 
            size="sm" 
            onClick={handleCreateCompany}
            className="bg-primary/80 hover:bg-primary"
          >
            Criar
          </Button>
        </div>
      ) : (
        <Button 
          className="w-full"
          size="sm"
          onClick={() => setShowNewCompanyForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Empresa
        </Button>
      )}
    </div>
  );
};
