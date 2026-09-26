import { useState } from "react";
import { Building2, Image as ImageIcon, Plus, Star, Trash2, MessageSquareQuote } from "lucide-react";
import { useAdmin } from "../App";
import ImageFields from "../components/ImageFields";
import { Badge, Empty, Field, Modal, PageIntro, Panel } from "../components/UI";
import { id } from "../lib/storage";

const newCompany = { name: "", logo: "", website: "", featured: false, published: false };
const newTestimonial = { name: "", role: "", quote: "", images: [], featured: false, published: false };

export default function SocialProof() {
  const { companies, setCompanies, testimonials, setTestimonials } = useAdmin();
  const [tab, setTab] = useState("testimonials");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const isCompany = tab === "companies";
  const items = isCompany ? companies : testimonials;
  const change = isCompany ? setCompanies : setTestimonials;

  function open(item) {
    setEditing(item || {});
    setForm(item ? { ...item, images: [...(item.images || [])] } : { ...(isCompany ? newCompany : newTestimonial), ...(!isCompany ? { images: [] } : {}) });
    setError("");
  }
  function save(event) {
    event.preventDefault();
    if (uploading) return setError("Aguarda até o upload terminar.");
    if (isCompany && !form.logo) return setError("Carrega o logótipo da empresa.");
    if (form.featured && !editing.id && items.filter((item) => item.featured).length >= 3 ||
        form.featured && editing.id && !editing.featured && items.filter((item) => item.featured).length >= 3)
      return setError("Já existem três destaques nesta coleção.");
    const saved = { ...form, id: editing.id || id() };
    change(editing.id ? items.map((item) => item.id === editing.id ? saved : item) : [saved, ...items]);
    setEditing(null);
  }
  function remove(item) {
    if (window.confirm(`Eliminar ${isCompany ? "a empresa" : "o testemunho"} de ${item.name}?`))
      change(items.filter((entry) => entry.id !== item.id));
  }
  return <>
    <PageIntro eyebrow="CONFIANÇA / CONTEÚDO" title="Testemunhos & empresas" description="Publica relatos reais com imagens e apresenta as empresas que confiam em nós. Os três destaques surgem primeiro." action={<button className="button primary" onClick={() => open()}><Plus size={16} /> {isCompany ? "Nova empresa" : "Novo testemunho"}</button>} />
    <div className="segmented social-tabs">
      <button className={tab === "testimonials" ? "selected" : ""} onClick={() => { setTab("testimonials"); setEditing(null); }}><MessageSquareQuote size={16} /> Testemunhos <span>{testimonials.length}</span></button>
      <button className={tab === "companies" ? "selected" : ""} onClick={() => { setTab("companies"); setEditing(null); }}><Building2 size={16} /> Empresas <span>{companies.length}</span></button>
    </div>
    <Panel title={isCompany ? "Empresas que confiam em nós" : "Relatos dos clientes"} action={<Badge>{items.filter((item) => item.featured).length} de 3 destaques</Badge>}>
      <div className="social-admin-grid">{items.map((item) => <article key={item.id} className="social-admin-card">
        {isCompany ? <div className="social-admin-logo"><img src={item.logo} alt={`Logótipo ${item.name}`} /></div> : item.images?.length ? <div className="social-admin-preview"><img src={item.images[0]} alt="" /><span>{item.images.length} {item.images.length === 1 ? "imagem" : "imagens"}</span></div> : <div className="social-admin-preview empty-image"><MessageSquareQuote size={30} /></div>}
        <div className="social-admin-info"><div className="social-admin-tags"><Badge tone={item.published ? "success" : "neutral"}>{item.published ? "Publicado" : "Rascunho"}</Badge>{item.featured && <span className="social-admin-featured"><Star size={14} fill="currentColor" /> Destaque</span>}</div>
          <h3>{item.name}</h3>{isCompany ? <p>{item.website || "Sem website associado"}</p> : <><small>{item.role}</small><p>“{item.quote}”</p></>}
          <div className="social-admin-actions"><button className="table-action" onClick={() => open(item)}>Editar →</button><button type="button" className="table-action danger-text" onClick={() => remove(item)}><Trash2 size={15} /> Eliminar</button></div>
        </div>
      </article>)}</div>{!items.length && <Empty>{isCompany ? "Acrescenta a primeira empresa." : "Acrescenta o primeiro testemunho."}</Empty>}
    </Panel>
    {editing && <Modal title={editing.id ? `Editar ${isCompany ? "empresa" : "testemunho"}` : isCompany ? "Nova empresa" : "Novo testemunho"} onClose={() => setEditing(null)} wide>
      <form onSubmit={save} className="form-stack">
        <div className="form-section-title">01 / {isCompany ? "EMPRESA" : "TESTEMUNHO"}</div>
        <Field label={isCompany ? "Nome da empresa" : "Nome do cliente"}><input required maxLength="200" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        {isCompany ? <>
          <Field label="Website (opcional)"><input type="url" value={form.website} placeholder="https://…" onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
          <ImageFields images={form.logo ? [form.logo] : []} maxImages={1} onBusyChange={setUploading} onChange={(images) => setForm((current) => ({ ...current, logo: images[0] || "" }))} />
        </> : <>
          <Field label="Função / empresa"><input maxLength="200" value={form.role} placeholder="Ex.: Diretora, Empresa X" onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
          <Field label="O que o cliente disse"><textarea required maxLength="5000" rows="5" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} /></Field>
          <div className="form-section-title">02 / FOTOGRAFIAS (OPCIONAIS)</div>
          <ImageFields images={form.images} onBusyChange={setUploading} onChange={(images) => setForm((current) => ({ ...current, images }))} />
          <p className="field-note"><ImageIcon size={15} /> Até 3 imagens aparecem no card; ao abrir a galeria o visitante vê todas.</p>
        </>}
        <div className="form-section-title">03 / VISIBILIDADE</div>
        <label className="check-line"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /><Star size={16} /> Destacar (máximo 3)</label>
        <label className="check-line"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publicar no website</label>
        {error && <p role="alert" className="tracking-admin-error">{error}</p>}
        <div className="form-actions"><button type="button" className="button ghost" onClick={() => setEditing(null)}>Cancelar</button><button type="submit" className="button primary" disabled={uploading}>{uploading ? "A carregar imagens…" : editing.id ? "Guardar alterações" : "Criar registo"}</button></div>
      </form>
    </Modal>}
  </>;
}
