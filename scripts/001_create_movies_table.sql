-- Create movies table
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  imdb_id text not null,
  title text not null,
  director text,
  imdb_rating text,
  poster text,
  year text,
  plot text,
  actors text,
  watched boolean default false,
  created_at timestamp with time zone default now(),
  unique(user_id, imdb_id)
);

-- Enable Row Level Security
alter table public.movies enable row level security;

-- Create RLS policies
create policy "Users can view their own movies"
  on public.movies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own movies"
  on public.movies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own movies"
  on public.movies for update
  using (auth.uid() = user_id);

create policy "Users can delete their own movies"
  on public.movies for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists movies_user_id_idx on public.movies(user_id);
create index if not exists movies_watched_idx on public.movies(watched);
