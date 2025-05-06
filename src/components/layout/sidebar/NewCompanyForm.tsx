
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMessages } from "@/context/hooks/useMessageContext";
import { Folder } from "@/types";

interface NewCompanyFormProps {
  onCreateCompany: (name: string, folderId?: string | null) => void;
}

export const NewCompanyForm = ({ onCreateCompany }: NewCompanyFormProps) => {
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { folders } = useMessages();
  
  const handleCreateCompany = () => {
    if (newCompanyName.trim()) {
      onCreateCompany(newCompanyName, selectedFolderId);
      setNewCompanyName('');
      setSelectedFolderId(null);
      setShowNewCompanyForm(false);
    }
  };

  return (
    <div className="p-2">
      {showNewCompanyForm ? (
        <div className="flex flex-col gap-2">
          <Input
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            placeholder="Nome da empresa"
            className="h-9 text-sm"
          />
          
          {folders.length > 0 && (
            <Select value={selectedFolderId || ""} onValueChange={setSelectedFolderId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecione uma pasta (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem pasta</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center">
                      <div 
                        className="h-2 w-2 rounded-full mr-2"
                        style={{ backgroundColor: folder.color || '#8E9196' }}
                      />
                      {folder.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <div className="flex justify-end gap-2 mt-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowNewCompanyForm(false)}
            >
              Cancelar
            </Button>
            <Button 
              size="sm" 
              onClick={handleCreateCompany}
              className="bg-primary/80 hover:bg-primary"
              disabled={!newCompanyName.trim()}
            >
              Criar
            </Button>
          </div>
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
