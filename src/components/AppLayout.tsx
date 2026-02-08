import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Cog,
  Warehouse,
  UserCog,
  Ticket,
  Menu,
  X,
  LogOut,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

type NavItem = { title: string; path: string; icon: typeof LayoutDashboard };

function getNavItems(role: AppRole | null): NavItem[] {
  const items: NavItem[] = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard },
  ];

  if (role === "admin") {
    items.push(
      { title: "Customers", path: "/customers", icon: Users },
      { title: "Machines", path: "/machines", icon: Cog },
      { title: "Warehouse", path: "/warehouse", icon: Warehouse },
      { title: "Service Persons", path: "/service-persons", icon: UserCog },
      { title: "Service Tickets", path: "/tickets", icon: Ticket },
      { title: "User Management", path: "/users", icon: Shield }
    );
  } else if (role === "customer") {
    items.push({ title: "My Tickets", path: "/tickets", icon: Ticket });
  } else if (role === "service_person") {
    items.push({ title: "Assigned Tickets", path: "/tickets", icon: Ticket });
  }

  return items;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  customer: "Customer",
  service_person: "Service Person",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role, user, signOut } = useAuth();
  const navItems = getNavItems(role);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Cog className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-accent-foreground">MaintainX</h1>
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Service Manager</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-md p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Footer with user + logout */}
        <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
              <UserCog className="h-4 w-4 text-sidebar-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                {user?.email}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
                {roleLabels[role || ""] || "User"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {roleLabels[role || ""] || "User"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
