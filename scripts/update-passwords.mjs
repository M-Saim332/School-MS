import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePasswords() {
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error("Error listing users:", usersError);
    return;
  }

  for (const u of users) {
    if (u.email.endsWith('@scholarly.test')) {
      console.log(`Updating password for ${u.email} (${u.id})...`);
      const { error } = await supabase.auth.admin.updateUserById(u.id, {
        password: "password123",
        email_confirm: true
      });
      if (error) {
        console.error(`Error updating ${u.email}:`, error.message);
      } else {
        console.log(`Successfully updated ${u.email}`);
      }
    }
  }
}

updatePasswords();
