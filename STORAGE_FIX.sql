-- Create a storage bucket for images
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- Set up RLS policies for the images bucket
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'images' );

create policy "Anon Insert" 
on storage.objects for insert 
with check ( bucket_id = 'images' );
