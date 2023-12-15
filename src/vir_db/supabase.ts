import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
console.log(supabaseUrl);

const supabaseKey = process.env.SUPABASE_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;