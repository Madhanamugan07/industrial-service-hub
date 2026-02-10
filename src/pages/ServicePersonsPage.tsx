import { useState } from "react";
import { useServicePersons, useUpdateServicePerson, type ServicePerson } from "@/hooks/useServicePersons";
import { useServiceTickets } from "@/hooks/useServiceTickets";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { ImageUpload } from "@/components/ImageUpload";
import { uploadServicePersonPhoto } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCog, ChevronDown, ChevronUp, Phone, Pencil, Camera } from "lucide-react";
import { toast } from "sonner";

export default function ServicePersonsPage() {
  const { data: persons = [], isLoading } = useServicePersons();
  const { data: tickets = [] } = useServiceTickets();
  const updatePerson = useUpdateServicePerson();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServicePerson | null>(null);
  const [editForm, setEditForm] = useState({ name: "", contact_details: "", service_person_id: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const getAssignedTickets = (personId: string) =>
    tickets.filter((t) => t.assigned_service_person_id === personId);

  const openEdit = (p: ServicePerson) => {
    setEditing(p);
    setEditForm({
      name: p.name,
      contact_details: p.contact_details || "",
      service_person_id: p.service_person_id,
    });
    setPhotoFile(null);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    try {
      let photo_url = editing.photo_url;
      if (photoFile) {
        const url = await uploadServicePersonPhoto(photoFile);
        if (url) photo_url = url;
        else toast.error("Photo upload failed");
      }

      await updatePerson.mutateAsync({
        id: editing.id,
        name: editForm.name,
        contact_details: editForm.contact_details || undefined,
        service_person_id: editForm.service_person_id,
        photo_url,
      });
      setEditDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Service Persons</h1>
          <p className="text-sm text-muted-foreground mt-1">View service technicians and their assigned work</p>
        </div>
      </div>

      {/* Edit Dialog (admin only) */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service Person</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">Service Person ID</Label>
              <Input
                value={editForm.service_person_id}
                onChange={(e) => setEditForm({ ...editForm, service_person_id: e.target.value })}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">Contact Details</Label>
              <Input
                value={editForm.contact_details}
                onChange={(e) => setEditForm({ ...editForm, contact_details: e.target.value })}
                placeholder="Phone or email"
                className="h-11 rounded-xl"
              />
            </div>
            <ImageUpload
              label="Update Photo"
              value={editing?.photo_url}
              onChange={setPhotoFile}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="rounded-xl" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="industrial-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-bold w-16">Photo</TableHead>
              <TableHead className="font-bold">ID</TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Contact</TableHead>
              <TableHead className="font-bold">Assigned Tickets</TableHead>
              {isAdmin && <TableHead className="font-bold w-20">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-16 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!isLoading && persons.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-16">
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
                    <TableCell>
                      {p.photo_url ? (
                        <img
                          src={p.photo_url}
                          alt={p.name}
                          className="h-10 w-10 rounded-xl object-cover border border-border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Camera className="h-4 w-4 text-primary/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-primary text-sm">{p.service_person_id}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{p.name}</span>
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
                    {isAdmin && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Edit details">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                  {isExpanded && assignedTickets.map((t) => (
                    <TableRow key={t.id} className="bg-accent/20 border-l-2 border-l-primary/30">
                      <TableCell />
                      <TableCell />
                      <TableCell className="text-sm font-medium">{t.problem_description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.customers?.name}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      {isAdmin && <TableCell />}
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
