INSERT INTO public.user_roles (user_id, role)
SELECT '8d32f6a2-6db1-4fc6-9d0c-dd286d7d46fa', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = '8d32f6a2-6db1-4fc6-9d0c-dd286d7d46fa' AND role = 'admin'
);