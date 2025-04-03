
-- Create function to get company job positions
CREATE OR REPLACE FUNCTION public.get_company_job_positions(company_id_param UUID)
RETURNS TABLE(job_position TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY 
  SELECT cjp.job_position 
  FROM company_job_positions cjp
  WHERE cjp.company_id = company_id_param;
END;
$$;

-- Create function to delete all job positions for a company
CREATE OR REPLACE FUNCTION public.delete_company_job_positions(company_id_param UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM company_job_positions
  WHERE company_id = company_id_param;
END;
$$;

-- Create function to add a job position for a company
CREATE OR REPLACE FUNCTION public.add_company_job_position(company_id_param UUID, job_position_param TEXT)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO company_job_positions (company_id, job_position)
  VALUES (company_id_param, job_position_param)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;
