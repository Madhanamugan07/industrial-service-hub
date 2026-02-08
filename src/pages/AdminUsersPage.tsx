import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Shield, Users, Wrench, UserPlus } from "lucide-react";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "",
    machine_name: "",
    service_person_id: "",
    contact_details: "",
  });

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

  const resetForm = () =>
    setForm({
      email: "",
      password: "",
      full_name: "",
      role: "",
      machine_name: "",
      service_person_id: "",
      contact_details: "",
    });

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
        body.customer_details = { machine_name: form.machine_name || "N/A" };
      } else if (form.role === "service_person") {
        if (!form.service_person_id) {
          toast.error("Service Person ID is required");
          return;
        }
        body.service_person_details = {
          service_person_id: form.service_person_id,
          contact_details: form.contact_details || null,
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="service_person">
                      Service Person
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.role === "customer" && (
                <div className="space-y-2">
                  <Label>Machine Name</Label>
                  <Input
                    value={form.machine_name}
                    onChange={(e) =>
                      setForm({ ...form, machine_name: e.target.value })
                    }
                    placeholder="e.g. CNC Lathe"
                  />
                </div>
              )}

              {form.role === "service_person" && (
                <>
                  <div className="space-y-2">
                    <Label>Service Person ID *</Label>
                    <Input
                      value={form.service_person_id}
                      onChange={(e) =>
                        setForm({ ...form, service_person_id: e.target.value })
                      }
                      required
                      placeholder="e.g. SP-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Details</Label>
                    <Input
                      value={form.contact_details}
                      onChange={(e) =>
                        setForm({ ...form, contact_details: e.target.value })
                      }
                      placeholder="Phone or email"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !form.role || !form.full_name}
                >
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
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No users found
                  </p>
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => {
              const roleName = u.user_roles?.[0]?.role || "unknown";
              const RoleIcon = roleIcons[roleName] || Users;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell className="text-sm font-mono">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadgeStyles[roleName] || "bg-muted text-muted-foreground"}`}
                    >
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
