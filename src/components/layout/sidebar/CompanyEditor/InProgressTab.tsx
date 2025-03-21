
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Trash } from "lucide-react";

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
  return (
    <div className="space-y-4">
      {company.inProgressStates && company.inProgressStates.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Estados em decorrer</h3>
          <div className="space-y-2">
            {company.inProgressStates.map((state) => (
              <div key={state.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{state.description}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDeleteInProgressState(state.id)} 
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
          Nenhum estado em decorrer cadastrado
        </div>
      )}
      
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Adicionar novo estado</h3>
        <div className="space-y-2">
          <Input
            value={newInProgressState}
            onChange={(e) => setNewInProgressState(e.target.value)}
            placeholder="Descrição do estado"
            className="w-full"
          />
          
          <Button className="w-full" onClick={onAddInProgressState}>
            Adicionar estado
          </Button>
        </div>
      </div>
    </div>
  );
}
