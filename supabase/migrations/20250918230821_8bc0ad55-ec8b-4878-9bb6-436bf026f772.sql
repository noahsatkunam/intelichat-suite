-- Enable leaked password protection for better security
UPDATE auth.config 
SET password_strength = jsonb_set(
    COALESCE(password_strength, '{}'),
    '{enable_leaked_password_protection}',
    'true'
) WHERE TRUE;