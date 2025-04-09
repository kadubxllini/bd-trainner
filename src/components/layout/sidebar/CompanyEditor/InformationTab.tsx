
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Company, UrgencyLevel } from '@/types';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, AlertCircle, BriefcaseBusiness, Clock } from 'lucide-react';
import { useMessages } from '@/context/MessageContext';

interface InformationTabProps {
  form: any;
  company: Company;
  availableJobPositions: string[];
  onSave: () => void;
}

export function InformationTab({
  form,
  company,
  availableJobPositions,
  onSave
}: InformationTabProps) {
  const selectedJobPositions = form.watch('jobPositions') || [];
  const selectedInProgress = form.watch('inProgress');
  const selectedUrgency = form.watch('urgency') as UrgencyLevel;
  const { availableInProgressStates } = useMessages();
  
  const removeJobPosition = (position: string) => {
    const currentPositions = form.getValues().jobPositions || [];
    form.setValue('jobPositions', currentPositions.filter(p => p !== position));
  };
  
  const handleJobPositionChange = (value: string) => {
    if (value !== 'none') {
      const currentPositions = form.getValues().jobPositions || [];
      if (!currentPositions.includes(value)) {
        form.setValue('jobPositions', [...currentPositions, value]);
      }
    }
  };
  
  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch(urgency) {
      case 'Baixa': return 'bg-green-100 text-green-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Alta': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getUrgencyIndicator = (urgency: UrgencyLevel) => {
    switch(urgency) {
      case 'Baixa': return <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
      case 'Média': return <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>;
      case 'Alta': return <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>;
      default: return null;
    }
  };
  
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da empresa</FormLabel>
              <FormControl>
                <Input placeholder="Nome da empresa" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Vagas de interesse</h3>
          
          <div className="flex flex-wrap gap-1">
            {selectedJobPositions.map(position => (
              <Badge 
                key={position} 
                variant="secondary"
                className="flex items-center gap-1 bg-primary/10"
              >
                <BriefcaseBusiness className="h-3 w-3" />
                {position}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => removeJobPosition(position)} 
                />
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Select onValueChange={handleJobPositionChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a vaga" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    <SelectItem value="none">Nenhuma vaga</SelectItem>
                    {availableJobPositions.map(job => (
                      <SelectItem key={job} value={job}>{job}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="button" 
              size="sm" 
              variant="secondary"
              onClick={onSave}
            >
              Salvar
            </Button>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="urgency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urgência de contato</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={selectedUrgency === 'Baixa' ? 'default' : 'outline'}
                  className="w-full flex items-center justify-start gap-2 h-12"
                  onClick={() => form.setValue('urgency', 'Baixa')}
                >
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Baixa</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedUrgency === 'Média' ? 'default' : 'outline'}
                  className="w-full flex items-center justify-start gap-2 h-12"
                  onClick={() => form.setValue('urgency', 'Média')}
                >
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Média</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedUrgency === 'Alta' ? 'default' : 'outline'}
                  className="w-full flex items-center justify-start gap-2 h-12"
                  onClick={() => form.setValue('urgency', 'Alta')}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Alta</span>
                </Button>
              </div>
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Estado do Decorrer</h3>
          
          <FormField
            control={form.control}
            name="inProgress"
            render={({ field }) => (
              <Select 
                value={field.value || ''} 
                onValueChange={(value) => form.setValue('inProgress', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    <SelectItem value="none">Nenhum</SelectItem>
                    {availableInProgressStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{state}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </Form>
  );
}
