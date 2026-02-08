import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "service_person" | "customer";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  customerRecord: { id: string } | null;
  servicePersonRecord: { id: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserRole(userId: string): Promise<AppRole | null> {
  const { data } = await (supabase.rpc as any)("get_user_role", { _user_id: userId });
  return (data as AppRole) || null;
}

async function fetchLinkedRecord(userId: string, role: AppRole | null) {
  if (role === "customer") {
    const { data } = await (supabase as any)
      .from("customers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    return { customer: data as { id: string } | null, servicePerson: null };
  }
  if (role === "service_person") {
    const { data } = await (supabase as any)
      .from("service_persons")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    return { customer: null, servicePerson: data as { id: string } | null };
  }
  return { customer: null, servicePerson: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerRecord, setCustomerRecord] = useState<{ id: string } | null>(null);
  const [servicePersonRecord, setServicePersonRecord] = useState<{ id: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(async () => {
            if (!mounted) return;
            const userRole = await fetchUserRole(session.user.id);
            if (!mounted) return;
            setRole(userRole);

            const linked = await fetchLinkedRecord(session.user.id, userRole);
            if (!mounted) return;
            setCustomerRecord(linked.customer);
            setServicePersonRecord(linked.servicePerson);
          }, 0);
        } else {
          setRole(null);
          setCustomerRecord(null);
          setServicePersonRecord(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userRole = await fetchUserRole(session.user.id);
        if (!mounted) return;
        setRole(userRole);

        const linked = await fetchLinkedRecord(session.user.id, userRole);
        if (!mounted) return;
        setCustomerRecord(linked.customer);
        setServicePersonRecord(linked.servicePerson);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setCustomerRecord(null);
    setServicePersonRecord(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, role, loading, signIn, signOut, customerRecord, servicePersonRecord }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
