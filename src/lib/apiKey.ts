const STORAGE_KEY = "decisionlab-anthropic-api-key";

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function setStoredApiKey(key: string) {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (!trimmed) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, trimmed);
}

export function maskApiKey(key: string) {
  const t = key.trim();
  if (t.length < 12) return t ? "••••••••" : "";
  return `${t.slice(0, 7)}…${t.slice(-4)}`;
}

export function looksLikeAnthropicKey(key: string) {
  const t = key.trim();
  // Console API keys are typically sk-ant-api03-… (usr tokens often fail auth)
  return /^sk-ant-(api\d+-)?[A-Za-z0-9_-]{20,}$/.test(t);
}

export function looksLikeConsoleApiKey(key: string) {
  return key.trim().startsWith("sk-ant-api");
}
