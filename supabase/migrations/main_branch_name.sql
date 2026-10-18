-- Nombre de la sucursal principal (los sellos sin sucursal). Si está vacío, se muestra "Principal".
alter table loyalty_programs
  add column if not exists main_branch_name text;
