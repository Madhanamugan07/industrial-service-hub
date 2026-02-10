import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMachines } from "@/hooks/useMachines";
import { ImageUpload } from "@/components/ImageUpload";
import { uploadServicePersonPhoto } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Shield, Users, Wrench, UserPlus, Cog } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  user_roles: { role: string }[];
};

const roleIcons: Record<string, typeof Shield> = {
  admin: Shield,
  customer: Users,
  service_person: Wrench,
};

const roleBadgeStyles: Record<string, string> = {
  admin: "bg-primary/10 text-primary",
  customer: "bg-status-in-progress/10 text-status-in-progress",
  service_person: "bg-status-assigned/10 text-status-assigned",
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const { data: machines = [] } = useMachines();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "",
    machine_name: "",
    selected_machine_ids: [] as string[],
    purchase_date: "",
    service_person_id: "",
    contact_details: "",
  });
  const [spPhotoFile, setSpPhotoFile] = useState<File | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  const resetForm = () => {
    setForm({
      email: "",
      password: "",
      full_name: "",
      role: "",
      machine_name: "",
      selected_machine_ids: [],
      purchase_date: "",
      service_person_id: "",
      contact_details: "",
    });
    setSpPhotoFile(null);
  };

  const toggleMachine = (machineId: string) => {
    setForm((prev) => ({
      ...prev,
      selected_machine_ids: prev.selected_machine_ids.includes(machineId)
        ? prev.selected_machine_ids.filter((id) => id !== machineId)
        : [...prev.selected_machine_ids, machineId],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const body: any = {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        role: form.role,
      };

      if (form.role === "customer") {
        const selectedNames = machines
          .filter((m) => form.selected_machine_ids.includes(m.id))
          .map((m) => m.machine_name)
          .join(", ");
        body.customer_details = {
          machine_name: selectedNames || form.machine_name || "N/A",
          machine_ids: form.selected_machine_ids,
          purchase_date: form.purchase_date || null,
        };
      } else if (form.role === "service_person") {
        if (!form.service_person_id) {
          toast.error("Service Person ID is required");
          return;
        }
        let photo_url: string | null = null;
        if (spPhotoFile) {
          const url = await uploadServicePersonPhoto(spPhotoFile);
          if (url) photo_url = url;
          else toast.error("Photo upload failed, continuing without photo");
        }
        body.service_person_details = {
          service_person_id: form.service_person_id,
          contact_details: form.contact_details || null,
          photo_url,
        };
      }

      const res = await supabase.functions.invoke("create-user", { body });
      if (res.error) throw res.error;
      const resData = res.data as any;
      if (resData?.error) throw new Error(resData.error);

      toast.success("User created successfully");
      setDialogOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin_users"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage user accounts
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="user@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v, selected_machine_ids: [] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" /> Admin</span>
                    </SelectItem>
                    <SelectItem value="customer">
                      <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Customer</span>
                    </SelectItem>
                    <SelectItem value="service_person">
                      <span className="flex items-center gap-2"><Wrench className="h-3.5 w-3.5" /> Service Person</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.role === "customer" && (
                <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Cog className="h-4 w-4 text-primary" />
                    Customer — Machine Assignment
                  </div>
                  <div className="space-y-2">
                    <Label>Select Machines (can select multiple)</Label>
                    {machines.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No machines available. Add machines first.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto rounded-md border border-input bg-background p-3">
                        {machines.map((m) => (
                          <label
                            key={m.id}
                            className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={form.selected_machine_ids.includes(m.id)}
                              onCheckedChange={() => toggleMachine(m.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium">{m.machine_name}</span>
                              <span className="text-xs text-muted-foreground ml-2">({m.machine_id} · {m.model_number})</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {form.selected_machine_ids.length > 0 && (
                      <p className="text-xs text-primary font-medium">
                        {form.selected_machine_ids.length} machine{form.selected_machine_ids.length > 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Date</Label>
                    <Input
                      type="date"
                      value={form.purchase_date}
                      onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {form.role === "service_person" && (
                <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Wrench className="h-4 w-4 text-primary" />
                    Service Person Details
                  </div>
                  <div className="space-y-2">
                    <Label>Service Person ID *</Label>
                    <Input
                      value={form.service_person_id}
                      onChange={(e) => setForm({ ...form, service_person_id: e.target.value })}
                      required
                      placeholder="e.g. SP-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Details</Label>
                    <Input
                      value={form.contact_details}
                      onChange={(e) => setForm({ ...form, contact_details: e.target.value })}
                      placeholder="Phone or email"
                    />
                  </div>
                  <ImageUpload
                    label="Service Person Photo"
                    onChange={setSpPhotoFile}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !form.role || !form.full_name}>
                  {submitting ? "Creating..." : "Create User"}
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => {
              const roleName = u.user_roles?.[0]?.role || "unknown";
              const RoleIcon = roleIcons[roleName] || Users;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell className="text-sm font-mono">{u.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadgeStyles[roleName] || "bg-muted text-muted-foreground"}`}>
                      <RoleIcon className="h-3 w-3" />
                      {roleName.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {format(new Date(u.created_at), "dd MMM yyyy")}
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
