
import { useState } from "react";
import { BriefcaseBusiness, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JobPositionsManagerProps {
  availableJobPositions: string[];
  onAddJobPosition: (position: string) => void;
  onDeleteJobPosition: (position: string) => void;
  showJobPositionsManager: boolean;
  setShowJobPositionsManager: (show: boolean) => void;
}

export const JobPositionsManager = ({
  availableJobPositions,
  onAddJobPosition,
  onDeleteJobPosition,
  showJobPositionsManager,
  setShowJobPositionsManager
}: JobPositionsManagerProps) => {
  const [newGlobalJobPosition, setNewGlobalJobPosition] = useState('');

  const handleAddGlobalJobPosition = () => {
    if (newGlobalJobPosition.trim()) {
      onAddJobPosition(newGlobalJobPosition);
      setNewGlobalJobPosition('');
    }
  };

  return (
    <DialogContent className="sm:max-w-md bg-background">
      <DialogHeader>
        <DialogTitle>Gerenciar Vagas</DialogTitle>
        <DialogDescription>
          Adicione ou remova vagas disponíveis para todas as empresas.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="flex gap-2">
          <Input
            value={newGlobalJobPosition}
            onChange={(e) => setNewGlobalJobPosition(e.target.value)}
            placeholder="Nova vaga"
            className="flex-1"
          />
          <Button onClick={handleAddGlobalJobPosition}>Adicionar</Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Vagas disponíveis</h3>
          <ScrollArea className="h-[200px] pr-3">
            {availableJobPositions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma vaga cadastrada</p>
            ) : (
              <div className="space-y-2">
                {availableJobPositions.map(job => (
                  <div key={job} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
                      <span>{job}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDeleteJobPosition(job)} 
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
      
      <DialogFooter>
        <Button onClick={() => setShowJobPositionsManager(false)}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  );
};
