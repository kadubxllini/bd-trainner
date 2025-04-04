
import { supabase } from '@/integrations/supabase/client';

export const fetchInProgressStates = async () => {
  try {
    const { data, error } = await supabase
      .from('in_progress_states')
      .select('description')
      .order('description', { ascending: true });
    
    if (error) {
      console.error('Error fetching in progress states:', error);
      return [];
    }
    
    if (data) {
      const descriptions = data.map(item => item.description);
      console.log("Fetched in-progress states:", descriptions);
      return descriptions;
    }
    
    return [];
  } catch (err) {
    console.error('Exception fetching in progress states:', err);
    return [];
  }
};

export const addInProgressStateToDatabase = async (state: string) => {
  console.log("Adding state to database:", state);
  
  try {
    const { data: existingState, error: checkError } = await supabase
      .from('in_progress_states')
      .select('*')
      .eq('description', state)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing state:", checkError);
      return { error: checkError };
    }

    if (existingState) {
      console.log("State already exists:", existingState);
      return { data: existingState, error: null };
    }

    console.log("Adding new state to database:", state);
    const { data, error } = await supabase
      .from('in_progress_states')
      .insert({ description: state })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding state to database:", error);
      return { error };
    }
    
    console.log("State added successfully:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Exception in addInProgressStateToDatabase:", err);
    return { data: null, error: err };
  }
};

export const deleteInProgressState = async (state: string) => {
  console.log("Deleting state from database:", state);
  const { error } = await supabase
    .from('in_progress_states')
    .delete()
    .eq('description', state);
  
  if (error) throw error;
};

export const addCompanyInProgressState = async (companyId: string, state: string) => {
  console.log(`Adding in-progress state '${state}' to company with ID ${companyId}`);
  
  if (!state.trim()) {
    throw new Error("Estado não pode estar vazio");
  }
  
  if (!companyId) {
    throw new Error("ID da empresa não fornecido");
  }

  const { error } = await supabase
    .from('company_in_progress')
    .insert({ company_id: companyId, description: state });
  
  if (error) throw error;
};

export const deleteCompanyInProgressState = async (companyId: string, stateId: string) => {
  const { error } = await supabase
    .from('company_in_progress')
    .delete()
    .eq('id', stateId);
  
  if (error) throw error;
};
