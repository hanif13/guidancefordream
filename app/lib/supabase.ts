import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://tsedkchdkghlkywlzqle.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_E0xfHzxp3xXdDurwXQW1UA_NRQBv4uh";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload image file directly to Supabase storage bucket `gfd-media`
 * @param file File object from input
 * @param folder 'speakers' | 'posters' | 'partners' | 'gallery'
 * @returns Public URL of uploaded image or null on error
 */
export async function uploadMedia(
  file: File,
  folder: "speakers" | "posters" | "partners" | "gallery"
): Promise<{ url: string | null; error?: string }> {
  try {
    const rawExt = file.name.split(".").pop() || "png";
    const fileExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("gfd-media")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from("gfd-media").getPublicUrl(fileName);
    return { url: data.publicUrl };
  } catch (err: any) {
    console.error("Failed to upload media:", err);
    return { url: null, error: err?.message || "เกิดข้อผิดพลาดในการอัปโหลด" };
  }
}
