"use client";

export function loadData<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(`appcc_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`appcc_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving data:", e);
  }
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}
