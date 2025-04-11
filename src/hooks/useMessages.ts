import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types';
import * as messageService from '@/services/messageService';

// Declare the global window type to include our editMessage function
declare global {
  interface Window {
    editMessage?: (message: Message) => void;
  }
}

export const useMessagesData = (companyId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { 
    data: messages = [], 
    isLoading: isLoadingMessages 
  } = useQuery({
    queryKey: ['messages', companyId],
    queryFn: async () => {
      if (!user || !companyId) return [];
      return messageService.fetchMessages(companyId);
    },
    enabled: !!user && !!companyId
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({ content, fileAttachment, customTimestamp }: 
      { content: string, fileAttachment?: Message['fileAttachment'], customTimestamp?: number }) => {
      if (!companyId || !user) throw new Error("No active company or user");
      await messageService.addMessage(companyId, user.id, content, fileAttachment, customTimestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    }
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Message> }) => {
      if (data.content !== undefined) {
        await messageService.updateMessage(id, data.content);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar mensagem: ${error.message}`);
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: messageService.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover mensagem: ${error.message}`);
    }
  });

  const addMessage = async (content: string, fileAttachment?: Message['fileAttachment'], customTimestamp?: number) => {
    if ((!content.trim() && !fileAttachment) || !companyId) return;
    await addMessageMutation.mutateAsync({ content, fileAttachment, customTimestamp });
  };

  const updateMessage = async (id: string, data: Partial<Message>): Promise<void> => {
    try {
      console.log("Calling updateMessage in hook:", id, data);
      if (!id) {
        throw new Error("ID da mensagem não definido");
      }
      
      await updateMessageMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error("Error in updateMessage hook:", error);
      throw error;
    }
  };

  const deleteMessage = async (id: string) => {
    await deleteMessageMutation.mutateAsync(id);
  };

  return {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    isLoadingMessages
  };
};
