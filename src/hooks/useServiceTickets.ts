import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TicketStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";

export type ServiceTicket = {
  id: string;
  customer_id: string | null;
  machine_id: string | null;
  problem_description: string;
  status: TicketStatus;
  assigned_service_person_id: string | null;
  service_report: string | null;
  problem_image_url: string | null;
  inspection_image_url: string | null;
  repaired_image_url: string | null;
  created_at: string;
  updated_at: string;
  customers?: { name: string; machine_name: string } | null;
  machines?: { machine_id: string; machine_name: string } | null;
  service_persons?: { name: string; service_person_id: string } | null;
};

export type TicketSparePart = {
  id: string;
  ticket_id: string;
  spare_part_id: string;
  quantity_used: number;
  spare_parts?: { spare_part_name: string };
};

export const useServiceTickets = () =>
  useQuery({
    queryKey: ["service_tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_tickets")
        .select("*, customers(name, machine_name), machines(machine_id, machine_name), service_persons(name, service_person_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ServiceTicket[];
    },
  });

export const useServiceTicket = (id: string) =>
  useQuery({
    queryKey: ["service_tickets", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_tickets")
        .select("*, customers(name, machine_name), machines(machine_id, machine_name), service_persons(name, service_person_id)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as ServiceTicket | null;
    },
    enabled: !!id,
  });

export const useTicketSpareParts = (ticketId: string) =>
  useQuery({
    queryKey: ["ticket_spare_parts", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_spare_parts")
        .select("*, spare_parts(spare_part_name)")
        .eq("ticket_id", ticketId);
      if (error) throw error;
      return data as TicketSparePart[];
    },
    enabled: !!ticketId,
  });

export const useCreateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ticket: {
      customer_id: string;
      machine_id: string;
      problem_description: string;
      problem_image_url?: string;
    }) => {
      const { data, error } = await supabase.from("service_tickets").insert({ ...ticket, status: "OPEN" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["service_tickets"] }); toast.success("Ticket created"); },
    onError: (e) => toast.error(e.message),
  });
};

export const useUpdateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...ticket }: Partial<ServiceTicket> & { id: string }) => {
      const { data, error } = await supabase.from("service_tickets").update(ticket).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service_tickets"] });
      toast.success("Ticket updated");
    },
    onError: (e) => toast.error(e.message),
  });
};

export const useAddTicketSparePart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticket_id, spare_part_id, quantity_used }: { ticket_id: string; spare_part_id: string; quantity_used: number }) => {
      // Insert into ticket_spare_parts
      const { error: insertError } = await supabase.from("ticket_spare_parts").insert({ ticket_id, spare_part_id, quantity_used });
      if (insertError) throw insertError;

      // Reduce warehouse quantity
      const { data: part, error: fetchError } = await supabase.from("spare_parts").select("quantity").eq("id", spare_part_id).single();
      if (fetchError) throw fetchError;

      const newQty = Math.max(0, (part?.quantity || 0) - quantity_used);
      const { error: updateError } = await supabase.from("spare_parts").update({ quantity: newQty }).eq("id", spare_part_id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket_spare_parts"] });
      qc.invalidateQueries({ queryKey: ["spare_parts"] });
      toast.success("Spare part recorded & warehouse updated");
    },
    onError: (e) => toast.error(e.message),
  });
};
