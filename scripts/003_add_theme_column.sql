-- Add theme column to settings table
alter table public.settings
add column if not exists theme text default 'light' check (theme in ('light', 'dark'));
