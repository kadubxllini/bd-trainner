
import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/context/MessageContext';
import { Send, X, Pencil, Trash, Upload, FileText, Calendar, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Message } from '@/types';
import { toast } from 'sonner';
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import CalendarView from './CalendarView';
import DatePicker from '@/components/DatePicker';
import { format, startOfDay, isEqual, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';

const MessagesView = () => {
  const { user } = useAuth();
  const { activeCompany, messages = [], addMessage, deleteMessage, isLoading } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showAllMessages, setShowAllMessages] = useState(true);
  const [messageDate, setMessageDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Scroll to the end of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedDate, showAllMessages]);

  // Function to send message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !activeCompany || !user) return;
    
    try {
      let fileAttachment = undefined;
      
      if (selectedFile) {
        setIsUploading(true);
        
        const fileName = `${Date.now()}_${selectedFile.name}`;
        const filePath = `${user.id}/${activeCompany.id}/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('messages')
          .upload(filePath, selectedFile);
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('messages')
          .getPublicUrl(filePath);
        
        fileAttachment = {
          name: selectedFile.name,
          url: publicUrl,
          type: selectedFile.type
        };
        
        console.log("File uploaded successfully:", publicUrl);
      }
      
      const customTimestamp = new Date(messageDate);
      
      const now = new Date();
      customTimestamp.setHours(now.getHours());
      customTimestamp.setMinutes(now.getMinutes());
      customTimestamp.setSeconds(now.getSeconds());
      customTimestamp.setMilliseconds(now.getMilliseconds());
      
      console.log('Sending message with timestamp:', customTimestamp.toISOString());
      
      await addMessage(newMessage, fileAttachment, customTimestamp.getTime());
      setNewMessage('');
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
      console.error("Send message error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // File handling
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.success(`Arquivo ${e.target.files[0].name} selecionado`);
    }
  };

  // Handle editing message - now calls the global edit function
  const handleEditMessage = (message: Message) => {
    if (!message || !message.id) {
      toast.error("Mensagem inválida");
      return;
    }
    
    // Use the global edit function that's exposed from AppSidebar
    if (window.editMessage) {
      window.editMessage(message);
    } else {
      toast.error("Função de edição não disponível");
      console.error("Edit function not available");
    }
  };

  // Function to delete message
  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteMessage(id);
      toast.success("Mensagem excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      toast.error("Erro ao excluir mensagem");
    }
  };
  
  // Functions for the calendar
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setShowAllMessages(false);
  };
  
  const handleShowAllMessages = () => {
    setSelectedDate(undefined);
    setShowAllMessages(true);
  };
  
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };
  
  // Filtering and grouping messages
  const filteredMessages = (messages || []).filter(message => {
    if (showAllMessages) return true;
    
    if (selectedDate) {
      const messageDate = new Date(message.timestamp);
      
      const targetDateNormalized = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        0, 0, 0, 0
      );
      
      const messageDateNormalized = new Date(
        messageDate.getFullYear(),
        messageDate.getMonth(),
        messageDate.getDate(),
        0, 0, 0, 0
      );
      
      return (
        targetDateNormalized.getFullYear() === messageDateNormalized.getFullYear() &&
        targetDateNormalized.getMonth() === messageDateNormalized.getMonth() &&
        targetDateNormalized.getDate() === messageDateNormalized.getDate()
      );
    }
    
    return true;
  });
  
  const groupedMessages = showAllMessages
    ? (messages || []).reduce((groups: Record<string, Message[]>, message) => {
        const messageDate = new Date(message.timestamp);
        const date = format(messageDate, 'yyyy-MM-dd');
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
        return groups;
      }, {})
    : {};
    
  const sortedDates = showAllMessages
    ? Object.keys(groupedMessages).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      )
    : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCalendar}
          className="flex items-center gap-1"
        >
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Calendário</span>
        </Button>
        
        <CalendarView 
          onSelectDate={handleDateSelect} 
          onShowAllMessages={handleShowAllMessages}
          isVisible={showCalendar}
        />
      </div>
    
      <div className="flex-1 flex flex-col glass-morphism rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {activeCompany ? activeCompany.name : 'Selecione uma empresa'}
          </h2>
          {selectedDate && !showAllMessages && (
            <div className="text-sm text-muted-foreground">
              {format(addDays(selectedDate, 1), "PPP", { locale: pt })}
            </div>
          )}
          {showAllMessages && (
            <div className="text-sm text-muted-foreground">
              Histórico Completo
            </div>
          )}
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Carregando mensagens...</p>
              </div>
            ) : !activeCompany ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center">
                  Selecione uma empresa para visualizar mensagens.
                </p>
              </div>
            ) : showAllMessages ? (
              sortedDates.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-center">
                    Nenhuma mensagem ainda.<br />
                    Envie sua primeira mensagem!
                  </p>
                </div>
              ) : (
                sortedDates.map(date => (
                  <div key={date} className="mb-8">
                    <div className="sticky top-2 z-10 mb-4">
                      <div className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                        {format(addDays(new Date(date), 1), "PPP", { locale: pt })}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {groupedMessages[date].map((message) => (
                        <MessageItem 
                          key={message.id} 
                          message={message} 
                          onDelete={handleDeleteMessage}
                          onEdit={handleEditMessage}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )
            ) : filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center">
                  Nenhuma mensagem para esta data.<br />
                  Envie sua primeira mensagem!
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <MessageItem 
                  key={message.id} 
                  message={message} 
                  onDelete={handleDeleteMessage}
                  onEdit={handleEditMessage}
                />
              ))
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="p-4 border-t border-white/10">
          {activeCompany && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DatePicker date={messageDate} onDateChange={setMessageDate} />
                <div className="text-xs text-muted-foreground">
                  Enviando mensagem para: {format(messageDate, "dd/MM/yyyy", { locale: pt })}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite uma mensagem..."
                  className="bg-secondary/50 border-white/10 focus-visible:ring-primary/50"
                  disabled={!activeCompany || isUploading}
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleFileButtonClick}
                  className="bg-secondary/50 border-white/10"
                  disabled={!activeCompany || isUploading}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  className="bg-primary/80 hover:bg-primary"
                  disabled={!activeCompany || isUploading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          {selectedFile && (
            <div className="mt-2 p-2 bg-secondary/20 rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setSelectedFile(null)} disabled={isUploading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {isUploading && (
            <div className="mt-2 text-sm text-center text-muted-foreground">
              Enviando arquivo...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Message item component
interface MessageItemProps {
  message: Message;
  onDelete: (id: string) => void;
  onEdit: (message: Message) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onDelete, onEdit }) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="group animate-slide-up relative">
          <div className="message-bubble message-bubble-sent">
            <p>{message.content}</p>
            
            {message.fileAttachment && (
              <div className="mt-2 p-2 bg-secondary/20 rounded flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <a 
                  href={message.fileAttachment.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {message.fileAttachment.name}
                </a>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {format(new Date(message.timestamp), "HH:mm", { locale: pt })}
            </div>
          </div>
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-transparent"
              onClick={() => onEdit(message)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-transparent"
              onClick={() => onDelete(message.id)}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onEdit(message)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar mensagem
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDelete(message.id)} className="text-destructive">
          <Trash className="h-4 w-4 mr-2" />
          Excluir mensagem
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MessagesView;
