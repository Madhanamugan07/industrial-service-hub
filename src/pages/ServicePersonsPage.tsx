import { useState } from "react";
import { useServicePersons, type ServicePerson } from "@/hooks/useServicePersons";
import { useServiceTickets } from "@/hooks/useServiceTickets";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCog, ChevronDown, ChevronUp, Phone } from "lucide-react";

export default function ServicePersonsPage() {
  const { data: persons = [], isLoading } = useServicePersons();
  const { data: tickets = [] } = useServiceTickets();

  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const getAssignedTickets = (personId: string) =>
    tickets.filter((t) => t.assigned_service_person_id === personId);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Service Persons</h1>
          <p className="text-sm text-muted-foreground mt-1">View service technicians and their assigned work</p>
        </div>
      </div>

      <div className="industrial-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-bold">ID</TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Contact</TableHead>
              <TableHead className="font-bold">Assigned Tickets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={4} className="text-center py-16 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!isLoading && persons.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16">
                  <UserCog className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No service persons found</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Create service person accounts from User Management</p>
                </TableCell>
              </TableRow>
            )}
            {persons.map((p) => {
              const assignedTickets = getAssignedTickets(p.id);
              const isExpanded = expandedPerson === p.id;
              return (
                <>
                  <TableRow key={p.id} className="group hover:bg-accent/30 transition-colors">
                    <TableCell className="font-mono font-semibold text-primary text-sm">{p.service_person_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{p.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-semibold">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.contact_details ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {p.contact_details}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground/50 italic">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {assignedTickets.length > 0 ? (
                        <button
                          onClick={() => setExpandedPerson(isExpanded ? null : p.id)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-primary/10 text-xs font-bold text-primary">
                            {assignedTickets.length}
                          </span>
                          ticket{assignedTickets.length > 1 ? "s" : ""}
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">No active tickets</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {isExpanded && assignedTickets.map((t) => (
                    <TableRow key={t.id} className="bg-accent/20 border-l-2 border-l-primary/30">
                      <TableCell />
                      <TableCell className="text-sm font-medium">{t.problem_description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.customers?.name}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                    </TableRow>
                  ))}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
