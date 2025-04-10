
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarDays, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const DatePicker = ({ date, onDateChange }: DatePickerProps) => {
  // Handler para garantir que a data seja correta
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Criar uma nova data ao meio-dia para evitar problemas de fuso horário
      const normalizedDate = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        12, 0, 0
      );
      onDateChange(normalizedDate);
    }
  };

  // Subtrair um dia da data para exibição, conforme solicitado
  const displayDate = addDays(date, +1);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1 bg-secondary/50 border-white/10"
        >
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">{format(<DisplayD></DisplayDate, "dd/MM/yyyy", { locale: ptBR })}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Selecionar data</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            locale={ptBR}
            className="p-0 pointer-events-auto"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
