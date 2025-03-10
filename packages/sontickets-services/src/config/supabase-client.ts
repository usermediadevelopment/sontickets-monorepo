import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL and anon key must be provided");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
