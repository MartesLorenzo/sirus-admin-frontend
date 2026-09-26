import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowUpRight,
  Globe2,
  Image,
  Monitor,
  Plus,
  Smartphone,
  Star,
  Trash2,
} from "lucide-react";
import { useAdmin } from "../App";
import { useSystemDialog } from "../components/SystemDialog";
import ImageFields from "../components/ImageFields";
import {
  Badge,
  Empty,
  Field,
  FormActions,
  Modal,
  PageIntro,
} from "../components/UI";
import { id } from "../lib/storage";

const types = {
  websites: { title: "Portfólio Web", label: "Websites", icon: Globe2 },
  mobile: { title: "Portfólio Mobile", label: "Apps mobile", icon: Smartphone },
  pc: { title: "Portfólio PC", label: "Softwares PC", icon: Monitor },
};
const blank = {
  title: "",
  slug: "",
  description: "",
  visionTitle: "",
  visionDescription: "",
  checklist: [],
  status: "Em desenvolvimento",
  statusNote: "",
  images: [],
  link: "",
  featured: false,
  published: false,
};

export default function Portfolio() {
  const { category } = useParams();
  const { portfolio, setPortfolio, can } = useAdmin();
  const dialog = useSystemDialog();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [checkText, setCheckText] = useState("");
  const type = types[category] || types.websites;
  const Icon = type.icon;
  const items = portfolio.filter((entry) => entry.category === category);
  const featured = items.filter((entry) => entry.featured).length;
  function open(item) {
    setEditing(item || {});
    setForm(item ? { ...item } : { ...blank });
    setCheckText(item?.checklist?.join("\n") || "");
  }
  function toggleCategoryFeature(item) {
    if (!item.featured && featured >= 3)
      return dialog.notice("Podes destacar até 3 trabalhos nesta categoria.");
    setPortfolio(
      portfolio.map((entry) =>
        entry.id === item.id ? { ...entry, featured: !entry.featured } : entry,
      ),
    );
  }
  function save(event) {
    event.preventDefault();
    const slug = form.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");
    const item = {
      ...form,
      id: editing.id || id(),
      category,
      slug,
      checklist: checkText
        .split("\n")
        .map((text) => text.trim())
        .filter(Boolean),
      images: form.images.filter(Boolean),
    };
    if (
      portfolio.some((entry) => entry.slug === slug && entry.id !== editing.id)
    )
      return dialog.notice("Já existe um trabalho com este identificador.");
    if (item.featured && !editing.featured && featured >= 3)
      return dialog.notice(
        "Já existem três trabalhos em destaque nesta categoria.",
      );
    setPortfolio(
      editing.id
        ? portfolio.map((entry) => (entry.id === editing.id ? item : entry))
        : [item, ...portfolio],
    );
    setEditing(null);
  }
  const accessArea = `portfolio_${category === "websites" ? "web" : category}`;
  async function remove(item) {
    if (await dialog.confirm(`Eliminar o trabalho ${item.title}?`)) setPortfolio(portfolio.filter((entry) => entry.id !== item.id));
  }
  return (
    <>
      <PageIntro
        eyebrow="CONTEÚDO / PORTFÓLIO"
        title={type.title}
        description={`Apresenta trabalhos de ${type.label.toLowerCase()} com contexto, visão, funcionalidades e uma galeria sem limite fixo de imagens.`}
        action={
          can(accessArea, "create") && <button className="button primary" onClick={() => open()}>
            <Plus size={16} /> Novo trabalho
          </button>
        }
      />
      <div className="category-summary">
        <span className="category-icon">
          <Icon size={27} />
        </span>
        <div>
          <span className="eyebrow">COLEÇÃO / {type.label.toUpperCase()}</span>
          <h2>{items.length} trabalhos na coleção</h2>
          <p>
            {featured} de 3 posições de destaque utilizadas nesta categoria.
          </p>
        </div>
        <span className="category-watermark">
          0{category === "websites" ? 1 : category === "mobile" ? 2 : 3}
        </span>
      </div>
      <div className="portfolio-grid">
        {items.map((item, index) => (
          <article className="work-card" key={item.id}>
            <div className="work-cover">
              {item.images[0] ? (
                <img src={item.images[0]} alt={item.title} />
              ) : (
                <>
                  <Icon size={48} strokeWidth={1} />
                  <span> SIRUS / {String(index + 1).padStart(2, "0")}</span>
                </>
              )}
            </div>
            <div className="work-body">
              <div className="work-meta">
                <Badge>{item.status}</Badge>
                {can(accessArea, "edit") && <button
                  className={`feature-button ${item.featured ? "featured" : ""}`}
                  onClick={() => toggleCategoryFeature(item)}
                  title="Alternar destaque"
                >
                  <Star
                    size={16}
                    fill={item.featured ? "currentColor" : "none"}
                  />{" "}
                  {item.featured ? "Em destaque" : "Destacar"}
                </button>}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="work-bottom">
                <small>
                  {item.images.length} imagens · {item.checklist.length} pontos
                </small>
                {can(accessArea, "edit") && <button className="table-action" onClick={() => open(item)}>Editar <ArrowUpRight size={16} /></button>}
                {can(accessArea, "delete") && <button type="button" className="icon-button danger" aria-label={`Eliminar ${item.title}`} onClick={() => remove(item)}><Trash2 size={16} /></button>}
              </div>
            </div>
          </article>
        ))}
        {!items.length && (
          <div className="empty large">
            <Image size={28} />
            Ainda não há trabalhos nesta categoria.
            {can(accessArea, "create") && <button className="button primary" onClick={() => open()}>Criar primeiro trabalho</button>}
          </div>
        )}
      </div>
      {editing && (
        <Modal
          title={
            editing.id ? "Editar trabalho" : `Novo trabalho · ${type.label}`
          }
          onClose={() => setEditing(null)}
          wide
        >
          <form onSubmit={save} className="form-stack">
            <div className="form-section-title">01 / APRESENTAÇÃO</div>
            <div className="form-grid">
              <Field label="Título do trabalho">
                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                      ...(!editing.id && !form.slug
                        ? {
                            slug: event.target.value
                              .toLowerCase()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                              .replace(/[^a-z0-9]+/g, "-"),
                          }
                        : {}),
                    })
                  }
                />
              </Field>
              <Field label="Identificador da URL">
                <input
                  required
                  value={form.slug}
                  onChange={(event) =>
                    setForm({ ...form, slug: event.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Descrição curta">
              <textarea
                required
                rows="2"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </Field>
            <div className="form-grid">
              <Field label="Título da visão do projeto">
                <input
                  value={form.visionTitle}
                  onChange={(event) =>
                    setForm({ ...form, visionTitle: event.target.value })
                  }
                />
              </Field>
              <Field label="Estado do projeto">
                <input
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  placeholder="Conceito visual, publicado…"
                />
              </Field>
            </div>
            <Field label="Descrição da visão">
              <textarea
                rows="3"
                value={form.visionDescription}
                onChange={(event) =>
                  setForm({ ...form, visionDescription: event.target.value })
                }
              />
            </Field>
            <div className="form-section-title">02 / DETALHES & MEDIA</div>
            <Field
              label="Pontos assinalados / funcionalidades"
              hint="Um ponto por linha."
            >
              <textarea
                rows="3"
                value={checkText}
                onChange={(event) => setCheckText(event.target.value)}
              />
            </Field>
            <Field label="Observação do estado">
              <textarea
                rows="2"
                value={form.statusNote}
                onChange={(event) =>
                  setForm({ ...form, statusNote: event.target.value })
                }
                placeholder="Ex.: protótipo, disponível para visita…"
              />
            </Field>
            <Field label="Ligação externa / download">
              <input
                type="url"
                value={form.link}
                onChange={(event) =>
                  setForm({ ...form, link: event.target.value })
                }
                placeholder="https://…"
              />
            </Field>
            {category === "mobile" && <div className="form-grid"><Field label="Download Android"><input type="url" value={form.androidUrl || ""} onChange={(event) => setForm({ ...form, androidUrl: event.target.value })} /></Field><Field label="Download iOS"><input type="url" value={form.iosUrl || ""} onChange={(event) => setForm({ ...form, iosUrl: event.target.value })} /></Field></div>}
            <ImageFields
              images={form.images}
              onChange={(images) => setForm((current) => ({ ...current, images }))}
            />
            <label className="check-line">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  setForm({ ...form, featured: event.target.checked })
                }
              />
              <Star size={16} /> Destacar na página inicial{" "}
              <small>Máximo de 3 por categoria</small>
            </label>
            <label className="check-line"><input type="checkbox" checked={Boolean(form.published)} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Publicar no website</label>
            <FormActions onCancel={() => setEditing(null)} />
          </form>
        </Modal>
      )}
    </>
  );
}
