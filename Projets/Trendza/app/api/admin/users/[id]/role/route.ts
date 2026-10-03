import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profiles";
import type { Role } from "@/types/database";

export const dynamic = "force-dynamic";

const VALID_ROLES: Role[] = ["user", "admin"];

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  let body: { role?: string };
  try {
    body = await _request.json();
  } catch {
    return NextResponse.json({ error: "Body invalide." }, { status: 400 });
  }

  const newRole = body.role;
  if (!newRole || !VALID_ROLES.includes(newRole as Role)) {
    return NextResponse.json(
      { error: `Rôle invalide. Valeurs acceptées : ${VALID_ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  const { error } = await supabase.rpc("admin_update_user_role", {
    target_user_id: id,
    new_role: newRole,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, role: newRole });
}
