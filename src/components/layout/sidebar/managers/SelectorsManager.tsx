
import { useState } from "react";
import { UserCog, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SelectorsManagerProps {
  selectors: string[];
  onAddSelector: (selector: string) => void;
  onDeleteSelector: (selector: string) => void;
  showSelectorsManager: boolean;
  setShowSelectorsManager: (show: boolean) => void;
}

export const SelectorsManager = ({
  selectors,
  onAddSelector,
  onDeleteSelector,
  showSelectorsManager,
  setShowSelectorsManager
}: SelectorsManagerProps) => {
  const [newGlobalSelector, setNewGlobalSelector] = useState('');

  const handleAddGlobalSelector = () => {
    if (newGlobalSelector.trim()) {
      onAddSelector(newGlobalSelector);
      setNewGlobalSelector('');
    }
  };

  return (
    <DialogContent className="sm:max-w-md bg-background">
      <DialogHeader>
        <DialogTitle>Gerenciar Selecionadoras</DialogTitle>
        <DialogDescription>
          Adicione ou remova selecionadoras disponíveis para todas as empresas.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="flex gap-2">
          <Input
            value={newGlobalSelector}
            onChange={(e) => setNewGlobalSelector(e.target.value)}
            placeholder="Nova selecionadora"
            className="flex-1"
          />
          <Button onClick={handleAddGlobalSelector}>Adicionar</Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Selecionadoras disponíveis</h3>
          <ScrollArea className="h-[200px] pr-3">
            {selectors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma selecionadora cadastrada</p>
            ) : (
              <div className="space-y-2">
                {selectors.map(selector => (
                  <div key={selector} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      <span>{selector}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDeleteSelector(selector)} 
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
        <Button onClick={() => setShowSelectorsManager(false)}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  );
};
