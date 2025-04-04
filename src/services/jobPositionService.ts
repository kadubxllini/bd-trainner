
import { supabase } from '@/integrations/supabase/client';

export const fetchJobPositions = async () => {
  const { data, error } = await supabase
    .from('job_positions')
    .select('title')
    .order('title', { ascending: true });
  
  if (error) {
    console.error('Error fetching job positions:', error);
    return [];
  }
  
  if (data) {
    return data.map(job => job.title);
  }
  
  return [];
};

export const addJobPosition = async (title: string) => {
  const { error } = await supabase
    .from('job_positions')
    .insert({ title });
  
  if (error) throw error;
  
  return fetchJobPositions();
};

export const deleteJobPosition = async (title: string) => {
  const { error } = await supabase
    .from('job_positions')
    .delete()
    .eq('title', title);
  
  if (error) throw error;
  
  return fetchJobPositions();
};
