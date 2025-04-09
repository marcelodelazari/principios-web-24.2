import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_KEY:", supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL ou SUPABASE_KEY não configurados no .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
