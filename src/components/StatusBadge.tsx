import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/hooks/useServiceTickets";

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "status-open" },
  ASSIGNED: { label: "Assigned", className: "status-assigned" },
  IN_PROGRESS: { label: "In Progress", className: "status-in-progress" },
  RESOLVED: { label: "Resolved", className: "status-resolved" },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn("status-badge", config.className)}>
      {config.label}
    </span>
  );
}
