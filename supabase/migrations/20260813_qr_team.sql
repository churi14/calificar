-- Vincular vendedores a su cuenta padre
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS parent_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_parent_user_id_idx ON public.profiles(parent_user_id);
