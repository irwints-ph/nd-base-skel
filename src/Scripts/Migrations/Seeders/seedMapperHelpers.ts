// ===================================================================
// 🧩 src/scripts/migrations/seeders/seedMapperHelpers.ts
// ===================================================================

export function toNumber(value: any, fallback = 0): number {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
}

export function toNullableNumber(value: any): number | null {
  if (!value || value.trim() === "") return null;
  return Number(value);
}

export function toBool(value: any): boolean {
  if (!value) return false;

  const v = value.toString().toUpperCase();
  return v === "TRUE" || v === "1" || v === "YES" || v === "Y";
}

export function toString(value: any, fallback = ""): string {
  return value?.toString()?.trim() || fallback;
}