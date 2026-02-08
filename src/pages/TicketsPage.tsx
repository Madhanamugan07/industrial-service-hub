import { useState } from "react";
import { Link } from "react-router-dom";
import { useServiceTickets, useCreateTicket, type TicketStatus } from "@/hooks/useServiceTickets";
import { useCustomers } from "@/hooks/useCustomers";
import { useMachines } from "@/hooks/useMachines";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { ImageUpload } from "@/components/ImageUpload";
import { uploadImage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Ticket, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusFilters: (TicketStatus | "ALL")[] = ["ALL", "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

export default function TicketsPage() {
  const { data: tickets = [], isLoading } = useServiceTickets();
  const { data: customers = [] } = useCustomers();
  const { data: machines = [] } = useMachines();
  const createTicket = useCreateTicket();
  const { role, customerRecord } = useAuth();

  const isAdmin = role === "admin";
  const isCustomer = role === "customer";
  const isServicePerson = role === "service_person";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<TicketStatus | "ALL">("ALL");
  const [form, setForm] = useState({
    customer_id: "",
    machine_id: "",
    problem_description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let problem_image_url: string | undefined;
      if (imageFile) {
        const url = await uploadImage(imageFile, "problems");
        if (url) problem_image_url = url;
        else toast.error("Image upload failed");
      }

      // For customers, auto-set customer_id from their linked record
      const customerId = isCustomer ? customerRecord?.id : form.customer_id;
      if (!customerId) {
        toast.error("Customer record not found");
        return;
      }

      await createTicket.mutateAsync({
        customer_id: customerId,
        machine_id: form.machine_id,
        problem_description: form.problem_description,
        problem_image_url,
      });
      setDialogOpen(false);
      setForm({ customer_id: "", machine_id: "", problem_description: "" });
      setImageFile(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Only admin and customer can create tickets
  const canCreate = isAdmin || isCustomer;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isServicePerson ? "Assigned Tickets" : isCustomer ? "My Tickets" : "Service Tickets"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isServicePerson
              ? "Tickets assigned to you"
              : isCustomer
                ? "Track your service requests"
                : "Track and manage service requests"}
          </p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Raise Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Raise Service Ticket</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Admin: select customer. Customer: auto-set */}
                {isAdmin && (
                  <div className="space-y-2">
                    <Label>Customer *</Label>
                    <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Machine *</Label>
                  <Select value={form.machine_id} onValueChange={(v) => setForm({ ...form, machine_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select machine" /></SelectTrigger>
                    <SelectContent>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.machine_name} ({m.machine_id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Problem Description *</Label>
                  <Textarea
                    value={form.problem_description}
                    onChange={(e) => setForm({ ...form, problem_description: e.target.value })}
                    required
                    placeholder="Describe the issue..."
                    rows={3}
                  />
                </div>
                <ImageUpload label="Problem Image (optional)" onChange={setImageFile} />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button
                    type="submit"
                    disabled={
                      submitting ||
                      (!isCustomer && !form.customer_id) ||
                      !form.machine_id
                    }
                  >
                    {submitting ? "Creating..." : "Create Ticket"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {s === "ALL" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="industrial-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problem</TableHead>
              {isAdmin && <TableHead>Customer</TableHead>}
              <TableHead>Machine</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10">
                  <Ticket className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No tickets found</p>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{t.problem_description}</TableCell>
                {isAdmin && <TableCell className="text-sm">{t.customers?.name || "—"}</TableCell>}
                <TableCell className="text-sm font-mono">{t.machines?.machine_id || "—"}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell className="text-sm">{t.service_persons?.name || "—"}</TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">
                  {format(new Date(t.created_at), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/tickets/${t.id}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
