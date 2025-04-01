
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMessages } from "@/context/MessageContext";
import { Button } from "@/components/ui/button";
import { CalendarDays, MessageSquare } from "lucide-react";

interface CalendarViewProps {
  onSelectDate: (date: Date | undefined) => void;
  onShowAllMessages: () => void;
  isVisible: boolean;
}

const CalendarView = ({ onSelectDate, onShowAllMessages, isVisible }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { messages, activeCompany } = useMessages();
  
  // Obter datas com mensagens para destaque no calendário
  const datesWithMessages = messages.reduce((dates: Date[], message) => {
    const messageDate = new Date(message.timestamp);
    
    // Criar nova data com hora definida para meio-dia para evitar problemas de fuso horário
    const formattedDate = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate(),
      12, 0, 0
    );
    
    if (!dates.some(date => 
      date.getFullYear() === formattedDate.getFullYear() &&
      date.getMonth() === formattedDate.getMonth() &&
      date.getDate() === formattedDate.getDate()
    )) {
      dates.push(formattedDate);
    }
    
    return dates;
  }, []);
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Criar um novo objeto Date com hora definida para meio-dia para evitar problemas de fuso horário
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0
      );
      setSelectedDate(normalizedDate);
      onSelectDate(normalizedDate);
    } else {
      setSelectedDate(undefined);
      onSelectDate(undefined);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="p-4 bg-card rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <CalendarDays className="mr-2 h-5 w-5" />
          Calendário de Mensagens
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onShowAllMessages}
          className="flex items-center gap-1"
        >
          <MessageSquare className="h-4 w-4" />
          Ver Tudo
        </Button>
      </div>
      
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        locale={ptBR}
        className="p-0 pointer-events-auto"
        modifiers={{
          highlighted: datesWithMessages
        }}
        modifiersClassNames={{
          highlighted: "bg-primary/20 font-bold text-primary"
        }}
      />
      
      {selectedDate && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Visualizando mensagens de: <span className="font-medium">{format(selectedDate, "PPP", { locale: ptBR })}</span>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
