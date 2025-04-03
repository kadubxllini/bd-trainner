
-- Create table for storing multiple job positions per company
CREATE TABLE IF NOT EXISTS public.company_job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_position TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_job_positions_company_id ON public.company_job_positions(company_id);

-- Add unique constraint to prevent duplicate job positions for the same company
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_company_job_positions ON public.company_job_positions(company_id, job_position);
