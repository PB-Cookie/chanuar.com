-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do nothing;

-- Ensure policies exist
drop policy if exists "Submission images are publicly accessible." on storage.objects;
drop policy if exists "Users can upload submission images." on storage.objects;
drop policy if exists "Users can update their own images." on storage.objects;
drop policy if exists "Users can delete their own images." on storage.objects;

create policy "Submission images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'submissions' );

create policy "Users can upload submission images."
  on storage.objects for insert
  with check ( bucket_id = 'submissions' and auth.role() = 'authenticated' );

create policy "Users can update their own images."
  on storage.objects for update
  using ( bucket_id = 'submissions' and auth.role() = 'authenticated' );

create policy "Users can delete their own images."
  on storage.objects for delete
  using ( bucket_id = 'submissions' and auth.role() = 'authenticated' );
