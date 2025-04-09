
import { supabase } from '@/integrations/supabase/client';

export const fetchSelectors = async () => {
  const { data, error } = await supabase
    .from('selectors')
    .select('name')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching selectors:', error);
    return [];
  }
  
  if (data) {
    return data.map(selector => selector.name);
  }
  
  return [];
};

export const addSelector = async (name: string) => {
  // Check if the selector already exists
  const { data: existingSelectors } = await supabase
    .from('selectors')
    .select('name')
    .eq('name', name);
  
  // Only add if not exists
  if (!existingSelectors || existingSelectors.length === 0) {
    const { error } = await supabase
      .from('selectors')
      .insert({ name });
    
    if (error) throw error;
  }
  
  return fetchSelectors();
};

export const deleteSelector = async (name: string) => {
  const { error } = await supabase
    .from('selectors')
    .delete()
    .eq('name', name);
  
  if (error) throw error;
  
  return fetchSelectors();
};

// Initialize the system with the default selector
export const initializeDefaultSelectors = async () => {
  await addSelector("Selecionadora");
  return fetchSelectors();
};
