import { NextResponse } from "next/server";
import { verifySupabaseConnection } from "@/lib/supabase/verify-connection";

export async function GET() {
  const result = await verifySupabaseConnection();
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
