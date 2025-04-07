
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
  const { addCompanyInProgressState, deleteCompanyInProgressState } = useMessages();

  const handleAddState = async () => {
    if (!newState.trim()) {
      toast.error("Digite um estado para adicionar");
      return;
    }

    try {
      if (onAddGlobalInProgressState) {
        console.log("Adding global in-progress state via prop:", newState);
        await onAddGlobalInProgressState(newState);
      } else if (company && company.id) {
        console.log("Adding company-specific in-progress state:", newState);
        await addCompanyInProgressState(company.id, newState);
      } else {
        console.error("Company ID is undefined or company is null");
        toast.error("Erro ao identificar empresa");
        return;
      }

      setNewState('');
      toast.success('Estado adicionado com sucesso');
    } catch (error) {
      console.error('Error adding state:', error);
      toast.error('Erro ao adicionar estado');
    }
  };

  const handleDeleteState = async (stateId: string) => {
    if (!company || !company.id) {
      console.error("Company ID is undefined or company is null");
      toast.error("Erro ao identificar empresa");
      return;
    }

    try {
      console.log("Deleting company-specific in-progress state:", stateId);
      await deleteCompanyInProgressState(company.id, stateId);
      toast.success('Estado removido com sucesso');
    } catch (error) {
      console.error('Error deleting state:', error);
      toast.error('Erro ao remover estado');
    }
  };

  const handleDeleteGlobalState = async (state: string) => {
    try {
      if (onDeleteGlobalInProgressState) {
        console.log("Deleting global in-progress state via prop:", state);
        await onDeleteGlobalInProgressState(state);
      } else {
        console.error("onDeleteGlobalInProgressState is not defined, but attempting to delete global state");
        toast.error("Operação não permitida");
        return;
      }
      
      toast.success('Estado global removido com sucesso');
    } catch (error) {
      console.error('Error deleting global state:', error);
      toast.error('Erro ao remover estado global');
    }
  };

  if (onAddGlobalInProgressState) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex gap-2">
          <Input
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            placeholder="Novo estado"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddState();
              }
            }}
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

  return (
    <div className="space-y-4 py-4">
      <div className="flex gap-2">
        <Input
          value={newState}
          onChange={(e) => setNewState(e.target.value)}
          placeholder="Novo estado para esta empresa"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddState();
            }
          }}
        />
        <Button onClick={handleAddState}>Adicionar</Button>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Estados desta empresa</h3>
        <ScrollArea className="h-[200px] pr-3">
          {company.inProgressStates && company.inProgressStates.length > 0 ? (
            <div className="space-y-2">
              {company.inProgressStates.map(state => (
                <div key={state.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{state.description}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteState(state.id)} 
                    className="h-7 w-7 hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum estado adicionado para esta empresa</p>
          )}
        </ScrollArea>
      </div>
      
      <div className="space-y-2 mt-6">
        <h3 className="text-sm font-medium">Estados disponíveis globalmente</h3>
        <ScrollArea className="h-[150px] pr-3">
          {availableInProgressStates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum estado global cadastrado</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableInProgressStates.map(state => (
                <Badge key={state} variant="secondary" className="flex items-center gap-1 bg-primary/20 text-xs">
                  <Clock className="h-3 w-3" />
                  {state}
                </Badge>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
