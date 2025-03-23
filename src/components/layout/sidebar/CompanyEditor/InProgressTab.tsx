
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InProgressTabProps {
  company: Company;
  newInProgressState: string;
  setNewInProgressState: (value: string) => void;
  onAddInProgressState: () => void;
  onDeleteInProgressState: (stateId: string) => void;
}

export function InProgressTab({
  company,
  newInProgressState,
  setNewInProgressState,
  onAddInProgressState,
  onDeleteInProgressState
}: InProgressTabProps) {
  const handleAddInProgressState = () => {
    if (!newInProgressState.trim()) {
      toast.error("Digite a descrição do estado");
      return;
    }
    
    onAddInProgressState();
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Adicionar novo estado</label>
        <div className="flex gap-2">
          <Input
            value={newInProgressState}
            onChange={(e) => setNewInProgressState(e.target.value)}
            placeholder="Descrição do estado"
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleAddInProgressState}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {company.inProgressStates && company.inProgressStates.length > 0 ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Estados em decorrer</label>
          <ScrollArea className="h-[200px] p-2 border rounded-md">
            <div className="space-y-2">
              {company.inProgressStates.map((state) => (
                <div key={state.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                  <div className="flex items-center gap-2 flex-1">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{state.description}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDeleteInProgressState(state.id)} 
                    className="h-7 w-7 hover:text-destructive flex-shrink-0"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4 border rounded-md p-2">
          Nenhum estado em decorrer cadastrado
        </div>
      )}
    </div>
  );
}
