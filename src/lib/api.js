// Mesmo URL do website cliente; o token nunca acompanha pedidos públicos.
const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
export const configured = Boolean(base);
export const token = () => sessionStorage.getItem("sirus-admin-token");
export async function api(path, { method = "GET", body } = {}) {
  if (!configured) throw new Error("Configura VITE_API_BASE_URL para ligar o painel à API.");
  const response = await fetch(`${base}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (response.status === 204) return null;
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || `Erro ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return result;
}
