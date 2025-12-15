import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createTable() {
  // Create the rsvps table using raw SQL
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS rsvps (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        primary_dietary TEXT,
        guests JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

      -- Allow authenticated users to read all rsvps
      CREATE POLICY IF NOT EXISTS "Authenticated users can read rsvps"
        ON rsvps FOR SELECT
        TO authenticated
        USING (true);

      -- Allow anyone to insert rsvps
      CREATE POLICY IF NOT EXISTS "Anyone can insert rsvps"
        ON rsvps FOR INSERT
        TO anon, authenticated
        WITH CHECK (true);
    `
  });

  if (error) {
    console.error("Error creating table via RPC:", error.message);
    console.log("\nPlease create the table manually in Supabase SQL Editor with this SQL:\n");
    console.log(`
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  primary_dietary TEXT,
  guests JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all rsvps
CREATE POLICY "Authenticated users can read rsvps"
  ON rsvps FOR SELECT
  TO authenticated
  USING (true);

-- Allow anyone to insert rsvps
CREATE POLICY "Anyone can insert rsvps"
  ON rsvps FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
    `);
  } else {
    console.log("Table created successfully!");
  }
}

createTable();
