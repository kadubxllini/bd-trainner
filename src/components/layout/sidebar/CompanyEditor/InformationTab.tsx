
import { Company, UrgencyLevel } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InformationTabProps {
  form: UseFormReturn<{
    name: string;
    jobPositions: string[]; // Changed from jobPosition to jobPositions
    urgency: UrgencyLevel;
    inProgress: string;
  }>;
  availableJobPositions: string[];
  customJobPosition: string;
  setCustomJobPosition: (value: string) => void;
  handleJobPositionChange: (value: string) => void;
  applyCustomJobPosition: () => void;
  onSave: () => void;
}

export function InformationTab({
  form,
  availableJobPositions,
  customJobPosition,
  setCustomJobPosition,
  handleJobPositionChange,
  applyCustomJobPosition,
  onSave
}: InformationTabProps) {
  const [selectedJobPosition, setSelectedJobPosition] = useState<string>("none");
  const [currentJobPositions, setCurrentJobPositions] = useState<string[]>([]);

  useEffect(() => {
    // Initialize current positions from form
    const positions = form.getValues().jobPositions || [];
    setCurrentJobPositions(positions);
  }, [form]);
  
  const handleAddJobPosition = () => {
    if (selectedJobPosition === "none" || selectedJobPosition === "custom") {
      return;
    }
    
    // Prevent duplicate job positions
    if (currentJobPositions.includes(selectedJobPosition)) {
      toast.error("Esta vaga já foi adicionada");
      return;
    }
    
    const updatedPositions = [...currentJobPositions, selectedJobPosition];
    setCurrentJobPositions(updatedPositions);
    form.setValue('jobPositions', updatedPositions);
    setSelectedJobPosition("none");
  };
  
  const handleRemoveJobPosition = (position: string) => {
    const updatedPositions = currentJobPositions.filter(p => p !== position);
    setCurrentJobPositions(updatedPositions);
    form.setValue('jobPositions', updatedPositions);
  };
  
  const handleCustomJobPosition = () => {
    if (!customJobPosition.trim()) {
      toast.error("Digite uma vaga personalizada");
      return;
    }
    
    // Prevent duplicate job positions
    if (currentJobPositions.includes(customJobPosition)) {
      toast.error("Esta vaga já foi adicionada");
      return;
    }
    
    const updatedPositions = [...currentJobPositions, customJobPosition];
    setCurrentJobPositions(updatedPositions);
    form.setValue('jobPositions', updatedPositions);
    setCustomJobPosition('');
  };
  
  const handleSave = () => {
    const { name } = form.getValues();
    
    if (!name.trim()) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }
    
    onSave();
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Nome da empresa</label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Nome da empresa"
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="jobPosition" className="text-sm font-medium">Vagas</label>
        <div className="flex gap-2">
          <Select
            value={selectedJobPosition}
            onValueChange={setSelectedJobPosition}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione a vaga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma vaga</SelectItem>
              {availableJobPositions.map(job => (
                <SelectItem key={job} value={job}>{job}</SelectItem>
              ))}
              <SelectItem value="custom">Personalizada...</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            type="button" 
            size="icon" 
            onClick={handleAddJobPosition}
            disabled={selectedJobPosition === "none" || selectedJobPosition === "custom"}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {selectedJobPosition === "custom" && (
          <div className="flex gap-2 mt-2">
            <Input
              value={customJobPosition}
              onChange={(e) => setCustomJobPosition(e.target.value)}
              placeholder="Digite a vaga personalizada"
              className="flex-1"
            />
            <Button size="sm" onClick={handleCustomJobPosition}>Adicionar</Button>
          </div>
        )}
        
        {currentJobPositions.length > 0 && (
          <ScrollArea className="h-20 p-2 border rounded-md">
            <div className="flex flex-wrap gap-2">
              {currentJobPositions.map((position, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {position}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0" 
                    onClick={() => handleRemoveJobPosition(position)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Urgência</label>
        <Select
          value={form.watch('urgency')}
          onValueChange={(value) => form.setValue('urgency', value as UrgencyLevel)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a urgência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Baixa" className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Baixa</span>
              </div>
            </SelectItem>
            <SelectItem value="Média" className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Média</span>
              </div>
            </SelectItem>
            <SelectItem value="Alta" className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Alta</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="inProgress" className="text-sm font-medium">Status em decorrer</label>
        <Input
          id="inProgress"
          {...form.register('inProgress')}
          placeholder="Digite o status atual"
          className="w-full"
        />
      </div>
      
      <Button className="w-full" onClick={handleSave}>
        Salvar alterações
      </Button>
    </div>
  );
}
