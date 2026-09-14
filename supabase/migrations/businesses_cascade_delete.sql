-- Cuando se elimina un usuario de auth.users, se eliminan en cascada
-- su negocio y por FK cascade en loyalty_programs, también el programa.

alter table businesses
  add constraint businesses_owner_fk
  foreign key (owner_user_id)
  references auth.users(id)
  on delete cascade;
