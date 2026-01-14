import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// DELETE /api/rsvps/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server misconfigured: missing service role key" }, { status: 500 });
    }

    // Verify user is authenticated
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Failed to create Supabase client" }, { status: 500 });
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized - no session" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("rsvps")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: `Supabase error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting RSVP:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Delete failed: ${message}` }, { status: 500 });
  }
}

// PUT /api/rsvps/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, guests } = body;

    // Use admin client to bypass RLS
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("rsvps")
      .update({ name, email, guests })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating RSVP:", error);
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
  }
}
