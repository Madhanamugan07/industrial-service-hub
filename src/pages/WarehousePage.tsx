import { useState } from "react";
import { useSpareParts, useCreateSparePart, useUpdateSparePart, useDeleteSparePart, type SparePart } from "@/hooks/useSpareParts";
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
import { Plus, Pencil, Trash2, Warehouse, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WarehousePage() {
  const { data: parts = [], isLoading } = useSpareParts();
  const createPart = useCreateSparePart();
  const updatePart = useUpdateSparePart();
  const deletePart = useDeleteSparePart();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SparePart | null>(null);
  const [form, setForm] = useState({ spare_part_name: "", quantity: "" });

  const openNew = () => {
    setEditing(null);
    setForm({ spare_part_name: "", quantity: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: SparePart) => {
    setEditing(p);
    setForm({ spare_part_name: p.spare_part_name, quantity: String(p.quantity) });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { spare_part_name: form.spare_part_name, quantity: parseInt(form.quantity) || 0 };
    if (editing) {
      await updatePart.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createPart.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouse</h1>
          <p className="text-sm text-muted-foreground mt-1">Spare parts inventory management</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" /> Add Part
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Spare Part" : "New Spare Part"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Part Name *</Label>
                <Input value={form.spare_part_name} onChange={(e) => setForm({ ...form, spare_part_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createPart.isPending || updatePart.isPending}>
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
              <TableHead>Spare Part Name</TableHead>
              <TableHead>Quantity Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!isLoading && parts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <Warehouse className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No spare parts in inventory</p>
                </TableCell>
              </TableRow>
            )}
            {parts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.spare_part_name}</TableCell>
                <TableCell>
                  <span className={cn("font-mono font-semibold", p.quantity <= 5 ? "text-destructive" : "text-foreground")}>
                    {p.quantity}
                  </span>
                </TableCell>
                <TableCell>
                  {p.quantity <= 5 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Low Stock
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-status-resolved">In Stock</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePart.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
