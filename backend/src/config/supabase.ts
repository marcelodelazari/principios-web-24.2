import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_KEY:", supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL ou SUPABASE_KEY não configurados no .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Teste para listar os buckets
(async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error("Erro ao listar buckets do Supabase:", error.message);
    } else {
      console.log("Buckets disponíveis no Supabase:", buckets);
    }
  } catch (err) {
    console.error("Erro ao testar conexão com o Supabase:", err);
  }
})();
