import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAdmin } from "../App";
import { PageIntro, Panel, Field } from "../components/UI";

// As senhas só existem nesta resposta, e nunca são guardadas no navegador.
export default function ClientTracking() {
  const { id } = useParams();
  const { projects } = useAdmin();
  const project = projects.find((item) => item.id === id);
  const client = project?.client;
  const [reports, setReports] = useState([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [updates, setUpdates] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [kind, setKind] = useState("updates");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [replyText, setReplyText] = useState({});
  async function refresh() {
    const [reportsResult, tracking] = await Promise.all([
      api(`/admin/projects/${id}/reports`),
      project?.code ? api(`/public/tracking/${encodeURIComponent(project.code)}`) : Promise.resolve({ project: {} }),
    ]);
    setReports(reportsResult);
    setUpdates(tracking.project.updates || []);
    setAlerts(tracking.project.alerts || []);
  }
  useEffect(() => { if (project) refresh().catch((reason) => setError(reason.message)); }, [id, project?.code]);
  if (!project) return <PageIntro title="Projeto não encontrado" action={<Link to="/projetos">Voltar aos projetos</Link>} />;
  async function createPassword() {
    if (!window.confirm("Gerar uma nova senha? A anterior deixará de funcionar.")) return;
    try { const result = await api(`/admin/clients/${project.clientId}/password`, { method: "POST" }); setPassword(result.password); setError(""); } catch (reason) { setError(reason.message); }
  }
  async function post(event) {
    event.preventDefault();
    try {
      await api(`/admin/projects/${id}/${kind}`, { method: "POST", body: kind === "updates" ? { title, description: message } : { title, message } });
      setTitle(""); setMessage(""); await refresh(); setError("");
    } catch (reason) { setError(reason.message); }
  }
  async function reply(event, reportId) {
    event.preventDefault();
    try { await api(`/admin/reports/${reportId}/replies`, { method: "POST", body: { message: replyText[reportId] } }); setReplyText((old) => ({ ...old, [reportId]: "" })); await refresh(); setError(""); } catch (reason) { setError(reason.message); }
  }
  return <div className="project-workspace">
    <PageIntro eyebrow="CLIENTE / TRACKING" title={project.title} description={`Acompanhamento de ${client?.name || "projeto interno"}`} action={<Link to="/projetos" className="button subtle">← Voltar</Link>} />
    {error && <p className="tracking-admin-error" role="alert">{error}</p>}
    <div className="two-column"><Panel title="Resumo e acesso" className="project-access-panel">
      <p>Código de acompanhamento: <strong>{project.code}</strong></p>
      <p>Pagamento: {Number(project.amountPaid || 0).toLocaleString("pt-AO")} Kz de {Number(project.budget || 0).toLocaleString("pt-AO")} Kz · {project.progress}% concluído.</p>
      {project.clientId && <button className="button primary" onClick={createPassword}>Gerar / substituir senha do cliente</button>}
      {password && <div className="tracking-admin-secret" role="status"><strong>Senha para enviar pelo WhatsApp: {password}</strong><p>Copia agora. Esta senha não volta a aparecer.</p></div>}
    </Panel><Panel title="Publicar atualização ou aviso"><form onSubmit={post} className="form-stack">
      <Field label="Tipo de publicação"><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="updates">Atualização</option><option value="alerts">Aviso</option></select></Field>
      <Field label="Título"><input placeholder="Ex.: Nova funcionalidade disponível" required value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
      <Field label="Descrição"><textarea placeholder="Explica o que foi implementado ou o que o cliente precisa de saber…" required rows="4" value={message} onChange={(event) => setMessage(event.target.value)} /></Field>
      <button className="button primary" type="submit">Publicar no acompanhamento</button>
    </form></Panel></div>
    <div className="two-column"><Panel title="Atualizações e avisos">{[...updates.map((item) => ({ ...item, type: "Atualização", body: item.description })), ...alerts.map((item) => ({ ...item, type: "Aviso", body: item.message }))].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item) => <article className="tracking-admin-entry" key={item.id}><small>{item.type} · {new Date(item.createdAt).toLocaleDateString("pt-AO")}</small><h3>{item.title}</h3><p>{item.body}</p></article>)}</Panel>
    <Panel title="Relatos do cliente">{reports.length ? reports.map((item) => <article className="tracking-admin-entry" key={item.id}><small>{item.status} · {new Date(item.createdAt).toLocaleDateString("pt-AO")}</small><p>{item.message}</p>{item.replies.map((reply) => <p key={reply.id}><strong>Resposta:</strong> {reply.message}</p>)}<form className="form-stack" onSubmit={(event) => reply(event,item.id)}><label className="field"><span>Resposta ao cliente</span><textarea required placeholder="Escreve uma resposta para o cliente" value={replyText[item.id] || ""} onChange={(event) => setReplyText((old) => ({ ...old, [item.id]: event.target.value }))} /></label><button type="submit" className="button primary">Responder</button></form></article>) : <p>Sem relatos neste projeto.</p>}</Panel></div>
  </div>;
}
