import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CustomerMachine = {
  id: string;
  customer_id: string;
  machine_id: string;
  purchase_date: string | null;
  created_at: string;
  machines?: {
    id: string;
    machine_id: string;
    machine_name: string;
    model_number: string;
  };
};

export const useCustomerMachines = (customerId?: string) =>
  useQuery({
    queryKey: ["customer_machines", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_machines")
        .select("*, machines(id, machine_id, machine_name, model_number)")
        .eq("customer_id", customerId!)
        .order("created_at");
      if (error) throw error;
      return data as CustomerMachine[];
    },
  });

export const useAllCustomerMachines = () =>
  useQuery({
    queryKey: ["customer_machines_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_machines")
        .select("*, machines(id, machine_id, machine_name, model_number)");
      if (error) throw error;
      return data as CustomerMachine[];
    },
  });

export const useLinkMachines = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, machineIds, purchaseDate }: { customerId: string; machineIds: string[]; purchaseDate?: string | null }) => {
      const links = machineIds.map((mid) => ({
        customer_id: customerId,
        machine_id: mid,
        purchase_date: purchaseDate || null,
      }));
      const { error } = await supabase.from("customer_machines").insert(links);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer_machines"] });
      qc.invalidateQueries({ queryKey: ["customer_machines_all"] });
      toast.success("Machines linked");
    },
    onError: (e) => toast.error(e.message),
  });
};

export const useUnlinkMachine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customer_machines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer_machines"] });
      qc.invalidateQueries({ queryKey: ["customer_machines_all"] });
      toast.success("Machine unlinked");
    },
    onError: (e) => toast.error(e.message),
  });
};
