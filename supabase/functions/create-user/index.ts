import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    const {
      email,
      password,
      full_name,
      role,
      customer_details,
      service_person_details,
      bootstrap,
    } = body;

    if (!email || !password || !full_name || !role) {
      throw new Error("Missing required fields: email, password, full_name, role");
    }
    if (!["admin", "service_person", "customer"].includes(role)) {
      throw new Error("Invalid role");
    }

    // Bootstrap: allow first admin creation without auth
    if (bootstrap) {
      const { data: exists } = await adminClient.rpc("admin_exists");
      if (exists) throw new Error("Admin already exists. Bootstrap not allowed.");
      if (role !== "admin") throw new Error("Bootstrap can only create admin accounts");
    } else {
      // Verify caller is admin
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Not authenticated");

      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user: caller },
      } = await adminClient.auth.getUser(token);
      if (!caller) throw new Error("Invalid token");

      const { data: isAdmin } = await adminClient.rpc("has_role", {
        _user_id: caller.id,
        _role: "admin",
      });
      if (!isAdmin) throw new Error("Only admins can create users");
    }

    // Create auth user (auto-confirm since admin creates accounts)
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    if (authError) throw authError;

    const userId = authData.user.id;

    // Insert profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({ user_id: userId, email, full_name });
    if (profileError) throw profileError;

    // Insert role
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (roleError) throw roleError;

    // Create linked record based on role
    if (role === "customer") {
      const machineName = customer_details?.machine_name || "N/A";
      const { data: customerData, error } = await adminClient.from("customers").insert({
        user_id: userId,
        name: full_name,
        machine_name: machineName,
        purchase_date: customer_details?.purchase_date || null,
      }).select().single();
      if (error) throw error;

      // Link selected machines to customer
      if (customer_details?.machine_ids?.length > 0 && customerData) {
        const links = customer_details.machine_ids.map((mid: string) => ({
          customer_id: customerData.id,
          machine_id: mid,
          purchase_date: customer_details?.purchase_date || null,
        }));
        const { error: linkError } = await adminClient.from("customer_machines").insert(links);
        if (linkError) throw linkError;
      }
    } else if (role === "service_person") {
      const spId = service_person_details?.service_person_id;
      if (!spId) throw new Error("service_person_id is required for service persons");
      const { error } = await adminClient.from("service_persons").insert({
        user_id: userId,
        name: full_name,
        service_person_id: spId,
        contact_details: service_person_details?.contact_details || null,
      });
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ user_id: userId, message: "User created successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("create-user error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
