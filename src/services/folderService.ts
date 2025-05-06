
import { supabase } from '@/integrations/supabase/client';
import { Folder } from '@/types';

export const fetchUserFolders = async (userId: string): Promise<Folder[]> => {
  const { data, error } = await supabase
    .rpc('get_user_folders', {
      user_id_param: userId
    });
  
  if (error) {
    console.error('Error fetching folders:', error);
    throw error;
  }
  
  return data || [];
};

export const createFolder = async (name: string, color: string, userId: string): Promise<Folder> => {
  const { data, error } = await supabase
    .from('folders')
    .insert({ name, color, user_id: userId })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
  
  return data;
};

export const updateFolder = async (id: string, updates: Partial<Folder>): Promise<void> => {
  const { error } = await supabase
    .from('folders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

export const deleteFolder = async (id: string): Promise<void> => {
  // First, update companies to remove folder reference
  const { error: updateError } = await supabase
    .from('companies')
    .update({ folder_id: null })
    .eq('folder_id', id);
  
  if (updateError) {
    console.error('Error updating companies:', updateError);
    throw updateError;
  }
  
  // Then delete the folder
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

export const moveCompanyToFolder = async (companyId: string, folderId: string | null): Promise<void> => {
  const { error } = await supabase
    .from('companies')
    .update({ folder_id: folderId })
    .eq('id', companyId);
  
  if (error) {
    console.error('Error moving company to folder:', error);
    throw error;
  }
};
