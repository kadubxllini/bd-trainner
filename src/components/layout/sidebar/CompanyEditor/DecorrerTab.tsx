import React, { useState } from 'react';
import { useMessages } from '@/context/MessageContext';
import { Company } from '@/types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DecorrerTabProps {
  company: Company;
  availableInProgressStates: string[];
  onAddGlobalInProgressState?: (state: string) => Promise<void>;
  onDeleteGlobalInProgressState?: (state: string) => Promise<void>;
}

export function DecorrerTab({
  company,
  availableInProgressStates,
  onAddGlobalInProgressState,
  onDeleteGlobalInProgressState,
}: DecorrerTabProps) {
  const [newState, setNewState] = useState<string>('');
  const { addCompanyInProgressState, deleteCompanyInProgressState, addInProgressState, deleteInProgressState } = useMessages();

  const handleAddState = async () => {
    if (!newState.trim()) {
      toast.error("Digite um estado para adicionar");
      return;
    }

    try {
      if (onAddGlobalInProgressState) {
        await onAddGlobalInProgressState(newState);
      } else if (company && company.id) {
        await addCompanyInProgressState(company.id, newState);
      } else {
        await addInProgressState(newState);
      }

      setNewState('');
      toast.success('Estado adicionado com sucesso');
    } catch (error) {
      console.error('Error adding state:', error);
      toast.error('Erro ao adicionar estado');
    }
  };

  const handleDeleteState = async (stateId: string) => {
    try {
      if (company && company.id) {
        await deleteCompanyInProgressState(company.id, stateId);
        toast.success('Estado removido com sucesso');
      }
    } catch (error) {
      console.error('Error deleting state:', error);
      toast.error('Erro ao remover estado');
    }
  };

  const handleDeleteGlobalState = async (state: string) => {
    try {
      if (onDeleteGlobalInProgressState) {
        await onDeleteGlobalInProgressState(state);
      } else {
        await deleteInProgressState(state);
      }
      toast.success('Estado global removido com sucesso');
    } catch (error) {
      console.error('Error deleting global state:', error);
      toast.error('Erro ao remover estado global');
    }
  };

  // If being used in the global manager mode
  if (onAddGlobalInProgressState) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex gap-2">
          <Input
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            placeholder="Novo estado"
            className="flex-1"
          />
          <Button onClick={handleAddState}>Adicionar</Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Estados disponíveis</h3>
          <ScrollArea className="h-[200px] pr-3">
            {availableInProgressStates.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum estado cadastrado</p>
            ) : (
              <div className="space-y-2">
                {availableInProgressStates.map(state => (
                  <div key={state} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{state}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteGlobalState(state)} 
                      className="h-7 w-7 hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    );
  }

  // If being used in the company information tab
  return null;
}
