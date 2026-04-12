"use client";

import { supabase } from "../lib/supabase";
import type {
  MateriaPrima,
  Fermentacion,
  ControlFermentacion,
  ControlPCC,
  PCC,
  ProductoStock,
  Incidencia,
  HojaProduccion,
  PlanLimpieza,
  RegistroLimpieza,
  HojaEnvasado,
} from "./types";

// --- Key conversion helpers ---

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = camelToSnake(key);
    const value = obj[key];
    if (Array.isArray(value)) {
      result[snakeKey] = value.map((item) =>
        item && typeof item === "object" && !Array.isArray(item)
          ? toSnakeCase(item as Record<string, unknown>)
          : item
      );
    } else if (value && typeof value === "object" && !(value instanceof Date)) {
      result[snakeKey] = toSnakeCase(value as Record<string, unknown>);
    } else {
      result[snakeKey] = value;
    }
  }
  return result;
}

export function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const camelKey = snakeToCamel(key);
    const value = obj[key];
    if (Array.isArray(value)) {
      result[camelKey] = value.map((item) =>
        item && typeof item === "object" && !Array.isArray(item)
          ? toCamelCase(item as Record<string, unknown>)
          : item
      );
    } else if (value && typeof value === "object" && !(value instanceof Date)) {
      result[camelKey] = toCamelCase(value as Record<string, unknown>);
    } else {
      result[camelKey] = value;
    }
  }
  return result;
}

// --- Generic CRUD functions ---

export async function loadFromSupabase<T>(
  table: string,
  options?: { filter?: { col: string; val: string }; orderBy?: string }
): Promise<T[]> {
  let query = supabase.from(table).select("*");

  if (options?.filter) {
    query = query.eq(options.filter.col, options.filter.val);
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error loading from ${table}:`, error);
    return [];
  }

  return (data ?? []).map((row) => toCamelCase(row as Record<string, unknown>) as T);
}

export async function saveToSupabase(
  table: string,
  data: Record<string, unknown>
): Promise<void> {
  const snakeData = toSnakeCase(data);
  const { error } = await supabase.from(table).upsert(snakeData);

  if (error) {
    console.error(`Error saving to ${table}:`, error);
    throw error;
  }
}

export async function deleteFromSupabase(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
}

export async function updateInSupabase(
  table: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const snakeData = toSnakeCase(data);
  const { error } = await supabase.from(table).update(snakeData).eq("id", id);

  if (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }
}

// --- ID generation (unchanged) ---

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

// --- Specialized loaders for nested data ---

export async function loadFermentaciones(): Promise<Fermentacion[]> {
  const { data: fermentaciones, error } = await supabase
    .from("fermentaciones")
    .select("*")
    .order("fecha_inicio", { ascending: false });

  if (error) {
    console.error("Error loading fermentaciones:", error);
    return [];
  }

  if (!fermentaciones || fermentaciones.length === 0) return [];

  const ids = fermentaciones.map((f) => f.id);

  const { data: controles, error: controlError } = await supabase
    .from("controles_fermentacion")
    .select("*")
    .in("fermentacion_id", ids)
    .order("dia", { ascending: true });

  if (controlError) {
    console.error("Error loading controles_fermentacion:", controlError);
  }

  const controlesByFermentacion = new Map<string, ControlFermentacion[]>();
  for (const control of controles ?? []) {
    const fId = control.fermentacion_id;
    const camelControl = toCamelCase(control as Record<string, unknown>) as unknown as ControlFermentacion;
    if (!controlesByFermentacion.has(fId)) {
      controlesByFermentacion.set(fId, []);
    }
    controlesByFermentacion.get(fId)!.push(camelControl);
  }

  return fermentaciones.map((f) => {
    const camelF = toCamelCase(f as Record<string, unknown>) as unknown as Fermentacion;
    camelF.controles = controlesByFermentacion.get(f.id) ?? [];
    return camelF;
  });
}

export async function loadPCCs(tipo: "complemento" | "alimento"): Promise<PCC[]> {
  const { data: pccs, error } = await supabase
    .from("pccs")
    .select("*")
    .eq("tipo", tipo)
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error loading pccs:", error);
    return [];
  }

  if (!pccs || pccs.length === 0) return [];

  const ids = pccs.map((p) => p.id);

  const { data: controles, error: controlError } = await supabase
    .from("controles_pcc")
    .select("*")
    .in("pcc_id", ids)
    .order("fecha", { ascending: false });

  if (controlError) {
    console.error("Error loading controles_pcc:", controlError);
  }

  const controlesByPCC = new Map<string, ControlPCC[]>();
  for (const control of controles ?? []) {
    const pccId = control.pcc_id;
    const camelControl = toCamelCase(control as Record<string, unknown>) as unknown as ControlPCC;
    if (!controlesByPCC.has(pccId)) {
      controlesByPCC.set(pccId, []);
    }
    controlesByPCC.get(pccId)!.push(camelControl);
  }

  return pccs.map((p) => {
    const camelP = toCamelCase(p as Record<string, unknown>) as unknown as PCC;
    camelP.controles = controlesByPCC.get(p.id) ?? [];
    return camelP;
  });
}

// --- Specialized save functions for nested controls ---

export async function saveFermentacionControl(
  fermentacionId: string,
  control: object
): Promise<void> {
  const snakeData = toSnakeCase({
    ...control,
    fermentacionId,
  } as Record<string, unknown>);

  const { error } = await supabase.from("controles_fermentacion").upsert(snakeData);

  if (error) {
    console.error("Error saving control de fermentacion:", error);
    throw error;
  }
}

export async function savePCCControl(control: object): Promise<void> {
  const snakeData = toSnakeCase(control as Record<string, unknown>);

  const { error } = await supabase.from("controles_pcc").upsert(snakeData);

  if (error) {
    console.error("Error saving control PCC:", error);
    throw error;
  }
}

// --- Limpieza: load plans with nested registros ---

export async function loadLimpieza(): Promise<PlanLimpieza[]> {
  const { data: planes, error } = await supabase
    .from("planes_limpieza")
    .select("*")
    .order("zona", { ascending: true });

  if (error) {
    console.error("Error loading planes_limpieza:", error);
    return [];
  }

  if (!planes || planes.length === 0) return [];

  const ids = planes.map((p) => p.id);

  const { data: registros, error: regError } = await supabase
    .from("registros_limpieza")
    .select("*")
    .in("plan_id", ids)
    .order("fecha", { ascending: false });

  if (regError) {
    console.error("Error loading registros_limpieza:", regError);
  }

  const registrosByPlan = new Map<string, RegistroLimpieza[]>();
  for (const reg of registros ?? []) {
    const planId = reg.plan_id;
    const camelReg = toCamelCase(reg as Record<string, unknown>) as unknown as RegistroLimpieza;
    if (!registrosByPlan.has(planId)) {
      registrosByPlan.set(planId, []);
    }
    registrosByPlan.get(planId)!.push(camelReg);
  }

  return planes.map((p) => {
    const camelP = toCamelCase(p as Record<string, unknown>) as unknown as PlanLimpieza;
    camelP.registros = registrosByPlan.get(p.id) ?? [];
    return camelP;
  });
}
