const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

// Load env from .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
const env = {};
envFile.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from("student_fee_accounts")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Error querying student_fee_accounts:", error.message);
  } else {
    console.log("student_fee_accounts query succeeded! Data length:", data.length);
  }

  const { data: members, error: membersError } = await supabase
    .from("school_members")
    .select("role")
    .limit(5);

  if (membersError) {
    console.error("Error querying school_members:", membersError.message);
  } else {
    console.log("school_members roles:", members.map(m => m.role));
  }
}

main();
