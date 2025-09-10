import { createClient } from "../lib/supabase/server";

export default async function Homepage() {
  const supabase = await createClient();
}
