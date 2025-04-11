
-- Create a storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('messages', 'Message Attachments', true);

-- Set up storage policies to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'messages' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow users to select their own files
CREATE POLICY "Allow users to select their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'messages' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow public to read all files
CREATE POLICY "Allow public to read all files"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'messages');

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'messages' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'messages' AND auth.uid() = (storage.foldername(name))[1]::uuid);
