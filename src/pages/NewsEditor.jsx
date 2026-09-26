import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../App";
import ImageFields from "../components/ImageFields";
import { Field, PageIntro, Panel } from "../components/UI";
import { useSystemDialog } from "../components/SystemDialog";
import { id, today } from "../lib/storage";

const blank = { title: "", slug: "", subtitle: "", category: "Novidades", summary: "", sections: [], checklist: [], images: [], status: "Rascunho", featured: false, date: today() };
const types = { section: "Título e texto", text: "Corpo de texto", checklist: "Pontos assinalados", callout: "Etiqueta em destaque", image: "Imagem no artigo" };
function newBlock(type) {
  if (type === "section") return { type, title: "", text: "" };
  if (type === "text") return { type, text: "" };
  if (type === "checklist") return { type, items: [] };
  if (type === "callout") return { type, label: "", text: "" };
  return { type: "image", url: "", alt: "", caption: "" };
}
function normalize(item) {
  const sections = (item.sections || []).map((block) => ({ ...block, type: block.type || "section" }));
  if (item.checklist?.length && !sections.some((block) => block.type === "checklist")) sections.push({ type: "checklist", items: item.checklist });
  return { ...item, sections };
}
const slugify = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function NewsEditor() {
  const { id: articleId } = useParams();
  const navigate = useNavigate();
  const { news, setNews } = useAdmin();
  const dialog = useSystemDialog();
  const existing = news.find((item) => String(item.id) === articleId);
  const [form, setForm] = useState(() => existing ? normalize(existing) : { ...blank, sections: [newBlock("section")] });
  const [typeToAdd, setTypeToAdd] = useState("text");
  const [uploadBusy, setUploadBusy] = useState(false);
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const changeBlock = (index, changes) => setForm((current) => ({ ...current, sections: current.sections.map((block, position) => position === index ? { ...block, ...changes } : block) }));
  const move = (index, direction) => setForm((current) => {
    const sections = [...current.sections], target = index + direction;
    if (target < 0 || target >= sections.length) return current;
    [sections[index], sections[target]] = [sections[target], sections[index]];
    return { ...current, sections };
  });
  function addBlock() { setForm((current) => ({ ...current, sections: [...current.sections, newBlock(typeToAdd)] })); }
  async function save(event) {
    event.preventDefault();
    const item = { ...form, id: existing?.id || id(), slug: slugify(form.slug), images: form.images.filter(Boolean),
      // A lista antiga só é conservada para compatibilidade; os novos pontos ficam na ordem dos blocos.
      checklist: existing?.checklist || [],
      sections: form.sections.filter((block) => block.type === "image" ? block.url : block.type === "checklist" ? block.items.some(Boolean) : block.text?.trim() || block.title?.trim()),
    };
    if (!item.slug) return dialog.notice("Preenche o identificador da URL.");
    if (news.some((entry) => entry.slug === item.slug && entry.id !== existing?.id)) return dialog.notice("Já existe uma notícia com este identificador.");
    if (item.featured && !existing?.featured && news.filter((entry) => entry.featured).length >= 3) return dialog.notice("Já existem três notícias em destaque.");
    setNews(existing ? news.map((entry) => entry.id === existing.id ? item : entry) : [item, ...news]);
    navigate("/noticias");
  }
  if (articleId && !existing) return <Panel title="Notícia não encontrada"><Link to="/noticias">Voltar às notícias</Link></Panel>;
  return <>
    <PageIntro eyebrow="SIRUS / JOURNAL" title={existing ? "Editar notícia" : "Nova notícia"} description="Organiza os blocos na ordem em que serão publicados. Usa ##texto## para colocar palavras em negrito." action={<Link className="button subtle" to="/noticias"><ArrowLeft size={16} /> Notícias</Link>} />
    <form onSubmit={save} className="news-editor-page">
      <Panel title="01 / Identidade da notícia"><div className="form-stack">
        <Field label="Título principal"><input required maxLength={250} value={form.title} onChange={(event) => { const title = event.target.value; setForm((current) => ({ ...current, title, slug: existing || current.slug !== slugify(current.title) ? current.slug : slugify(title) })); }} /></Field>
        <div className="form-grid"><Field label="Subtítulo"><input value={form.subtitle} onChange={(event) => change("subtitle", event.target.value)} /></Field><Field label="Identificador da URL"><input required value={form.slug} onChange={(event) => change("slug", event.target.value)} /></Field><Field label="Categoria"><input value={form.category} onChange={(event) => change("category", event.target.value)} /></Field><Field label="Data"><input required type="date" value={form.date} onChange={(event) => change("date", event.target.value)} /></Field></div>
        <Field label="Resumo para o card"><textarea required rows={3} value={form.summary} onChange={(event) => change("summary", event.target.value)} /></Field>
        <ImageFields images={form.images} onChange={(images) => change("images", images)} onBusyChange={setUploadBusy} />
        <p className="field-note">A primeira imagem é a capa. As restantes aparecem no mesmo espaço com setas de navegação.</p>
      </div></Panel>
      <Panel title="02 / Corpo do artigo"><div className="news-blocks">
        {form.sections.map((block, index) => <div className="news-editor-block" key={index}>
          <div className="news-editor-block-head"><strong>{String(index + 1).padStart(2, "0")} · {types[block.type] || "Título e texto"}</strong><div>
            <button type="button" aria-label="Mover acima" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={17} /></button>
            <button type="button" aria-label="Mover abaixo" disabled={index === form.sections.length - 1} onClick={() => move(index, 1)}><ArrowDown size={17} /></button>
            <button type="button" aria-label="Remover elemento" onClick={() => change("sections", form.sections.filter((_, position) => position !== index))}><Trash2 size={17} /></button>
          </div></div>
          {block.type === "section" && <Field label="Título da secção"><input value={block.title} onChange={(event) => changeBlock(index, { title: event.target.value })} /></Field>}
          {!["image", "checklist"].includes(block.type) && <Field label={block.type === "callout" ? "Texto em destaque" : "Texto"}><textarea rows={5} value={block.text} onChange={(event) => changeBlock(index, { text: event.target.value })} placeholder="Usa ##palavras## para escrever em negrito" /></Field>}
          {block.type === "callout" && <Field label="Etiqueta"><input value={block.label} onChange={(event) => changeBlock(index, { label: event.target.value })} placeholder="Por exemplo: Estado" /></Field>}
          {block.type === "checklist" && <Field label="Pontos assinalados" hint="Um ponto por linha"><textarea rows={4} value={block.items.join("\n")} onChange={(event) => changeBlock(index, { items: event.target.value.split("\n") })} /></Field>}
          {block.type === "image" && <><ImageFields maxImages={1} images={block.url ? [block.url] : []} onChange={(images) => changeBlock(index, { url: images[0] || "" })} onBusyChange={setUploadBusy} /><div className="form-grid"><Field label="Texto alternativo"><input value={block.alt} onChange={(event) => changeBlock(index, { alt: event.target.value })} /></Field><Field label="Legenda"><input value={block.caption} onChange={(event) => changeBlock(index, { caption: event.target.value })} /></Field></div></>}
        </div>)}
        <div className="news-add-block"><label htmlFor="news-block-type">Adicionar elemento</label><select id="news-block-type" value={typeToAdd} onChange={(event) => setTypeToAdd(event.target.value)}>{Object.entries(types).map(([type, label]) => <option key={type} value={type}>{label}</option>)}</select><button className="button subtle" type="button" onClick={addBlock}><Plus size={16} /> Adicionar elemento</button></div>
      </div></Panel>
      <Panel title="03 / Publicação"><div className="form-grid"><Field label="Estado editorial"><select value={form.status} onChange={(event) => change("status", event.target.value)}><option>Rascunho</option><option>Pronto para revisão</option><option>Publicado</option></select></Field><label className="check-line"><input type="checkbox" checked={form.featured} onChange={(event) => change("featured", event.target.checked)} /> Notícia principal</label></div></Panel>
      <div className="news-editor-footer"><Link className="button subtle" to="/noticias">Cancelar</Link><button type="submit" className="button primary" disabled={uploadBusy}>{uploadBusy ? "A carregar imagem…" : "Guardar notícia"}</button></div>
    </form>
  </>;
}
