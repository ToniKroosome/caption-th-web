export type Tier = "free" | "paid";

export async function fetchTier(): Promise<Tier> {
  try {
    const res = await fetch("/api/license");
    if (!res.ok) return "free";
    const data = await res.json();
    return data.tier === "paid" ? "paid" : "free";
  } catch {
    return "free";
  }
}
