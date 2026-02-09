
-- Fix infinite recursion: replace "Customers view assigned SP" policy with a security definer function

-- Create a security definer function to check if a service person is assigned to a customer's ticket
CREATE OR REPLACE FUNCTION public.is_sp_assigned_to_customer_ticket(_sp_id uuid, _customer_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM service_tickets st
    JOIN customers c ON c.id = st.customer_id
    WHERE st.assigned_service_person_id = _sp_id
      AND c.user_id = _customer_user_id
      AND st.assigned_service_person_id IS NOT NULL
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Customers view assigned SP" ON public.service_persons;

-- Recreate with security definer function (no recursion)
CREATE POLICY "Customers view assigned SP"
ON public.service_persons
FOR SELECT
USING (
  public.is_sp_assigned_to_customer_ticket(id, auth.uid())
);
