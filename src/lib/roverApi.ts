import { supabase } from "./supabaseClient";

/**
 * Raw DB row for rover_instances
 * (Do NOT import UI types here)
 */
export interface RoverDbRow {
  id: string;
  user_id: string;
  name: string;
  ip_address: string;
  port: number;
  nav_config: Record<string, unknown> | null;
  sdr_config: Record<string, unknown> | null;
  created_at: string;
}

/* ───────────────── Queries ───────────────── */

export function fetchRovers(userId: string) {
  return supabase
    .from("rover_instances")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export function createRover(params: {
  userId: string;
  name: string;
  ip: string;
  port: number;
  nav_config: unknown;
  sdr_config: unknown;
}) {
  return supabase
    .from("rover_instances")
    .insert({
      user_id: params.userId,
      name: params.name,
      ip_address: params.ip,
      port: params.port,
      nav_config: params.nav_config,
      sdr_config: params.sdr_config,
    })
    .select()
    .single(); // 👈 THIS IS THE KEY
}

export function updateRoverConfig(params: {
  userId: string;
  roverId: string;
  nav_config: unknown;
  sdr_config: unknown;
}) {
  return supabase
    .from("rover_instances")
    .update({
      nav_config: params.nav_config,
      sdr_config: params.sdr_config,
    })
    .eq("id", params.roverId)
    .eq("user_id", params.userId);
}

export function deleteRover(params: { userId: string; roverId: string }) {
  return supabase
    .from("rover_instances")
    .delete()
    .eq("user_id", params.userId)
    .eq("id", params.roverId);
}
