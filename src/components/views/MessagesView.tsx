
import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/context/MessageContext';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, X, Pencil, Trash, Upload, MoreVertical, FileText } from 'lucide-react';
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Message } from '@/types';
import { toast } from 'sonner';

const MessagesView = () => {
  const { activeCompany, addMessage, deleteMessage, updateMessage } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const companyMessages = activeCompany?.messages || [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [companyMessages]);

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedFile) || !activeCompany) return;
    
    let fileData = undefined;
    
    if (selectedFile) {
      // In a real application, you would upload to a server/storage
      // Here we're creating a data URL for demo purposes
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const fileAttachment = {
            name: selectedFile.name,
            url: URL.createObjectURL(selectedFile),
            type: selectedFile.type
          };
          
          addMessage(newMessage, fileAttachment);
          setNewMessage('');
          setSelectedFile(null);
        }
      };
      reader.readAsDataURL(selectedFile);
    } else {
      addMessage(newMessage);
      setNewMessage('');
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

  const saveEditedMessage = () => {
    if (editingMessage && editedContent.trim()) {
      updateMessage(editingMessage.id, { content: editedContent });
      setEditingMessage(null);
      setEditedContent('');
    }
  };

  return (
    <div className="flex flex-col h-full glass-morphism rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center">
        <h2 className="text-lg font-medium">
          {activeCompany ? activeCompany.name : 'Selecione uma empresa'}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!activeCompany ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Selecione uma empresa para visualizar mensagens.
            </p>
          </div>
        ) : companyMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Nenhuma mensagem ainda.<br />
              Envie sua primeira mensagem!
            </p>
          </div>
        ) : (
          companyMessages.map((message) => (
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
                    onClick={() => deleteMessage(message.id)}
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
                <ContextMenuItem onClick={() => deleteMessage(message.id)} className="text-destructive">
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
              disabled={!activeCompany}
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleFileButtonClick}
              className="bg-secondary/50 border-white/10"
              disabled={!activeCompany}
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              className="bg-primary/80 hover:bg-primary"
              disabled={!activeCompany}
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
            <Button size="icon" variant="ghost" onClick={() => setSelectedFile(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Edit Message Dialog */}
      <Dialog open={!!editingMessage} onOpenChange={(open) => !open && setEditingMessage(null)}>
        <DialogContent>
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
            <Button variant="secondary" onClick={() => setEditingMessage(null)}>
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
