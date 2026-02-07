
-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  machine_name TEXT NOT NULL,
  purchase_date DATE,
  previous_service_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create machines table
CREATE TABLE public.machines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id TEXT NOT NULL UNIQUE,
  machine_name TEXT NOT NULL,
  model_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create spare_parts table (warehouse)
CREATE TABLE public.spare_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spare_part_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_persons table
CREATE TABLE public.service_persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_person_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_tickets table
CREATE TABLE public.service_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  problem_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED')),
  assigned_service_person_id UUID REFERENCES public.service_persons(id) ON DELETE SET NULL,
  service_report TEXT,
  problem_image_url TEXT,
  inspection_image_url TEXT,
  repaired_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket_spare_parts junction table
CREATE TABLE public.ticket_spare_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.service_tickets(id) ON DELETE CASCADE,
  spare_part_id UUID NOT NULL REFERENCES public.spare_parts(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (with permissive policies for demo app)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_spare_parts ENABLE ROW LEVEL SECURITY;

-- Public access policies for all tables (no auth demo app)
CREATE POLICY "Public access" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.spare_parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.service_persons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.service_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.ticket_spare_parts FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for ticket images
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-images', 'ticket-images', true);

-- Storage policies for public access
CREATE POLICY "Public read ticket images" ON storage.objects FOR SELECT USING (bucket_id = 'ticket-images');
CREATE POLICY "Public upload ticket images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ticket-images');
CREATE POLICY "Public update ticket images" ON storage.objects FOR UPDATE USING (bucket_id = 'ticket-images');
CREATE POLICY "Public delete ticket images" ON storage.objects FOR DELETE USING (bucket_id = 'ticket-images');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_spare_parts_updated_at BEFORE UPDATE ON public.spare_parts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_tickets_updated_at BEFORE UPDATE ON public.service_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample machines
INSERT INTO public.machines (machine_id, machine_name, model_number) VALUES
  ('MCH-001', 'CNC Lathe', 'CL-5000X'),
  ('MCH-002', 'Hydraulic Press', 'HP-3200T'),
  ('MCH-003', 'Industrial Robot Arm', 'RA-7500'),
  ('MCH-004', 'Conveyor Belt System', 'CBS-1200'),
  ('MCH-005', 'Welding Station', 'WS-4400');

-- Insert sample spare parts
INSERT INTO public.spare_parts (spare_part_name, quantity) VALUES
  ('Hydraulic Cylinder', 15),
  ('Ball Bearing Set', 42),
  ('Drive Belt', 28),
  ('Control Board', 8),
  ('Servo Motor', 12),
  ('Pneumatic Valve', 20),
  ('Filter Cartridge', 35);

-- Insert sample service persons
INSERT INTO public.service_persons (service_person_id, name, contact_details) VALUES
  ('SP-001', 'Rajesh Kumar', '+91 98765 43210'),
  ('SP-002', 'Amit Sharma', '+91 87654 32109'),
  ('SP-003', 'Priya Patel', '+91 76543 21098');
