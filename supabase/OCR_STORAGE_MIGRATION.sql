-- =====================================================
-- OCR STORAGE BUCKET CREATION
-- =====================================================

-- Create a new storage bucket for OCR scans
INSERT INTO storage.buckets (id, name, public)
VALUES ('ocr_scans', 'ocr_scans', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload OCR scans"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ocr_scans' AND auth.uid() = owner);

-- Policy to allow authenticated users to view their own files
CREATE POLICY "Authenticated users can view their own OCR scans"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ocr_scans' AND auth.uid() = owner);

-- Policy to allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update their own OCR scans"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ocr_scans' AND auth.uid() = owner);

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete their own OCR scans"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ocr_scans' AND auth.uid() = owner);
