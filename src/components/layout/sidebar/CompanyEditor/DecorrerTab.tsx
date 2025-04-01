
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface DecorrerTabProps {
  company: Company;
  availableInProgressStates: string[];
  onAddGlobalInProgressState: (state: string) => void;
  onDeleteGlobalInProgressState: (state: string) => void;
}

export function DecorrerTab({
  company,
  availableInProgressStates,
  onAddGlobalInProgressState,
  onDeleteGlobalInProgressState
}: DecorrerTabProps) {
  const [newState, setNewState] = useState('');

  const handleAddState = () => {
    if (!newState.trim()) {
      toast.error("Digite o nome do estado");
      return;
    }
    
    onAddGlobalInProgressState(newState);
    setNewState('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Adicionar novo estado</label>
        <div className="flex gap-2">
          <Input
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            placeholder="Nome do estado"
            className="flex-1"
          />
          <Button onClick={handleAddState}>
            Adicionar
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Estados disponíveis</h3>
        <ScrollArea className="h-[300px] pr-3">
          {availableInProgressStates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center p-4">Nenhum estado cadastrado</p>
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
                    onClick={() => onDeleteGlobalInProgressState(state)} 
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
