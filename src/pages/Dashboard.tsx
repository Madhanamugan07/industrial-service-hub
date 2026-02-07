import { useServiceTickets } from "@/hooks/useServiceTickets";
import { useMachines } from "@/hooks/useMachines";
import { useCustomers } from "@/hooks/useCustomers";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import {
  Cog,
  Ticket,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";

export default function Dashboard() {
  const { data: tickets = [] } = useServiceTickets();
  const { data: machines = [] } = useMachines();
  const { data: customers = [] } = useCustomers();

  const openTickets = tickets.filter((t) => t.status === "OPEN");
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED");
  const inProgressTickets = tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "ASSIGNED");

  const stats = [
    {
      label: "Total Machines",
      value: machines.length,
      icon: Cog,
      color: "text-steel-dark",
      bg: "bg-steel/10",
    },
    {
      label: "Open Tickets",
      value: openTickets.length,
      icon: AlertCircle,
      color: "text-status-open",
      bg: "bg-status-open/10",
    },
    {
      label: "In Progress",
      value: inProgressTickets.length,
      icon: Clock,
      color: "text-status-in-progress",
      bg: "bg-status-in-progress/10",
    },
    {
      label: "Resolved",
      value: resolvedTickets.length,
      icon: CheckCircle2,
      color: "text-status-resolved",
      bg: "bg-status-resolved/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of machine maintenance & service operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between">
              <span className="stat-label">{stat.label}</span>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Quick info row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tickets */}
        <div className="industrial-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-semibold text-foreground">Recent Service Tickets</h2>
            <Link
              to="/tickets"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {tickets.slice(0, 5).length === 0 && (
              <div className="px-6 py-10 text-center text-muted-foreground">
                <Ticket className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No tickets yet</p>
              </div>
            )}
            {tickets.slice(0, 5).map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ticket.problem_description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ticket.customers?.name || "Unknown"} • {ticket.machines?.machine_name || "N/A"}
                  </p>
                </div>
                <StatusBadge status={ticket.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Customer count + Machine list */}
        <div className="space-y-6">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Total Customers</span>
              <div className="rounded-lg p-2 bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <span className="stat-value">{customers.length}</span>
          </div>

          <div className="industrial-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-semibold text-foreground">Machine Fleet</h2>
              <Link
                to="/machines"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {machines.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-6 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-accent">
                    <Cog className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.machine_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{m.machine_id}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{m.model_number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
