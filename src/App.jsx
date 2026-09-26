import { createContext, useContext, useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import { api, configured, token } from "./lib/api";
import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import Clients from "./pages/Clients";
import ClientTracking from "./pages/ClientTracking";
import Projects from "./pages/Projects";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

const initial = { bookings: [], availability: [], clients: [], projects: [], portfolio: [], news: [], transactions: [], settings: {} };
const resources = { clients: "clients", projects: "projects", portfolio: "portfolio", news: "news", transactions: "transactions" };
function payload(key, item) {
  const { id, createdAt, updatedAt, trackingCode, accessPasswordHash, meetingId, passwordHash, objectives, client, code, progress, legacyProgress, ...fields } = item;
  if (key === "clients") return {
    name: fields.name, contact: fields.contact || "", phone: fields.phone || "", email: fields.email || "",
    status: fields.status, origin: fields.origin || "", company: fields.company || "", bookingCode: fields.bookingCode || "", notes: fields.notes || "",
  };
  if (key === "projects") return {
    title: fields.title, description: fields.description || "", status: fields.status || "Em planeamento",
    startDate: fields.startDate || "", deadline: fields.deadline || "",
    budget: Number(fields.budget) || 0, amountPaid: Number(fields.amountPaid) || 0,
    clientId: fields.clientId || null, links: fields.links || [],
  };
  if (key === "portfolio") return {
    category: fields.category, title: fields.title, slug: fields.slug, description: fields.description || "",
    visionTitle: fields.visionTitle || "", visionDescription: fields.visionDescription || "", checklist: fields.checklist || [],
    status: fields.status, statusNote: fields.statusNote || "", images: fields.images || [], link: fields.link || "",
    androidUrl: fields.androidUrl || "", iosUrl: fields.iosUrl || "", featured: Boolean(fields.featured), published: Boolean(fields.published),
  };
  if (key === "news") return {
    title: fields.title, slug: fields.slug, subtitle: fields.subtitle || "", category: fields.category || "Novidades",
    summary: fields.summary || "", sections: fields.sections || [], checklist: fields.checklist || [], images: fields.images || [],
    status: fields.status || "Rascunho", featured: Boolean(fields.featured), date: fields.date,
  };
  return { type: fields.type, title: fields.title, amount: Number(fields.amount), date: fields.date, clientId: fields.clientId || null };
}
function AdminProvider({ children }) {
  const [state, setState] = useState(initial);
  const [session, setSession] = useState(Boolean(token()));
  const [loading, setLoading] = useState(Boolean(token()));
  const [error, setError] = useState("");
  const stateRef = useRef(state);
  const queue = useRef(Promise.resolve());
  stateRef.current = state;
  async function refresh() {
    const result = await api("/admin/state");
    setState(result);
    stateRef.current = result;
  }
  useEffect(() => {
    if (!session) { setLoading(false); return; }
    refresh().catch((reason) => { setError(reason.message); sessionStorage.removeItem("sirus-admin-token"); setSession(false); }).finally(() => setLoading(false));
  }, [session]);
  async function login(email, password) {
    const result = await api("/auth/login", { method: "POST", body: { email, password } });
    sessionStorage.setItem("sirus-admin-token", result.token);
    setError(""); setLoading(true); setSession(true);
  }
  function change(key, update) {
    const previous = stateRef.current[key];
    const next = typeof update === "function" ? update(previous) : update;
    setState((old) => ({ ...old, [key]: next }));
    stateRef.current = { ...stateRef.current, [key]: next };
    queue.current = queue.current.then(async () => {
      if (key === "availability") {
        await api("/admin/availability", { method: "PUT", body: next.map(({ date, times, enabled }) => ({ date, times, enabled })) });
      } else if (key === "settings") {
        await api("/admin/settings", { method: "PUT", body: { callPrimary: next.callPrimary, callSecondary: next.callSecondary || "", whatsapp: next.whatsapp, generalEmail: next.generalEmail, projectEmail: next.projectEmail || "projetos@sirus.cloud", supportEmail: next.supportEmail || "suporte@sirus.cloud", location: next.location } });
      } else if (key === "bookings") {
        for (const item of next) {
          const old = previous.find((entry) => entry.id === item.id);
          if (old && old.status !== item.status) await api(`/admin/meetings/${item.id}`, { method: "PATCH", body: { status: item.status } });
        }
      } else {
        const collection = resources[key];
        for (const item of next) {
          const old = previous.find((entry) => entry.id === item.id);
          if (!old) await api(`/admin/${collection}`, { method: "POST", body: payload(key, item) });
          else if (JSON.stringify(payload(key, old)) !== JSON.stringify(payload(key, item))) await api(`/admin/${collection}/${item.id}`, { method: "PUT", body: payload(key, item) });
        }
        for (const item of previous) if (!next.some((entry) => entry.id === item.id)) await api(`/admin/${collection}/${item.id}`, { method: "DELETE" });
      }
      await refresh(); setError("");
    }).catch(async (reason) => { setError(reason.message); await refresh().catch(() => {}); });
  }
  const value = { ...state, logout: () => { sessionStorage.removeItem("sirus-admin-token"); setSession(false); setState(initial); }, ...Object.fromEntries(Object.keys(initial).map((key) => [`set${key[0].toUpperCase()}${key.slice(1)}`, (value) => change(key, value)])), refresh, error };
  if (loading) return <div className="admin-auth"><p>A carregar o painel…</p></div>;
  if (!session) return <Login onLogin={login} error={error} />;
  return <AdminContext.Provider value={value}>{error && <div className="admin-sync-error" role="alert">{error}</div>}{children}</AdminContext.Provider>;
}
function Login({ onLogin, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  return <main className="admin-auth"><form onSubmit={async (event) => { event.preventDefault(); try { await onLogin(email, password); } catch (reason) { setMessage(reason.message); } }}>
    <img src="/sirus-emblem.png" alt="" width="54" /><span>SIRUS CLOUD · ADMIN</span><h1>Entrar no painel</h1>
    <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" /></label>
    <label>Senha<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
    <button type="submit" disabled={!configured}>Entrar</button><p role="alert">{!configured ? "Define VITE_API_BASE_URL para ligar a API." : message || error}</p>
  </form></main>;
}

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="reunioes" element={<Meetings />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="clientes/:id/acompanhamento" element={<ClientTracking />} />
            <Route path="projetos" element={<Projects />} />
            <Route path="projetos/:id/acompanhamento" element={<ClientTracking />} />
            <Route path="portfolio/:category" element={<Portfolio />} />
            <Route path="noticias" element={<News />} />
            <Route path="gestao" element={<Finance />} />
            <Route path="configuracoes" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
