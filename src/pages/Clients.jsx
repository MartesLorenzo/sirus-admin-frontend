import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus, Search, Trash2 } from "lucide-react";
import { useAdmin } from "../App";
import { useSystemDialog } from "../components/SystemDialog";
import { Badge, Empty, Field, FormActions, Modal, PageIntro, Panel } from "../components/UI";
import { id } from "../lib/storage";
import { api } from "../lib/api";

const stages = ["Todos", "Potencial", "Em aberto", "Por responder", "A acompanhar", "Finalizado"];
const blank = { name: "", contact: "", email: "", phone: "", company: "", status: "Potencial", origin: "", bookingCode: "", notes: "" };

export default function Clients() {
  const { clients, setClients, bookings, projects, can } = useAdmin();
  const [stage, setStage] = useState("Todos");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [newPassword, setNewPassword] = useState("");
  const dialog = useSystemDialog();
  const filtered = clients.filter((client) =>
    (stage === "Todos" || client.status === stage) &&
    [client.name, client.contact, client.email, client.phone, client.company, client.bookingCode]
      .some((value) => String(value || "").toLowerCase().includes(query.toLowerCase())));
  const booking = bookings.find((item) => item.code === form.bookingCode);
  function open(client) { setEditing(client || {}); setForm(client ? { ...client } : { ...blank }); setNewPassword(""); }
  async function resetPassword() {
    if (!await dialog.confirm("Gerar uma nova senha? A anterior deixará de funcionar.")) return;
    try { const result = await api(`/admin/clients/${editing.id}/password`, { method: "POST" }); setNewPassword(result.password); }
    catch (reason) { dialog.notice(reason.message); }
  }
  async function remove(client) {
    if (!await dialog.confirm(`Eliminar a ficha de ${client.name}? Os projetos ficam sem cliente associado.`)) return;
    setClients(clients.filter((entry) => entry.id !== client.id)); setEditing(null);
  }
  function save(event) {
    event.preventDefault();
    const item = { ...form, id: editing.id || id() };
    setClients(editing.id ? clients.map((client) => client.id === editing.id ? item : client) : [item, ...clients]);
    setEditing(null);
  }
  return <>
    <PageIntro eyebrow="CRM / RELAÇÕES" title="Clientes" description="Identificação, contactos, origem e histórico de reuniões. Os projetos são geridos na aba Projetos." action={can("clients", "create") && <button className="button primary" onClick={() => open()}><Plus size={16} /> Novo cliente</button>} />
    <div className="stage-grid">{stages.slice(1).map((value) => <button key={value} onClick={() => setStage(value)} className={`stage-card ${stage === value ? "active" : ""}`}><span>{value}</span><b>{String(clients.filter((c) => c.status === value).length).padStart(2, "0")}</b><small>Ver clientes <ArrowUpRight size={13} /></small></button>)}</div>
    <Panel title="Base de clientes" action={<Badge>{filtered.length} registos</Badge>}><div className="table-toolbar"><div className="searchbox"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, código, email ou empresa…" /></div><select value={stage} onChange={(event) => setStage(event.target.value)}>{stages.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>EMPRESA / ORIGEM</th><th>REUNIÃO</th><th>PROJETOS</th><th>ESTADO</th><th /></tr></thead><tbody>{filtered.map((client) => <tr key={client.id}><td><b>{client.name}</b><small>{client.email} · {client.phone}</small></td><td><b>{client.company || "Particular"}</b><small>{client.origin || "Origem por definir"}</small></td><td><code>{client.bookingCode || "—"}</code></td><td>{projects.filter((project) => project.clientId === client.id).length}</td><td><Badge tone={client.status === "Finalizado" ? "success" : client.status === "Por responder" ? "warning" : ""}>{client.status}</Badge></td><td>{can("clients", "edit") && <button className="table-action" onClick={() => open(client)}>Editar →</button>}{can("clients", "delete") && <button className="icon-button danger" aria-label={`Eliminar ${client.name}`} onClick={() => remove(client)}><Trash2 size={16}/></button>}</td></tr>)}</tbody></table>{!filtered.length && <Empty>Nenhum cliente corresponde aos filtros.</Empty>}</div>
    </Panel>
    {editing && <Modal title={editing.id ? "Ficha de cliente" : "Novo cliente"} onClose={() => setEditing(null)} wide><form onSubmit={save} className="form-stack"><div className="form-section-title">01 / IDENTIFICAÇÃO</div><div className="form-grid">
      <Field label="Nome completo"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Empresa (opcional)"><input value={form.company || ""} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
      <Field label="Pessoa de contacto"><input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
      <Field label="WhatsApp / telefone"><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <Field label="Onde nos conheceu?"><input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Instagram, indicação, pesquisa…" /></Field>
      <Field label="Código da reunião"><input value={form.bookingCode} onChange={(e) => setForm({ ...form, bookingCode: e.target.value })} /></Field>
      <Field label="Estado"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{stages.slice(1).map((item) => <option key={item}>{item}</option>)}</select></Field>
    </div>{booking && <div className="linked-booking">Reunião associada: <b>{booking.projectName}</b> · {booking.date} às {booking.time}</div>}
    <Field label="Notas sobre o cliente"><textarea rows="4" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
    {editing.id && <Link to="/projetos" className="table-action">Ver projetos relacionados →</Link>}
    {editing.id && can("clients", "edit") && <button type="button" className="button subtle" onClick={resetPassword}>Gerar nova senha do cliente</button>}
    {newPassword && <div className="tracking-admin-secret" role="status"><strong>Nova senha: {newPassword}</strong><p>Copia e entrega ao cliente depois de confirmares a identidade. Não voltará a ser exibida.</p></div>}
    <FormActions onCancel={() => setEditing(null)} submit={editing.id ? "Guardar cliente" : "Criar cliente"} />
    </form></Modal>}
  </>;
}
