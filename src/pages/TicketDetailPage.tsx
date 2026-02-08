import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useServiceTicket,
  useUpdateTicket,
  useTicketSpareParts,
  useAddTicketSparePart,
  type TicketStatus,
} from "@/hooks/useServiceTickets";
import { useServicePersons } from "@/hooks/useServicePersons";
import { useSpareParts } from "@/hooks/useSpareParts";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { ImageUpload } from "@/components/ImageUpload";
import { uploadImage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  User,
  Cog,
  Calendar,
  FileText,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading } = useServiceTicket(id!);
  const { data: usedParts = [] } = useTicketSpareParts(id!);
  const { data: persons = [] } = useServicePersons();
  const { data: spareParts = [] } = useSpareParts();
  const updateTicket = useUpdateTicket();
  const addSparePart = useAddTicketSparePart();
  const { role } = useAuth();

  const isAdmin = role === "admin";
  const isServicePerson = role === "service_person";
  const canDoServiceWork = isAdmin || isServicePerson;

  const [assignPerson, setAssignPerson] = useState("");
  const [serviceReport, setServiceReport] = useState("");
  const [sparePartId, setSparePartId] = useState("");
  const [spareQty, setSpareQty] = useState("1");
  const [uploading, setUploading] = useState(false);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );
  if (!ticket)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Ticket not found
      </div>
    );

  const handleAssign = async () => {
    if (!assignPerson) return;
    await updateTicket.mutateAsync({
      id: ticket.id,
      assigned_service_person_id: assignPerson,
      status: "ASSIGNED" as TicketStatus,
    });
    setAssignPerson("");
  };

  const handleStatusChange = async (status: TicketStatus) => {
    await updateTicket.mutateAsync({ id: ticket.id, status });
  };

  const handleImageUpload = async (
    file: File | null,
    field: "inspection_image_url" | "repaired_image_url"
  ) => {
    if (!file) return;
    setUploading(true);
    try {
      const folder =
        field === "inspection_image_url" ? "inspections" : "repairs";
      const url = await uploadImage(file, folder);
      if (url) {
        await updateTicket.mutateAsync({ id: ticket.id, [field]: url });
      } else {
        toast.error("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleServiceReport = async () => {
    if (!serviceReport.trim()) return;
    await updateTicket.mutateAsync({ id: ticket.id, service_report: serviceReport });
    toast.success("Service report saved");
  };

  const handleAddSparePart = async () => {
    if (!sparePartId || !spareQty) return;
    await addSparePart.mutateAsync({
      ticket_id: ticket.id,
      spare_part_id: sparePartId,
      quantity_used: parseInt(spareQty),
    });
    setSparePartId("");
    setSpareQty("1");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/tickets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="page-title">Ticket Details</h1>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            {ticket.id}
          </p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="industrial-card p-5 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> Customer Info
          </h3>
          <div className="space-y-1.5">
            <p className="text-sm">
              <span className="text-muted-foreground">Name:</span>{" "}
              <span className="font-medium">
                {ticket.customers?.name || "—"}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Machine:</span>{" "}
              <span className="font-medium">
                {ticket.customers?.machine_name || "—"}
              </span>
            </p>
          </div>
        </div>
        <div className="industrial-card p-5 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Cog className="h-4 w-4" /> Machine Info
          </h3>
          <div className="space-y-1.5">
            <p className="text-sm">
              <span className="text-muted-foreground">ID:</span>{" "}
              <span className="font-mono font-medium text-primary">
                {ticket.machines?.machine_id || "—"}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Name:</span>{" "}
              <span className="font-medium">
                {ticket.machines?.machine_name || "—"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Problem description */}
      <div className="industrial-card p-5 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileText className="h-4 w-4" /> Problem Description
        </h3>
        <p className="text-sm leading-relaxed">{ticket.problem_description}</p>
        {ticket.problem_image_url && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Problem Image
            </p>
            <img
              src={ticket.problem_image_url}
              alt="Problem"
              className="rounded-lg border border-border max-h-64 object-cover"
            />
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <Calendar className="h-3.5 w-3.5" />
          Created {format(new Date(ticket.created_at), "dd MMM yyyy, HH:mm")}
        </div>
      </div>

      {/* Assign service person — Admin only, OPEN status */}
      {isAdmin && ticket.status === "OPEN" && (
        <div className="industrial-card p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Assign Service Person
          </h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label>Service Person</Label>
              <Select value={assignPerson} onValueChange={setAssignPerson}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {persons.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.service_person_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAssign}
              disabled={!assignPerson || updateTicket.isPending}
            >
              Assign & Update
            </Button>
          </div>
        </div>
      )}

      {/* Assigned info (visible to all) */}
      {ticket.status === "ASSIGNED" && ticket.service_persons && (
        <div className="industrial-card p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Assigned To
          </h3>
          <p className="font-medium">
            {ticket.service_persons.name}{" "}
            <span className="font-mono text-xs text-muted-foreground">
              ({ticket.service_persons.service_person_id})
            </span>
          </p>
          {/* Service person or admin can start work */}
          {canDoServiceWork && (
            <Button onClick={() => handleStatusChange("IN_PROGRESS")}>
              Start Work (Move to In Progress)
            </Button>
          )}
        </div>
      )}

      {/* Service actions — Service person & Admin only */}
      {canDoServiceWork &&
        (ticket.status === "IN_PROGRESS" || ticket.status === "ASSIGNED") && (
          <>
            {/* Inspection photo upload */}
            <div className="industrial-card p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Inspection / Service Photos
              </h3>
              {ticket.inspection_image_url ? (
                <img
                  src={ticket.inspection_image_url}
                  alt="Inspection"
                  className="rounded-lg border border-border max-h-64 object-cover"
                />
              ) : (
                <ImageUpload
                  label="Upload Inspection Photo"
                  onChange={(f) =>
                    f && handleImageUpload(f, "inspection_image_url")
                  }
                />
              )}
            </div>

            {/* Service report */}
            <div className="industrial-card p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" /> Service Report
              </h3>
              <Textarea
                value={serviceReport || ticket.service_report || ""}
                onChange={(e) => setServiceReport(e.target.value)}
                placeholder="Write service report..."
                rows={4}
              />
              <Button
                onClick={handleServiceReport}
                variant="outline"
                disabled={updateTicket.isPending}
              >
                Save Report
              </Button>
            </div>

            {/* Spare parts used */}
            <div className="industrial-card p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" /> Spare Parts Used
              </h3>
              {usedParts.length > 0 && (
                <div className="space-y-2">
                  {usedParts.map((up) => (
                    <div
                      key={up.id}
                      className="flex items-center justify-between px-3 py-2 bg-accent/50 rounded-md text-sm"
                    >
                      <span className="font-medium">
                        {up.spare_parts?.spare_part_name}
                      </span>
                      <span className="font-mono">×{up.quantity_used}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Spare Part</Label>
                  <Select value={sparePartId} onValueChange={setSparePartId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select part" />
                    </SelectTrigger>
                    <SelectContent>
                      {spareParts.map((sp) => (
                        <SelectItem key={sp.id} value={sp.id}>
                          {sp.spare_part_name} (Qty: {sp.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20 space-y-2">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={spareQty}
                    onChange={(e) => setSpareQty(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddSparePart}
                  variant="outline"
                  disabled={!sparePartId || addSparePart.isPending}
                >
                  Add
                </Button>
              </div>
            </div>
          </>
        )}

      {/* Resolve section — Admin & Service Person */}
      {canDoServiceWork && ticket.status === "IN_PROGRESS" && (
        <div className="industrial-card p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Complete & Resolve
          </h3>
          {ticket.repaired_image_url ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Repaired Machine Photo
              </p>
              <img
                src={ticket.repaired_image_url}
                alt="Repaired"
                className="rounded-lg border border-border max-h-64 object-cover"
              />
            </div>
          ) : (
            <ImageUpload
              label="Upload Repaired Machine Photo"
              onChange={(f) =>
                f && handleImageUpload(f, "repaired_image_url")
              }
            />
          )}
          <Button
            onClick={() => handleStatusChange("RESOLVED")}
            className="w-full"
          >
            Mark as Resolved
          </Button>
        </div>
      )}

      {/* Resolved summary — visible to everyone */}
      {ticket.status === "RESOLVED" && (
        <div className="industrial-card p-5 space-y-4 border-status-resolved/30">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-status-resolved flex items-center gap-2">
            ✓ Resolved
          </h3>
          {ticket.service_persons && (
            <p className="text-sm">
              <span className="text-muted-foreground">Service Person:</span>{" "}
              <span className="font-medium">
                {ticket.service_persons.name}
              </span>
            </p>
          )}
          {ticket.service_report && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Service Report
              </p>
              <p className="text-sm bg-accent/50 rounded-md p-3">
                {ticket.service_report}
              </p>
            </div>
          )}
          {usedParts.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Parts Used
              </p>
              <div className="space-y-1">
                {usedParts.map((up) => (
                  <div
                    key={up.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{up.spare_parts?.spare_part_name}</span>
                    <span className="font-mono">×{up.quantity_used}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-4 mt-3">
            {ticket.inspection_image_url && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Inspection</p>
                <img
                  src={ticket.inspection_image_url}
                  alt="Inspection"
                  className="rounded border border-border h-32 object-cover"
                />
              </div>
            )}
            {ticket.repaired_image_url && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Repaired</p>
                <img
                  src={ticket.repaired_image_url}
                  alt="Repaired"
                  className="rounded border border-border h-32 object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
