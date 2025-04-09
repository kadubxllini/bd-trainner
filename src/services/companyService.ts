
import { supabase } from '@/integrations/supabase/client';
import { Company, UrgencyLevel, JobPositionResponse, CompanyJobPositionsResult } from '@/types';

export const fetchCompanies = async (userId: string) => {
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (companiesError) {
    throw companiesError;
  }
  
  return companiesData;
};

export const fetchCompanyJobPositions = async (companyId: string) => {
  try {
    console.log('Fetching job positions for company:', companyId);
    
    const { data, error } = await supabase
      .rpc('get_company_job_positions', {
        company_id_param: companyId
      });
    
    if (error) {
      console.error('Error fetching job positions:', error);
      return [];
    } 
    
    if (data) {
      // Format the response - data is an array of objects with job_position property
      const jobPositions = data.map((item: { job_position: string }) => item.job_position);
      console.log('Job positions fetched:', jobPositions);
      return jobPositions;
    }
    
    return [];
  } catch (e) {
    console.error('Exception fetching job positions:', e);
    return [];
  }
};

export const fetchCompanyDetails = async (companyId: string) => {
  const { data: companyDetailsData } = await supabase
    .from('companies')
    .select('urgency, in_progress, selector')
    .eq('id', companyId)
    .single();
    
  return companyDetailsData;
};

export const fetchCompanyEmails = async (companyId: string) => {
  const { data: emailsData, error: emailsError } = await supabase
    .from('company_emails')
    .select('*')
    .eq('company_id', companyId);
  
  if (emailsError) {
    console.error('Error fetching emails:', emailsError);
    return [];
  }
  
  return emailsData;
};

export const fetchCompanyPhones = async (companyId: string) => {
  const { data: phonesData, error: phonesError } = await supabase
    .from('company_phones')
    .select('*')
    .eq('company_id', companyId);
  
  if (phonesError) {
    console.error('Error fetching phones:', phonesError);
    return [];
  }
  
  return phonesData;
};

export const fetchCompanyContacts = async (companyId: string) => {
  const { data: contactsData, error: contactsError } = await supabase
    .from('company_contacts')
    .select('*')
    .eq('company_id', companyId);
  
  if (contactsError) {
    console.error('Error fetching contacts:', contactsError);
    return [];
  }
  
  return contactsData;
};

export const fetchCompanyInProgressStates = async (companyId: string) => {
  const { data: inProgressStatesData, error: inProgressStatesError } = await supabase
    .from('company_in_progress')
    .select('*')
    .eq('company_id', companyId);
    
  if (inProgressStatesError) {
    console.error('Error fetching in progress states:', inProgressStatesError);
    return [];
  }
  
  return inProgressStatesData;
};

export const createCompany = async (name: string, userId: string) => {
  const { data, error } = await supabase
    .from('companies')
    .insert({ name, user_id: userId })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCompanyDetails = async (id: string, updateData: any) => {
  const { error } = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', id);
  
  if (error) throw error;
};

export const updateCompanyJobPositions = async (id: string, jobPositions: string[]) => {
  try {
    console.log('Updating job positions for company:', id);
    console.log('New job positions:', jobPositions);
    
    // First, delete all existing job positions
    const { error: deleteError } = await supabase
      .rpc('delete_company_job_positions', {
        company_id_param: id
      });
      
    if (deleteError) {
      console.error('Error deleting job positions:', deleteError);
      throw deleteError;
    }
    
    // Only add new positions if there are any
    if (jobPositions.length > 0) {
      // Add each position one by one
      for (const position of jobPositions) {
        const { data: result, error: addError } = await supabase
          .rpc('add_company_job_position', { 
            company_id_param: id,
            job_position_param: position
          });
        
        if (addError) {
          console.error('Error adding job position:', addError);
          throw addError;
        }
        console.log('Added job position:', position, 'Result:', result);
      }
    }
  } catch (error: any) {
    console.error('Error updating job positions:', error);
    throw error;
  }
};

export const deleteCompany = async (id: string) => {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
