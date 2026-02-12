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
  Activity,
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
  admin: "Administrator",
  customer: "Customer",
  service_person: "Technician",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role, user, signOut } = useAuth();
  const navItems = getNavItems(role);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:relative lg:translate-x-0 border-r border-sidebar-border",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">MaintainX</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/40 font-medium mt-0.5">Industrial OS</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded p-1 text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent lg:hidden transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[9px] uppercase tracking-[0.18em] text-sidebar-foreground/30 font-semibold px-3 mb-2">Menu</p>
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
                  "group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/15 text-white border-l-2 border-primary"
                    : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-2 border-transparent"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-sidebar-foreground/35 group-hover:text-sidebar-foreground/60")} />
                <span>{item.title}</span>
                {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary indicator-dot" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-sidebar-accent flex items-center justify-center">
              <span className="text-[11px] font-bold text-primary">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white/80 truncate">
                {user?.email}
              </p>
              <p className="text-[9px] uppercase tracking-widest text-sidebar-foreground/30 font-medium">
                {roleLabels[role || ""] || "User"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/40 hover:text-white hover:bg-sidebar-accent rounded-md text-xs h-8"
            onClick={signOut}
          >
            <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-status-resolved indicator-dot" />
              <span className="font-medium">System Online</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/8 text-primary border border-primary/15 font-mono">
              {roleLabels[role || ""] || "User"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
