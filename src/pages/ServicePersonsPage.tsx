import { useState } from "react";
import { useServicePersons, useCreateServicePerson, useUpdateServicePerson, useDeleteServicePerson, type ServicePerson } from "@/hooks/useServicePersons";
import { useServiceTickets } from "@/hooks/useServiceTickets";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, UserCog, ChevronDown, ChevronUp } from "lucide-react";

export default function ServicePersonsPage() {
  const { data: persons = [], isLoading } = useServicePersons();
  const { data: tickets = [] } = useServiceTickets();
  const createPerson = useCreateServicePerson();
  const updatePerson = useUpdateServicePerson();
  const deletePerson = useDeleteServicePerson();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServicePerson | null>(null);
  const [form, setForm] = useState({ service_person_id: "", name: "", contact_details: "" });
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ service_person_id: "", name: "", contact_details: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: ServicePerson) => {
    setEditing(p);
    setForm({ service_person_id: p.service_person_id, name: p.name, contact_details: p.contact_details || "" });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { service_person_id: form.service_person_id, name: form.name, contact_details: form.contact_details || undefined };
    if (editing) {
      await updatePerson.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createPerson.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const getAssignedTickets = (personId: string) =>
    tickets.filter((t) => t.assigned_service_person_id === personId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Service Persons</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage service technicians</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" /> Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Service Person" : "New Service Person"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Service Person ID *</Label>
                <Input value={form.service_person_id} onChange={(e) => setForm({ ...form, service_person_id: e.target.value })} required placeholder="SP-004" />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Contact Details</Label>
                <Input value={form.contact_details} onChange={(e) => setForm({ ...form, contact_details: e.target.value })} placeholder="+91 ..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createPerson.isPending || updatePerson.isPending}>
                  {editing ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="industrial-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Assigned Tickets</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!isLoading && persons.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <UserCog className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No service persons added</p>
                </TableCell>
              </TableRow>
            )}
            {persons.map((p) => {
              const assignedTickets = getAssignedTickets(p.id);
              const isExpanded = expandedPerson === p.id;
              return (
                <>
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-medium text-primary">{p.service_person_id}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.contact_details || "—"}</TableCell>
                    <TableCell>
                      {assignedTickets.length > 0 ? (
                        <button
                          onClick={() => setExpandedPerson(isExpanded ? null : p.id)}
                          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          {assignedTickets.length} ticket{assignedTickets.length > 1 ? "s" : ""}
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePerson.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && assignedTickets.map((t) => (
                    <TableRow key={t.id} className="bg-accent/30">
                      <TableCell colSpan={2} className="pl-10 text-sm">{t.problem_description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.customers?.name}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell />
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
