import { createContext, useContext, useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import Shell from "./components/Shell";
import { api, configured, token } from "./lib/api";
import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import Clients from "./pages/Clients";
import ClientTracking from "./pages/ClientTracking";
import Projects from "./pages/Projects";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News";
import SocialProof from "./pages/SocialProof";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import { areaFromPath, permitted, firstAllowed } from "./lib/access";

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

const initial = { bookings: [], availability: [], clients: [], projects: [], portfolio: [], news: [], companies: [], testimonials: [], transactions: [], settings: {} };
const resources = { clients: "clients", projects: "projects", portfolio: "portfolio", news: "news", companies: "companies", testimonials: "testimonials", transactions: "transactions" };

// Antes da introdução de funcionários, todas as contas existentes eram admins.
// Mantém essas sessões antigas funcionais enquanto o backend é atualizado.
function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    role: user.role || "ADMIN",
    active: user.active !== false,
    permissions: user.permissions || {},
  };
}
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
  if (key === "companies") return {
    name: fields.name, logo: fields.logo, website: fields.website || "",
    featured: Boolean(fields.featured), published: Boolean(fields.published),
  };
  if (key === "testimonials") return {
    name: fields.name, role: fields.role || "", quote: fields.quote,
    images: fields.images || [], featured: Boolean(fields.featured), published: Boolean(fields.published),
  };
  return { type: fields.type, title: fields.title, amount: Number(fields.amount), date: fields.date, clientId: fields.clientId || null };
}
function AdminProvider({ children }) {
  const [state, setState] = useState(initial);
  const [session, setSession] = useState(Boolean(token()));
  const [user, setUser] = useState(null);
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
    Promise.all([refresh(), api("/auth/me").then((account) => setUser(normalizeUser(account)))])
      .catch((reason) => { setError(reason.message); sessionStorage.removeItem("sirus-admin-token"); setSession(false); })
      .finally(() => setLoading(false));
  }, [session]);
  async function login(email, password) {
    const result = await api("/auth/login", { method: "POST", body: { email, password } });
    sessionStorage.setItem("sirus-admin-token", result.token);
    setUser(normalizeUser(result.user)); setError(""); setLoading(true); setSession(true);
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
  const value = { ...state, user, can: (area, action) => permitted(user, area, action), logout: () => { sessionStorage.removeItem("sirus-admin-token"); setSession(false); setUser(null); setState(initial); }, ...Object.fromEntries(Object.keys(initial).map((key) => [`set${key[0].toUpperCase()}${key.slice(1)}`, (value) => change(key, value)])), refresh, error };
  if (loading) return <div className="admin-auth"><p>A carregar o painel…</p></div>;
  if (!session) return <Login onLogin={login} error={error} />;
  return <AdminContext.Provider value={value}>{error && <div className="admin-sync-error" role="alert">{error}</div>}{children}</AdminContext.Provider>;
}
function Access({ area, children }) {
  const { user } = useAdmin();
  return permitted(user, area) ? children : <Navigate to={firstAllowed(user)} replace />;
}
function PortfolioAccess() {
  const { category } = useParams();
  const area = ({ websites: "portfolio_web", mobile: "portfolio_mobile", pc: "portfolio_pc" })[category];
  const { user } = useAdmin();
  if (!area) return <Navigate to={firstAllowed(user)} replace />;
  return permitted(user, area) ? <Portfolio /> : <Navigate to={firstAllowed(user)} replace />;
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
            <Route index element={<Access area="dashboard"><Dashboard /></Access>} />
            <Route path="reunioes" element={<Access area="meetings"><Meetings /></Access>} />
            <Route path="clientes" element={<Access area="clients"><Clients /></Access>} />
            <Route path="clientes/:id/acompanhamento" element={<Access area="projects"><ClientTracking /></Access>} />
            <Route path="projetos" element={<Access area="projects"><Projects /></Access>} />
            <Route path="projetos/:id/acompanhamento" element={<Access area="projects"><ClientTracking /></Access>} />
            <Route path="portfolio/:category" element={<PortfolioAccess />} />
            <Route path="equipa" element={<Access area="team"><Team /></Access>} />
            <Route path="sem-acesso" element={<div className="panel"><h2>Sem acesso a secções</h2><p>Fala com um administrador para receber permissões.</p></div>} />
            <Route path="noticias" element={<Access area="news"><News /></Access>} />
            <Route path="testemunhos" element={<Access area="testimonials"><SocialProof /></Access>} />
            <Route path="gestao" element={<Access area="finance"><Finance /></Access>} />
            <Route path="configuracoes" element={<Access area="settings"><Settings /></Access>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
