import { useState } from "react";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, type Customer } from "@/hooks/useCustomers";
import { useMachines } from "@/hooks/useMachines";
import { useAllCustomerMachines, useLinkMachines, useUnlinkMachine } from "@/hooks/useCustomerMachines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, Cog, Link2, Unlink } from "lucide-react";
import { format } from "date-fns";

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useCustomers();
  const { data: machines = [] } = useMachines();
  const { data: allLinks = [] } = useAllCustomerMachines();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const linkMachines = useLinkMachines();
  const unlinkMachine = useUnlinkMachine();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [machineDialogOpen, setMachineDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", machine_name: "", purchase_date: "", previous_service_date: "" });
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", machine_name: "", purchase_date: "", previous_service_date: "" });
    setDialogOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      machine_name: c.machine_name,
      purchase_date: c.purchase_date || "",
      previous_service_date: c.previous_service_date || "",
    });
    setDialogOpen(true);
  };

  const openMachineDialog = (c: Customer) => {
    setSelectedCustomer(c);
    setSelectedMachineIds([]);
    setMachineDialogOpen(true);
  };

  const customerMachineLinks = (customerId: string) =>
    allLinks.filter((l) => l.customer_id === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      machine_name: form.machine_name,
      purchase_date: form.purchase_date || null,
      previous_service_date: form.previous_service_date || null,
    };

    if (editing) {
      await updateCustomer.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createCustomer.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const handleLinkMachines = async () => {
    if (!selectedCustomer || selectedMachineIds.length === 0) return;
    await linkMachines.mutateAsync({
      customerId: selectedCustomer.id,
      machineIds: selectedMachineIds,
    });
    setMachineDialogOpen(false);
  };

  const toggleMachine = (id: string) => {
    setSelectedMachineIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer records and their machines</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Customer" : "New Customer"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Primary Machine Name *</Label>
                <Input value={form.machine_name} onChange={(e) => setForm({ ...form, machine_name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Previous Service Date</Label>
                  <Input type="date" value={form.previous_service_date} onChange={(e) => setForm({ ...form, previous_service_date: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createCustomer.isPending || updateCustomer.isPending}>
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Link machines dialog */}
      <Dialog open={machineDialogOpen} onOpenChange={setMachineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cog className="h-5 w-5 text-primary" />
              Link Machines to {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          {(() => {
            const existingIds = selectedCustomer
              ? customerMachineLinks(selectedCustomer.id).map((l) => l.machine_id)
              : [];
            const available = machines.filter((m) => !existingIds.includes(m.id));
            return available.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All machines are already linked or no machines exist.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto rounded-md border border-input bg-background p-3">
                  {available.map((m) => (
                    <label key={m.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer transition-colors">
                      <Checkbox
                        checked={selectedMachineIds.includes(m.id)}
                        onCheckedChange={() => toggleMachine(m.id)}
                      />
                      <div>
                        <span className="text-sm font-medium">{m.machine_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{m.machine_id} · {m.model_number}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setMachineDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleLinkMachines} disabled={selectedMachineIds.length === 0 || linkMachines.isPending}>
                    Link {selectedMachineIds.length} Machine{selectedMachineIds.length !== 1 ? "s" : ""}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <div className="industrial-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Machines</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Last Service</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!isLoading && customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No customers yet</p>
                </TableCell>
              </TableRow>
            )}
            {customers.map((c) => {
              const linked = customerMachineLinks(c.id);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {linked.length > 0 ? (
                        linked.map((l) => (
                          <Badge key={l.id} variant="secondary" className="gap-1 text-xs group">
                            <Cog className="h-3 w-3" />
                            {l.machines?.machine_name || "Unknown"}
                            <button
                              onClick={() => unlinkMachine.mutate(l.id)}
                              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Unlink"
                            >
                              <Unlink className="h-3 w-3 text-destructive" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">{c.machine_name}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{c.purchase_date ? format(new Date(c.purchase_date), "dd MMM yyyy") : "—"}</TableCell>
                  <TableCell className="font-mono text-sm">{c.previous_service_date ? format(new Date(c.previous_service_date), "dd MMM yyyy") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openMachineDialog(c)} title="Link machines">
                        <Link2 className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCustomer.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
