import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Request, Response } from "express";

type ProfileRow = Record<string, unknown> & {
  id: string;
  email: string;
  role: "model" | "admin";
  suspended_at: string | null;
};

export type AgencyContext = {
  client: SupabaseClient;
  user: User;
  profile: ProfileRow;
};

function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export async function getAgencyContext(
  req: Request,
  res: Response,
): Promise<AgencyContext | null> {
  const config = getSupabaseConfig();
  if (!config) {
    res.status(503).json({ error: "Supabase is not configured on the API server." });
    return null;
  }

  const authorization = req.get("authorization") ?? "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    res.status(401).json({ error: "Sign in to continue." });
    return null;
  }

  const client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser(token);
  if (authError || !user) {
    res.status(401).json({ error: "Your session has expired. Sign in again." });
    return null;
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("id,email,role,suspended_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    res.status(403).json({ error: "This account is not set up for TRENDIE MODELS." });
    return null;
  }
  const activeProfile = profile as ProfileRow;
  if (activeProfile.suspended_at) {
    res.status(403).json({ error: "This account is suspended. Contact agency support." });
    return null;
  }

  return { client, user, profile: activeProfile };
}

export function requireAdmin(ctx: AgencyContext, res: Response): boolean {
  if (ctx.profile.role !== "admin") {
    res.status(403).json({ error: "Administrator access is required." });
    return false;
  }
  return true;
}

export function unwrap<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) throw result.error;
  if (result.data === null) throw new Error("The requested record was not found.");
  return result.data;
}

export function firstRow<T>(value: T | T[] | null): T | null {
  if (value === null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function safe(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: (error?: unknown) => void): void => {
    void handler(req, res).catch(next);
  };
}
