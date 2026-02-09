
-- Junction table: customer_machines (one customer can have many machines)
CREATE TABLE public.customer_machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  machine_id uuid NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  purchase_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(customer_id, machine_id)
);

ALTER TABLE public.customer_machines ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full customer_machines"
ON public.customer_machines FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Customers view their own machine links
CREATE POLICY "Customers view own machines"
ON public.customer_machines FOR SELECT
USING (customer_id IN (
  SELECT c.id FROM customers c WHERE c.user_id = auth.uid()
));

-- Service persons view machines for their assigned tickets
CREATE POLICY "SP view customer machines"
ON public.customer_machines FOR SELECT
USING (has_role(auth.uid(), 'service_person'::app_role));
