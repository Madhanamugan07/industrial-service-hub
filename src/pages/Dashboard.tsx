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
  Activity,
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
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
        ]
      : []),
    {
      label: "Open Tickets",
      value: openTickets.length,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "In Progress",
      value: inProgressTickets.length,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Resolved",
      value: resolvedTickets.length,
      icon: CheckCircle2,
      color: "text-status-resolved",
      bgColor: "bg-status-resolved/10",
    },
  ];

  const greeting =
    role === "customer"
      ? "Your Service Overview"
      : role === "service_person"
        ? "Your Assigned Work"
        : "Machine maintenance & service operations";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <Activity className="h-5 w-5 text-primary" />
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{greeting}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className="stat-card animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="stat-label">{stat.label}</span>
              <div className={`rounded-md p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <span className="stat-value font-mono">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Quick info row */}
      <div className={`grid grid-cols-1 ${isAdmin ? "lg:grid-cols-2" : ""} gap-4`}>
        {/* Recent tickets */}
        <div className="industrial-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" />
              {role === "service_person" ? "Assigned Tickets" : "Recent Service Tickets"}
            </h2>
            <Link
              to="/tickets"
              className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {tickets.slice(0, 5).length === 0 && (
              <div className="px-5 py-12 text-center text-muted-foreground">
                <Ticket className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium">No tickets yet</p>
              </div>
            )}
            {tickets.slice(0, 5).map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/40 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {ticket.problem_description}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                    {ticket.customers?.name || "Unknown"} · {ticket.machines?.machine_name || "N/A"}
                  </p>
                </div>
                <StatusBadge status={ticket.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Admin-only: Customer count + Machine list */}
        {isAdmin && (
          <div className="space-y-4">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">Total Customers</span>
                <div className="rounded-md p-2 bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
              <span className="stat-value font-mono">{customers.length}</span>
            </div>

            <div className="industrial-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Cog className="h-4 w-4 text-primary" />
                  Machine Fleet
                </h2>
                <Link
                  to="/machines"
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {machines.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                      <Cog className="h-3.5 w-3.5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{m.machine_name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {m.machine_id}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
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
