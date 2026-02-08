
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'service_person', 'customer');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer functions (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role::text FROM public.user_roles WHERE user_id = _user_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') $$;

-- 5. Add user_id to link customers/service_persons to auth users
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.service_persons ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. Profiles RLS
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. User roles RLS
CREATE POLICY "Users view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. Drop old public access policies
DROP POLICY IF EXISTS "Public access" ON public.customers;
DROP POLICY IF EXISTS "Public access " ON public.customers;
DROP POLICY IF EXISTS "Public access" ON public.machines;
DROP POLICY IF EXISTS "Public access " ON public.machines;
DROP POLICY IF EXISTS "Public access" ON public.spare_parts;
DROP POLICY IF EXISTS "Public access " ON public.spare_parts;
DROP POLICY IF EXISTS "Public access" ON public.service_persons;
DROP POLICY IF EXISTS "Public access " ON public.service_persons;
DROP POLICY IF EXISTS "Public access" ON public.service_tickets;
DROP POLICY IF EXISTS "Public access " ON public.service_tickets;
DROP POLICY IF EXISTS "Public access" ON public.ticket_spare_parts;
DROP POLICY IF EXISTS "Public access " ON public.ticket_spare_parts;

-- 9. Customers RLS
CREATE POLICY "Admin full customers" ON public.customers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers view own" ON public.customers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Customers update own" ON public.customers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 10. Machines RLS (all authenticated can view, admin manages)
CREATE POLICY "Authenticated view machines" ON public.machines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert machines" ON public.machines FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update machines" ON public.machines FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete machines" ON public.machines FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. Spare parts RLS
CREATE POLICY "Admin full spare parts" ON public.spare_parts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "SP view spare parts" ON public.spare_parts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'service_person'));
CREATE POLICY "SP update spare parts" ON public.spare_parts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'service_person'));

-- 12. Service persons RLS
CREATE POLICY "Admin full service persons" ON public.service_persons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "SP view own" ON public.service_persons FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Customers view assigned SP" ON public.service_persons FOR SELECT TO authenticated
  USING (id IN (
    SELECT assigned_service_person_id FROM public.service_tickets 
    WHERE customer_id IN (SELECT c.id FROM public.customers c WHERE c.user_id = auth.uid())
    AND assigned_service_person_id IS NOT NULL
  ));

-- 13. Service tickets RLS
CREATE POLICY "Admin full tickets" ON public.service_tickets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers view own tickets" ON public.service_tickets FOR SELECT TO authenticated
  USING (customer_id IN (SELECT c.id FROM public.customers c WHERE c.user_id = auth.uid()));
CREATE POLICY "Customers create tickets" ON public.service_tickets FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'customer') AND customer_id IN (SELECT c.id FROM public.customers c WHERE c.user_id = auth.uid()));
CREATE POLICY "SP view assigned tickets" ON public.service_tickets FOR SELECT TO authenticated
  USING (assigned_service_person_id IN (SELECT sp.id FROM public.service_persons sp WHERE sp.user_id = auth.uid()));
CREATE POLICY "SP update assigned tickets" ON public.service_tickets FOR UPDATE TO authenticated
  USING (assigned_service_person_id IN (SELECT sp.id FROM public.service_persons sp WHERE sp.user_id = auth.uid()));

-- 14. Ticket spare parts RLS
CREATE POLICY "Admin full ticket parts" ON public.ticket_spare_parts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "SP manage ticket parts" ON public.ticket_spare_parts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'service_person') AND ticket_id IN (
    SELECT st.id FROM public.service_tickets st WHERE st.assigned_service_person_id IN (
      SELECT sp.id FROM public.service_persons sp WHERE sp.user_id = auth.uid()
    )
  ))
  WITH CHECK (public.has_role(auth.uid(), 'service_person') AND ticket_id IN (
    SELECT st.id FROM public.service_tickets st WHERE st.assigned_service_person_id IN (
      SELECT sp.id FROM public.service_persons sp WHERE sp.user_id = auth.uid()
    )
  ));
CREATE POLICY "Customers view own ticket parts" ON public.ticket_spare_parts FOR SELECT TO authenticated
  USING (ticket_id IN (
    SELECT st.id FROM public.service_tickets st WHERE st.customer_id IN (
      SELECT c.id FROM public.customers c WHERE c.user_id = auth.uid()
    )
  ));
