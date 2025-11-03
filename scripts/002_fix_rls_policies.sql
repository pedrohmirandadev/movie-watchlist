-- Drop existing policies if they exist
drop policy if exists "Users can view their own movies" on public.movies;
drop policy if exists "Users can insert their own movies" on public.movies;
drop policy if exists "Users can update their own movies" on public.movies;
drop policy if exists "Users can delete their own movies" on public.movies;

-- Recreate RLS policies with proper syntax and type casting
create policy "Users can view their own movies"
  on public.movies for select
  using (auth.uid()::uuid = user_id);

create policy "Users can insert their own movies"
  on public.movies for insert
  with check (auth.uid()::uuid = user_id);

create policy "Users can update their own movies"
  on public.movies for update
  using (auth.uid()::uuid = user_id)
  with check (auth.uid()::uuid = user_id);

create policy "Users can delete their own movies"
  on public.movies for delete
  using (auth.uid()::uuid = user_id);
