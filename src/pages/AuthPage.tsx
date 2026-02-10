import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cog, LogIn, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [setupForm, setSetupForm] = useState({ email: "", password: "", full_name: "" });

  useEffect(() => {
    if (user && !loading) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    (supabase.rpc as any)("admin_exists").then(({ data }: any) => {
      setNeedsSetup(!data);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("create-user", {
        body: {
          email: setupForm.email,
          password: setupForm.password,
          full_name: setupForm.full_name,
          role: "admin",
          bootstrap: true,
        },
      });
      if (res.error) throw res.error;
      const resData = res.data as any;
      if (resData?.error) throw new Error(resData.error);
      toast.success("Admin account created! Please log in.");
      setSetupMode(false);
      setNeedsSetup(false);
      setEmail(setupForm.email);
    } catch (e: any) {
      toast.error(e.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3.5 justify-center mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/20">
            <Cog className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">MaintainX</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Service Manager
            </p>
          </div>
        </div>

        <div className="industrial-card p-8 space-y-6">
          {!setupMode ? (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold">Welcome back</h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Sign in to your account to continue
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-md shadow-primary/15" disabled={submitting}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              {needsSetup && (
                <div className="border-t border-border pt-5 text-center">
                  <p className="text-xs text-muted-foreground mb-3">
                    No admin account found
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setSetupMode(true)}
                  >
                    <Shield className="h-4 w-4 mr-2" /> Setup Admin Account
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold">Setup Admin Account</h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Create the first admin to get started
                </p>
              </div>
              <form onSubmit={handleBootstrap} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Full Name</Label>
                  <Input
                    value={setupForm.full_name}
                    onChange={(e) =>
                      setSetupForm((p) => ({ ...p, full_name: e.target.value }))
                    }
                    required
                    placeholder="Admin Name"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Email</Label>
                  <Input
                    type="email"
                    value={setupForm.email}
                    onChange={(e) =>
                      setSetupForm((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    placeholder="admin@company.com"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Password</Label>
                  <Input
                    type="password"
                    value={setupForm.password}
                    onChange={(e) =>
                      setSetupForm((p) => ({ ...p, password: e.target.value }))
                    }
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-md shadow-primary/15" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Admin Account"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-xl"
                  onClick={() => setSetupMode(false)}
                >
                  Back to Login
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          © {new Date().getFullYear()} MaintainX Service Manager
        </p>
      </div>
    </div>
  );
}
