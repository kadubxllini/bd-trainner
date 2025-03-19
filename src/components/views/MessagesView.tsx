import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/context/MessageContext';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, X, Pencil, Trash, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Message } from '@/types';
import { toast } from 'sonner';
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const MessagesView = () => {
  const { user } = useAuth();
  const { activeCompany, messages, addMessage, deleteMessage, updateMessage, isLoading } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      }
      
      await addMessage(newMessage, fileAttachment);
      setNewMessage('');
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: number) => {
    return formatRelative(new Date(timestamp), new Date(), {
      locale: ptBR,
    });
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.success(`Arquivo ${e.target.files[0].name} selecionado`);
    }
  };

  const startEditingMessage = (message: Message) => {
    setEditingMessage(message);
    setEditedContent(message.content);
  };

  const saveEditedMessage = async () => {
    if (editingMessage && editedContent.trim()) {
      await updateMessage(editingMessage.id, { content: editedContent });
      setEditingMessage(null);
      setEditedContent('');
    }
  };

  const closeEditDialog = () => {
    setEditingMessage(null);
    setEditedContent('');
  };

  const handleDeleteMessage = async (id: string) => {
    await deleteMessage(id);
  };

  return (
    <div className="flex flex-col h-full glass-morphism rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center">
        <h2 className="text-lg font-medium">
          {activeCompany ? activeCompany.name : 'Selecione uma empresa'}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Nenhuma mensagem ainda.<br />
              Envie sua primeira mensagem!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ContextMenu key={message.id}>
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
                    
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {formatMessageTime(message.timestamp)}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </ContextMenuTrigger>
              
              <ContextMenuContent>
                <ContextMenuItem onClick={() => startEditingMessage(message)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar mensagem
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleDeleteMessage(message.id)} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Excluir mensagem
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-white/10">
        {activeCompany && (
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

      <Dialog open={!!editingMessage} onOpenChange={(open) => {
        if (!open) closeEditDialog();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar mensagem</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Conteúdo da mensagem"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={closeEditDialog}>
              Cancelar
            </Button>
            <Button onClick={saveEditedMessage}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesView;
