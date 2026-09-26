import { useEffect, useState } from "react";
import { KeyRound, Plus, ShieldCheck, Trash2, UserRound, History } from "lucide-react";
import { api } from "../lib/api";
import { useAdmin } from "../App";
import { Field, Modal, PageIntro, Panel } from "../components/UI";

const areas = [
  ["dashboard", "Visão geral"], ["meetings", "Reuniões e agenda"],
  ["clients", "Clientes"], ["projects", "Projetos e tracking"],
  ["portfolio_web", "Portfólio Web"], ["portfolio_mobile", "Portfólio Mobile"],
  ["portfolio_pc", "Portfólio PC"], ["news", "Notícias"],
  ["testimonials", "Testemunhos e empresas"], ["finance", "Gestão financeira"],
  ["settings", "Contactos e canais"],
];
const actions = [["view", "Ver"], ["create", "Criar"], ["edit", "Editar"], ["delete", "Eliminar"]];
const blankPermissions = () => Object.fromEntries(areas.map(([key]) => [key, { view: false, create: false, edit: false, delete: false }]));
const blank = () => ({ name: "", email: "", role: "EMPLOYEE", jobTitle: "", active: true, permissions: blankPermissions() });
export default function Team() {
  const { user } = useAdmin();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank());
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  async function reload() {
    const [team, activity] = await Promise.all([api("/admin/users"), api(`/admin/users/activity/log${selectedUser ? `?actorId=${encodeURIComponent(selectedUser)}` : ""}`)]);
    setUsers(team); setLogs(activity);
  }
  useEffect(() => { reload().catch((cause) => setError(cause.message)); }, [selectedUser]);
  function open(person) {
    setEditing(person || {});
    setForm(person ? { name: person.name || "", email: person.email, role: person.role, jobTitle: person.jobTitle || "", active: person.active, permissions: { ...blankPermissions(), ...person.permissions } } : blank());
    setSecret(""); setError("");
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await api(editing.id ? `/admin/users/${editing.id}` : "/admin/users", { method: editing.id ? "PUT" : "POST", body: form });
      if (result.password) setSecret(result.password);
      else setEditing(null);
      await reload();
    } catch (cause) { setError(cause.message); } finally { setBusy(false); }
  }
  async function remove(person) {
    if (!window.confirm(`Eliminar o acesso de ${person.name || person.email}?`)) return;
    try { await api(`/admin/users/${person.id}`, { method: "DELETE" }); await reload(); } catch (cause) { setError(cause.message); }
  }
  async function reset(person) {
    if (!window.confirm(`Substituir a senha de ${person.email}?`)) return;
    try { const result = await api(`/admin/users/${person.id}/reset-password`, { method: "POST" }); setEditing({ id: person.id }); setSecret(result.password); await reload(); } catch (cause) { setError(cause.message); }
  }
  async function ownPassword(event) {
    event.preventDefault(); setError("");
    try { await api("/auth/password", { method: "POST", body: password }); setPassword({ currentPassword: "", newPassword: "" }); setMessage("Senha atualizada."); await reload(); }
    catch (cause) { setError(cause.message); }
  }
  return <>
    <PageIntro eyebrow="ADMINISTRAÇÃO / ACESSO" title="Equipa & segurança" description="Define quem entra no painel, o que pode fazer e consulta o histórico de ações." action={<button className="button primary" onClick={() => open()}><Plus size={16} /> Novo utilizador</button>} />
    {error && <p className="tracking-admin-error" role="alert">{error}</p>}
    <div className="two-column team-top"><Panel title="Contas do painel"><div className="team-list">{users.map((person) => <article key={person.id} className="team-person"><span className="team-person-avatar">{person.role === "ADMIN" ? <ShieldCheck /> : <UserRound />}</span><div><b>{person.name || person.email}</b><small>{person.email} · {person.role === "ADMIN" ? "Administrador" : person.jobTitle || "Funcionário"} · {person.active ? "Ativo" : "Suspenso"}</small></div><div className="team-buttons"><button className="table-action" onClick={() => open(person)}>Editar</button><button className="table-action" onClick={() => reset(person)} aria-label={`Redefinir senha de ${person.email}`}><KeyRound size={16} /></button><button className="icon-button danger" onClick={() => remove(person)} aria-label={`Eliminar ${person.email}`} disabled={person.id === user?.id}><Trash2 size={16} /></button></div></article>)}</div></Panel>
      <Panel title="A minha senha"><form className="form-stack" onSubmit={ownPassword}><Field label="Senha atual"><input type="password" autoComplete="current-password" required value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} /></Field><Field label="Nova senha (mínimo 12 caracteres)"><input type="password" autoComplete="new-password" minLength={12} required value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} /></Field><button className="button primary">Mudar a minha senha</button>{message && <p role="status">{message}</p>}</form></Panel></div>
    <Panel title="Histórico de ações" action={<select aria-label="Filtrar utilizador" value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)}><option value="">Todos os utilizadores</option>{users.map((person) => <option value={person.id} key={person.id}>{person.name || person.email}</option>)}</select>}><div className="team-history">{logs.length ? logs.map((entry) => <article key={entry.id}><History size={17} /><span><b>{entry.actorEmail}</b> · {({ CREATE: "Criou", EDIT: "Editou", DELETE: "Eliminou", LOGIN: "Entrou no painel", PASSWORD_CHANGE: "Alterou a senha", PASSWORD_RESET: "Redefiniu uma senha" })[entry.action] || entry.action} · {entry.resource}{entry.resourceId ? ` / ${entry.resourceId}` : ""}</span><time>{new Date(entry.createdAt).toLocaleString("pt-AO")}</time></article>) : <p>Ainda não há ações registadas.</p>}</div></Panel>
    {editing && <Modal title={editing.id ? "Editar acesso" : "Novo acesso"} wide onClose={() => { setEditing(null); setSecret(""); }}><form className="form-stack" onSubmit={save}>
      {secret ? <div className="team-secret" role="status"><b>Senha temporária: {secret}</b><p>Guarda e envia ao utilizador por um canal seguro. A senha não volta a ser mostrada.</p><button type="button" className="button subtle" onClick={() => { setEditing(null); setSecret(""); }}>Concluir</button></div> : <><div className="form-grid"><Field label="Nome"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Email"><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field><Field label="Função"><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="EMPLOYEE">Funcionário</option><option value="ADMIN">Administrador</option></select></Field><Field label="Cargo"><input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="Ex.: Gestor de projetos" /></Field></div><label className="team-active"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Conta ativa</label>
      {form.role === "EMPLOYEE" && <><h3>Permissões por aba</h3><p>Marca Ver para mostrar a aba. Depois escolhe as operações permitidas.</p><div className="team-rights"><div className="team-rights-heading"><b>ÁREA</b>{actions.map(([key, label]) => <b key={key}>{label}</b>)}</div>{areas.map(([area, label]) => <div className="team-rights-row" key={area}><b>{label}</b>{actions.map(([operation, label]) => <label key={operation} title={`${label}: ${operation}`}><input type="checkbox" checked={Boolean(form.permissions[area]?.[operation])} onChange={(e) => setForm((prev) => ({ ...prev, permissions: { ...prev.permissions, [area]: { ...prev.permissions[area], [operation]: e.target.checked, ...(e.target.checked && operation !== "view" ? { view: true } : {}) } } }))} aria-label={`${label} em ${area}`} /></label>)}</div>)}</div></>}
      <button type="submit" className="button primary" disabled={busy}>{busy ? "A guardar…" : editing.id ? "Guardar alterações" : "Criar utilizador"}</button></>}
    </form></Modal>}
  </>;
}
