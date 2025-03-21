
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

interface InformationTabProps {
  form: UseFormReturn<{
    name: string;
    jobPosition: string;
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
        <label htmlFor="jobPosition" className="text-sm font-medium">Vaga</label>
        <Select
          value={form.watch('jobPosition') || ''}
          onValueChange={handleJobPositionChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a vaga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhuma vaga</SelectItem>
            {availableJobPositions.map(job => (
              <SelectItem key={job} value={job}>{job}</SelectItem>
            ))}
            <SelectItem value="custom">Personalizada...</SelectItem>
          </SelectContent>
        </Select>
        
        {customJobPosition !== '' && (
          <div className="flex gap-2 mt-2">
            <Input
              value={customJobPosition}
              onChange={(e) => setCustomJobPosition(e.target.value)}
              placeholder="Digite a vaga personalizada"
              className="flex-1"
            />
            <Button size="sm" onClick={applyCustomJobPosition}>Aplicar</Button>
          </div>
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
      
      <Button className="w-full" onClick={onSave}>
        Salvar alterações
      </Button>
    </div>
  );
}
