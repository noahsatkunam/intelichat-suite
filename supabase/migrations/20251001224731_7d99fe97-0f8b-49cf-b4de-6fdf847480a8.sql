-- Add notes column to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS notes TEXT;