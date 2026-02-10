import { supabase } from "@/integrations/supabase/client";

const BUCKET_TICKET = "ticket-images";
const BUCKET_SP_PHOTOS = "service-person-photos";

export const uploadImage = async (file: File, folder: string): Promise<string | null> => {
  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET_TICKET).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET_TICKET).getPublicUrl(fileName);
  return data.publicUrl;
};

export const uploadServicePersonPhoto = async (file: File): Promise<string | null> => {
  const ext = file.name.split(".").pop();
  const fileName = `photos/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET_SP_PHOTOS).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET_SP_PHOTOS).getPublicUrl(fileName);
  return data.publicUrl;
};
