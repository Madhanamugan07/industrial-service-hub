import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Machine = {
  id: string;
  machine_id: string;
  machine_name: string;
  model_number: string;
  created_at: string;
};

export const useMachines = () =>
  useQuery({
    queryKey: ["machines"],
    queryFn: async () => {
      const { data, error } = await supabase.from("machines").select("*").order("machine_id");
      if (error) throw error;
      return data as Machine[];
    },
  });

export const useCreateMachine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (machine: { machine_id: string; machine_name: string; model_number: string }) => {
      const { data, error } = await supabase.from("machines").insert(machine).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["machines"] }); toast.success("Machine added"); },
    onError: (e) => toast.error(e.message),
  });
};

export const useUpdateMachine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...machine }: Partial<Machine> & { id: string }) => {
      const { data, error } = await supabase.from("machines").update(machine).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["machines"] }); toast.success("Machine updated"); },
    onError: (e) => toast.error(e.message),
  });
};

export const useDeleteMachine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("machines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["machines"] }); toast.success("Machine deleted"); },
    onError: (e) => toast.error(e.message),
  });
};
