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
  ChevronRight,
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
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center gap-3.5 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
            <Cog className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">MaintainX</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/50 font-medium">Service Manager</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent lg:hidden transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40 font-semibold px-3 mb-3">Navigation</p>
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
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground shadow-md shadow-primary/15"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px]", isActive ? "" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70")} />
                <span className="flex-1">{item.title}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer with user + logout */}
        <div className="border-t border-sidebar-border px-5 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sidebar-primary/30 to-sidebar-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-sidebar-primary">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.email}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-medium">
                {roleLabels[role || ""] || "User"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/50 hover:text-white hover:bg-sidebar-accent rounded-xl"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-primary/8 text-primary border border-primary/15">
              {roleLabels[role || ""] || "User"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
