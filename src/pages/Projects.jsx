import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Circle, FolderKanban, Plus, Search, Trash2 } from "lucide-react";
import { useAdmin } from "../App";
import { api } from "../lib/api";
import { Badge, Field, FormActions, Modal, PageIntro, Panel } from "../components/UI";
import { id, money, formatDate } from "../lib/storage";

const empty = { title: "", description: "", clientId: "", status: "Em planeamento", startDate: "", deadline: "", budget: "", amountPaid: "", links: [] };

export default function Projects() {
  const { clients, projects, setProjects, refresh } = useAdmin();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [objective, setObjective] = useState("");
  const [pendingObjectives, setPendingObjectives] = useState([]);
  const [link, setLink] = useState({ label: "", url: "" });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const shown = projects.filter((item) => [item.title, item.code, item.client?.name].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase())));
  function open(item) {
    setEditing(item || {});
    setForm(item ? { ...item, clientId: item.clientId || "", links: item.links || [] } : { ...empty, links: [] });
    setObjective(""); setPendingObjectives([]); setLink({ label: "", url: "" }); setError("");
  }
  async function save(event) {
    event.preventDefault(); setError("");
    if (Number(form.amountPaid) > Number(form.budget)) return setError("O valor pago supera o orçamento.");
    if (form.startDate && form.deadline && form.deadline < form.startDate) return setError("O prazo deve ser posterior ao início.");
    const item = { ...form, id: editing.id || id() };
    try {
      // Criamos primeiro o projeto para obter o ID real do servidor antes de inserir objetivos.
      if (!editing.id) {
        const created = await api("/admin/projects", { method: "POST", body: {
          title: form.title, description: form.description, clientId: form.clientId || null,
          status: form.status, startDate: form.startDate, deadline: form.deadline,
          budget: Number(form.budget) || 0, amountPaid: Number(form.amountPaid) || 0, links: form.links,
        } });
        for (const title of pendingObjectives) await api(`/admin/projects/${created.id}/objectives`, { method: "POST", body: { title } });
        await refresh();
      } else setProjects(projects.map((project) => project.id === editing.id ? item : project));
      setEditing(null);
    } catch (reason) { setError(reason.message); }
  }
  async function objectiveAction(action, item) {
    try {
      if (action === "add") await api(`/admin/projects/${editing.id}/objectives`, { method: "POST", body: { title: objective.trim() } });
      if (action === "toggle") await api(`/admin/projects/${editing.id}/objectives/${item.id}`, { method: "PATCH", body: { completed: !item.completed } });
      if (action === "delete") await api(`/admin/projects/${editing.id}/objectives/${item.id}`, { method: "DELETE" });
      await refresh();
      if (action === "add") setObjective("");
      setEditing((current) => ({ ...current }));
    } catch (reason) { setError(reason.message); }
  }
  const current = editing?.id ? projects.find((item) => item.id === editing.id) : null;
  return <>
    <PageIntro eyebrow="ENTREGAS / ACOMPANHAMENTO" title="Projetos" description="Prazos, pagamentos, objetivos e demonstrações num único lugar. Os objetivos concluídos atualizam o tracking do cliente." action={<button className="button primary" onClick={() => open()}><Plus size={16} /> Novo projeto</button>} />
    <Panel title="Projetos registados" action={<Badge>{projects.length} projetos</Badge>}>
      <div className="searchbox"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Título, código ou cliente…" /></div>
      <div className="table-wrap"><table><thead><tr><th>PROJETO / CÓDIGO</th><th>CLIENTE</th><th>PRAZO</th><th>PROGRESSO</th><th>ORÇAMENTO</th><th /></tr></thead><tbody>
        {shown.map((project) => <tr key={project.id}><td><b>{project.title}</b><small>{project.code}</small></td><td>{project.client?.name || "Projeto interno"}</td><td>{project.deadline ? formatDate(project.deadline) : "A definir"}</td><td><span className="mini-progress"><span style={{ width: `${project.progress}%` }} /></span><small>{project.progress}% · {project.objectives?.filter((o) => o.completed).length || 0}/{project.objectives?.length || 0} objetivos</small></td><td>{money(project.amountPaid)} / {money(project.budget)}</td><td><button className="table-action" onClick={() => open(project)}>Editar →</button><Link className="table-action" to={`/projetos/${project.id}/acompanhamento`}>Tracking →</Link></td></tr>)}
      </tbody></table>{!shown.length && <p>Nenhum projeto corresponde à pesquisa.</p>}</div>
    </Panel>
    {editing && <Modal title={editing.id ? "Gerir projeto" : "Novo projeto"} onClose={() => setEditing(null)} wide>
      <form className="form-stack" onSubmit={save}>
        <div className="form-section-title">01 / IDENTIDADE E CLIENTE</div>
        <div className="form-grid"><Field label="Nome do projeto"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field><Field label="Vincular cliente (opcional)"><select value={form.clientId || ""} onChange={(e) => setForm({ ...form, clientId: e.target.value })}><option value="">Projeto interno da Sirus Cloud</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name} · {client.email}</option>)}</select></Field></div>
        <Field label="Descrição"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" /></Field>
        {editing.id && <p className="linked-booking">Código de tracking: <strong>{current?.code}</strong> · Progresso: <strong>{current?.progress || 0}%</strong></p>}
        <div className="form-section-title">02 / PRAZO E PAGAMENTOS</div>
        <div className="form-grid"><Field label="Estado"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["Em planeamento", "Em desenvolvimento", "Em revisão", "Concluído", "Em pausa"].map((s) => <option key={s}>{s}</option>)}</select></Field><Field label="Início"><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field><Field label="Prazo de conclusão"><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field><Field label="Orçamento (Kz)"><input type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field><Field label="Pagamento recebido (Kz)"><input type="number" min="0" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} /></Field></div>
        <p>Em falta: <strong>{money(Math.max(0, Number(form.budget || 0) - Number(form.amountPaid || 0)))}</strong></p>
        <div className="form-section-title">03 / OBJETIVOS · PROGRESSO AUTOMÁTICO</div>
        {editing.id ? <>{current?.objectives?.map((o) => <div className="objective-row" key={o.id}><button type="button" className="table-action" onClick={() => objectiveAction("toggle", o)}>{o.completed ? <CheckCircle2 size={19} /> : <Circle size={19} />} {o.title}</button><button type="button" className="icon-button danger" aria-label={`Remover ${o.title}`} onClick={() => objectiveAction("delete", o)}><Trash2 size={16} /></button></div>)}<div className="objective-row"><input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Novo objetivo ou implementação" /><button type="button" className="button subtle" disabled={!objective.trim()} onClick={() => objectiveAction("add")}><Plus size={16} /> Acrescentar</button></div></> : <><div className="objective-row"><input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Escreve um objetivo" /><button className="button subtle" type="button" disabled={!objective.trim()} onClick={() => { setPendingObjectives([...pendingObjectives, objective.trim()]); setObjective(""); }}><Plus size={16} /> Acrescentar</button></div>{pendingObjectives.map((title, index) => <div className="objective-row" key={`${title}-${index}`}>{title}<button type="button" onClick={() => setPendingObjectives(pendingObjectives.filter((_, i) => i !== index))}>Remover</button></div>)}</>}
        <div className="form-section-title">04 / LINKS DE DEMONSTRAÇÃO</div>
        {form.links.map((item, index) => <div className="objective-row" key={index}><a href={item.url} target="_blank" rel="noreferrer">{item.label} ↗</a><button type="button" className="table-action" onClick={() => setForm({ ...form, links: form.links.filter((_, i) => i !== index) })}>Remover</button></div>)}
        <div className="form-grid"><Field label="Nome do link"><input value={link.label} onChange={(e) => setLink({ ...link, label: e.target.value })} placeholder="Protótipo navegável" /></Field><Field label="URL da demonstração"><input type="url" value={link.url} onChange={(e) => setLink({ ...link, url: e.target.value })} placeholder="https://…" /></Field></div><button type="button" className="button subtle" disabled={!link.label.trim() || !/^https?:\/\//.test(link.url)} onClick={() => { setForm({ ...form, links: [...form.links, link] }); setLink({ label: "", url: "" }); }}><Plus size={16} /> Adicionar link</button>
        {error && <p className="tracking-admin-error" role="alert">{error}</p>}
        <FormActions onCancel={() => setEditing(null)} />
      </form>
    </Modal>}
  </>;
}
