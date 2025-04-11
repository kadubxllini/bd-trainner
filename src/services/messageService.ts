
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types';

export const fetchMessages = async (companyId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('company_id', companyId)
    .order('timestamp', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  
  return data.map(message => ({
    id: message.id,
    content: message.content,
    timestamp: new Date(message.timestamp).getTime(),
    fileAttachment: message.file_url ? {
      name: message.file_name || 'arquivo',
      url: message.file_url,
      type: message.file_type || ''
    } : undefined
  }));
};

export const addMessage = async (
  companyId: string, 
  userId: string, 
  content: string, 
  fileAttachment?: Message['fileAttachment'], 
  customTimestamp?: number
) => {
  const messageData = {
    content,
    company_id: companyId,
    user_id: userId,
    timestamp: customTimestamp ? new Date(customTimestamp).toISOString() : new Date().toISOString(),
    file_name: fileAttachment?.name,
    file_url: fileAttachment?.url,
    file_type: fileAttachment?.type
  };

  const { error } = await supabase
    .from('messages')
    .insert(messageData);
  
  if (error) throw error;
};

export const updateMessage = async (id: string, content: string) => {
  console.log(`Updating message ${id} with content: ${content}`);
  
  // Add some validation
  if (!id || !content.trim()) {
    const error = new Error('ID da mensagem ou conteúdo inválido');
    console.error("Error updating message:", error);
    throw error;
  }
  
  try {
    const { error } = await supabase
      .from('messages')
      .update({ content })
      .eq('id', id);
    
    if (error) {
      console.error("Error updating message:", error);
      throw error;
    }
    
    console.log("Message updated successfully");
  } catch (err) {
    console.error("Exception updating message:", err);
    throw err;
  }
};

export const deleteMessage = async (id: string) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
