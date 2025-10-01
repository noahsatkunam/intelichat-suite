-- Add first_name and last_name columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Migrate existing name data to first_name (if any)
UPDATE public.profiles 
SET first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE 
      WHEN name LIKE '% %' THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
      ELSE NULL
    END
WHERE name IS NOT NULL AND (first_name IS NULL OR last_name IS NULL);