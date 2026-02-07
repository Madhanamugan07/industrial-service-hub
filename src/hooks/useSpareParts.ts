import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SparePart = {
  id: string;
  spare_part_name: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export const useSpareParts = () =>
  useQuery({
    queryKey: ["spare_parts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("spare_parts").select("*").order("spare_part_name");
      if (error) throw error;
      return data as SparePart[];
    },
  });

export const useCreateSparePart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (part: { spare_part_name: string; quantity: number }) => {
      const { data, error } = await supabase.from("spare_parts").insert(part).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["spare_parts"] }); toast.success("Spare part added"); },
    onError: (e) => toast.error(e.message),
  });
};

export const useUpdateSparePart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...part }: Partial<SparePart> & { id: string }) => {
      const { data, error } = await supabase.from("spare_parts").update(part).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["spare_parts"] }); toast.success("Spare part updated"); },
    onError: (e) => toast.error(e.message),
  });
};

export const useDeleteSparePart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("spare_parts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["spare_parts"] }); toast.success("Spare part deleted"); },
    onError: (e) => toast.error(e.message),
  });
};
