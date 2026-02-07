import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
