import { useServiceTickets } from "@/hooks/useServiceTickets";
import { useMachines } from "@/hooks/useMachines";
import { useCustomers } from "@/hooks/useCustomers";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Cog,
  Ticket,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const { data: tickets = [] } = useServiceTickets();
  const { data: machines = [] } = useMachines();
  const { data: customers = [] } = useCustomers();
  const { role } = useAuth();

  const openTickets = tickets.filter((t) => t.status === "OPEN");
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED");
  const inProgressTickets = tickets.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "ASSIGNED"
  );

  const isAdmin = role === "admin";

  const stats = [
    ...(isAdmin
      ? [
          {
            label: "Total Machines",
            value: machines.length,
            icon: Cog,
            gradient: "from-secondary to-secondary/80",
          },
        ]
      : []),
    {
      label: "Open Tickets",
      value: openTickets.length,
      icon: AlertCircle,
      gradient: "from-destructive to-destructive/80",
    },
    {
      label: "In Progress",
      value: inProgressTickets.length,
      icon: Clock,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Resolved",
      value: resolvedTickets.length,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-emerald-600",
    },
  ];

  const greeting =
    role === "customer"
      ? "Your Service Overview"
      : role === "service_person"
        ? "Your Assigned Work"
        : "Machine maintenance & service operations";

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">{greeting}</p>
      </div>

      {/* Stat cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-5`}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className="stat-card animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="stat-label">{stat.label}</span>
              <div className={`rounded-xl p-2.5 bg-gradient-to-br ${stat.gradient} shadow-sm`}>
                <stat.icon className="h-4.5 w-4.5 text-white" />
              </div>
            </div>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Quick info row */}
      <div className={`grid grid-cols-1 ${isAdmin ? "lg:grid-cols-2" : ""} gap-6`}>
        {/* Recent tickets */}
        <div className="industrial-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-bold text-foreground">
              {role === "service_person" ? "Assigned Tickets" : "Recent Service Tickets"}
            </h2>
            <Link
              to="/tickets"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {tickets.slice(0, 5).length === 0 && (
              <div className="px-6 py-14 text-center text-muted-foreground">
                <Ticket className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No tickets yet</p>
              </div>
            )}
            {tickets.slice(0, 5).map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-accent/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {ticket.problem_description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ticket.customers?.name || "Unknown"} •{" "}
                    {ticket.machines?.machine_name || "N/A"}
                  </p>
                </div>
                <StatusBadge status={ticket.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Admin-only: Customer count + Machine list */}
        {isAdmin && (
          <div className="space-y-6">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">Total Customers</span>
                <div className="rounded-xl p-2.5 bg-gradient-to-br from-primary to-primary/80 shadow-sm">
                  <Users className="h-4.5 w-4.5 text-white" />
                </div>
              </div>
              <span className="stat-value">{customers.length}</span>
            </div>

            <div className="industrial-card">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-bold text-foreground">Machine Fleet</h2>
                <Link
                  to="/machines"
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {machines.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
                      <Cog className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{m.machine_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {m.machine_id}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {m.model_number}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
