import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ServicePerson = {
  id: string;
  service_person_id: string;
  name: string;
  contact_details: string | null;
  photo_url: string | null;
  created_at: string;
};

export const useServicePersons = () =>
  useQuery({
    queryKey: ["service_persons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_persons").select("*").order("service_person_id");
      if (error) throw error;
      return data as ServicePerson[];
    },
  });

export const useCreateServicePerson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (person: { service_person_id: string; name: string; contact_details?: string }) => {
      const { data, error } = await supabase.from("service_persons").insert(person).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["service_persons"] }); toast.success("Service person added"); },
    onError: (e) => toast.error(e.message),
  });
};

export const useUpdateServicePerson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...person }: Partial<ServicePerson> & { id: string }) => {
      const { data, error } = await supabase.from("service_persons").update(person).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["service_persons"] }); toast.success("Service person updated"); },
    onError: (e) => toast.error(e.message),
  });
};

export const useDeleteServicePerson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_persons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["service_persons"] }); toast.success("Service person deleted"); },
    onError: (e) => toast.error(e.message),
  });
};
