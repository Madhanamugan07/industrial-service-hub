import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Cog } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary animate-pulse">
          <Cog className="h-8 w-8 text-primary-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/** Layout route: redirects to /auth if not logged in */
export function ProtectedRouteLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

/** Wrapper for admin-only routes */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}
