
import { supabase } from '@/integrations/supabase/client';
import { UrgencyLevel } from '@/types';

export const addCompanyEmail = async (companyId: string, email: string, jobPosition?: string, preference?: UrgencyLevel) => {
  const { error } = await supabase
    .from('company_emails')
    .insert({ company_id: companyId, email, job_position: jobPosition, preference });
  
  if (error) throw error;
};

export const deleteCompanyEmail = async (emailId: string) => {
  const { error } = await supabase
    .from('company_emails')
    .delete()
    .eq('id', emailId);
  
  if (error) throw error;
};

export const addCompanyPhone = async (companyId: string, phone: string) => {
  const { error } = await supabase
    .from('company_phones')
    .insert({ company_id: companyId, phone });
  
  if (error) throw error;
};

export const deleteCompanyPhone = async (phoneId: string) => {
  const { error } = await supabase
    .from('company_phones')
    .delete()
    .eq('id', phoneId);
  
  if (error) throw error;
};

export const addCompanyContact = async (companyId: string, name: string) => {
  const { error } = await supabase
    .from('company_contacts')
    .insert({ company_id: companyId, name });
  
  if (error) throw error;
};

export const deleteCompanyContact = async (contactId: string) => {
  const { error } = await supabase
    .from('company_contacts')
    .delete()
    .eq('id', contactId);
  
  if (error) throw error;
};
