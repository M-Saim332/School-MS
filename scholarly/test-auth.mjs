import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabaseUrl = "http://127.0.0.1:54321";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: "principal@scholarly.test",
    password: "password123"
  });

  if (signInError) {
    console.error("Sign in failed:", signInError.message);
    return;
  }

  console.log("User signed in:", signInData.user.id);

  const { data: member, error: memberError } = await supabase
    .from("school_members")
    .select("school_id, role, schools(name)")
    .eq("user_id", signInData.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  console.log("Member:", member);
  console.log("Member Error:", memberError);
}

main();
