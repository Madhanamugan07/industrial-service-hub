import { useState } from "react";
import { useMachines, useCreateMachine, useUpdateMachine, useDeleteMachine, type Machine } from "@/hooks/useMachines";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cog, Plus, Pencil, Trash2 } from "lucide-react";

export default function MachinesPage() {
  const { data: machines = [], isLoading } = useMachines();
  const createMachine = useCreateMachine();
  const updateMachine = useUpdateMachine();
  const deleteMachine = useDeleteMachine();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [form, setForm] = useState({ machine_id: "", machine_name: "", model_number: "" });

  const openCreate = () => {
    setEditing(null);
    setForm({ machine_id: "", machine_name: "", model_number: "" });
    setDialogOpen(true);
  };

  const openEdit = (m: Machine) => {
    setEditing(m);
    setForm({ machine_id: m.machine_id, machine_name: m.machine_name, model_number: m.model_number });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateMachine.mutateAsync({ id: editing.id, ...form });
    } else {
      await createMachine.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Machines</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage machine records</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Machine
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Machine" : "Add Machine"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Machine ID *</Label>
              <Input value={form.machine_id} onChange={(e) => setForm({ ...form, machine_id: e.target.value })} required placeholder="e.g. MCH-001" />
            </div>
            <div className="space-y-2">
              <Label>Machine Name *</Label>
              <Input value={form.machine_name} onChange={(e) => setForm({ ...form, machine_name: e.target.value })} required placeholder="e.g. CNC Lathe" />
            </div>
            <div className="space-y-2">
              <Label>Model Number *</Label>
              <Input value={form.model_number} onChange={(e) => setForm({ ...form, model_number: e.target.value })} required placeholder="e.g. XL-500" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMachine.isPending || updateMachine.isPending}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="industrial-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Machine ID</TableHead>
              <TableHead>Machine Name</TableHead>
              <TableHead>Model Number</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!isLoading && machines.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <Cog className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No machines registered</p>
                </TableCell>
              </TableRow>
            )}
            {machines.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono font-medium text-primary">{m.machine_id}</TableCell>
                <TableCell className="font-medium">{m.machine_name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{m.model_number}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete machine?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete {m.machine_name}. This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMachine.mutate(m.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
