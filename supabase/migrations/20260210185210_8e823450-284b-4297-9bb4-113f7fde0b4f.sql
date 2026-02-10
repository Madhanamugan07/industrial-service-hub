
-- Add photo_url column to service_persons
ALTER TABLE public.service_persons ADD COLUMN photo_url text;

-- Create storage bucket for service person photos
INSERT INTO storage.buckets (id, name, public) VALUES ('service-person-photos', 'service-person-photos', true);

-- Storage policies for service person photos
CREATE POLICY "Anyone can view service person photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-person-photos');

CREATE POLICY "Admins can upload service person photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'service-person-photos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update service person photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'service-person-photos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete service person photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'service-person-photos' AND public.has_role(auth.uid(), 'admin'::app_role));
