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
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Cog className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">MaintainX</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Service Manager
            </p>
          </div>
        </div>

        <div className="industrial-card p-6 space-y-6">
          {!setupMode ? (
            <>
              <div className="text-center">
                <h2 className="text-lg font-semibold">Sign In</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your credentials to continue
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              {needsSetup && (
                <div className="border-t border-border pt-4 text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    No admin account found
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
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
                <h2 className="text-lg font-semibold">Setup Admin Account</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create the first admin to get started
                </p>
              </div>
              <form onSubmit={handleBootstrap} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={setupForm.full_name}
                    onChange={(e) =>
                      setSetupForm((p) => ({ ...p, full_name: e.target.value }))
                    }
                    required
                    placeholder="Admin Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={setupForm.email}
                    onChange={(e) =>
                      setSetupForm((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    placeholder="admin@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={setupForm.password}
                    onChange={(e) =>
                      setSetupForm((p) => ({ ...p, password: e.target.value }))
                    }
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Admin Account"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setSetupMode(false)}
                >
                  Back to Login
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
