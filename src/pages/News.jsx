import { useState } from "react";
import { CalendarDays, FileText, Plus, Star, Trash2 } from "lucide-react";
import { useAdmin } from "../App";
import ImageFields from "../components/ImageFields";
import {
  Badge,
  Empty,
  Field,
  FormActions,
  Modal,
  PageIntro,
  Panel,
} from "../components/UI";
import { formatDate, id, today, toggleFeatured } from "../lib/storage";

const blank = {
  title: "",
  slug: "",
  subtitle: "",
  category: "Novidades",
  summary: "",
  sections: [{ title: "", text: "" }],
  checklist: [],
  images: [],
  status: "Rascunho",
  featured: false,
  date: today(),
};
export default function News() {
  const { news, setNews, can } = useAdmin();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [checkText, setCheckText] = useState("");
  function open(item) {
    setEditing(item || {});
    setForm(
      item
        ? {
            ...item,
            sections: item.sections.map((section) => ({ ...section })),
          }
        : { ...blank, sections: [{ title: "", text: "" }] },
    );
    setCheckText(item?.checklist?.join("\n") || "");
  }
  function save(event) {
    event.preventDefault();
    const item = {
      ...form,
      id: editing.id || id(),
      slug: form.slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-"),
      checklist: checkText
        .split("\n")
        .map((text) => text.trim())
        .filter(Boolean),
      images: form.images.filter(Boolean),
      sections: form.sections.filter(
        (section) => section.title.trim() || section.text.trim(),
      ),
    };
    if (
      news.some((entry) => entry.slug === item.slug && entry.id !== editing.id)
    )
      return window.alert("Já existe uma notícia com este identificador.");
    if (
      item.featured &&
      !editing.featured &&
      news.filter((entry) => entry.featured).length >= 3
    )
      return window.alert("Já existem três notícias em destaque.");
    setNews(
      editing.id
        ? news.map((entry) => (entry.id === editing.id ? item : entry))
        : [item, ...news],
    );
    setEditing(null);
  }
  function remove(item) {
    if (window.confirm(`Eliminar a notícia ${item.title}?`)) setNews(news.filter((entry) => entry.id !== item.id));
  }
  return (
    <>
      <PageIntro
        eyebrow="CONTEÚDO / EDITORIAL"
        title="Notícias & histórias"
        description="Constrói artigos com título, secções, listas e imagens. Escolhe até três notícias principais."
        action={
          can("news", "create") && <button className="button primary" onClick={() => open()}>
            <Plus size={16} /> Nova notícia
          </button>
        }
      />
      <div className="editorial-banner">
        <span className="eyebrow">THE SIRUS JOURNAL</span>
        <h2>
          Boas ideias merecem
          <br />
          <em>ser bem contadas.</em>
        </h2>
        <p>
          {news.filter((item) => item.featured).length} / 3 notícias em destaque
          · {news.length} artigos na biblioteca
        </p>
        <span className="editorial-mark">✳</span>
      </div>
      <Panel
        title="Biblioteca de notícias"
        action={<Badge>{news.length} artigos</Badge>}
      >
        {news.length ? (
          <div className="news-list">
            {news.map((item) => (
              <article className="news-row" key={item.id}>
                <div className="news-thumb">
                  {item.images[0] ? (
                    <img src={item.images[0]} alt="" />
                  ) : (
                    <FileText size={24} />
                  )}
                </div>
                <div className="news-copy">
                  <span className="eyebrow">
                    {item.category} · {formatDate(item.date)}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
                <div className="news-actions">
                  <Badge
                    tone={item.status === "Publicado" ? "success" : "neutral"}
                  >
                    {item.status}
                  </Badge>
                  {can("news", "edit") && <button
                    className={`feature-button ${item.featured ? "featured" : ""}`}
                    onClick={() => toggleFeatured(news, setNews, item.id)}
                  >
                    <Star
                      size={16}
                      fill={item.featured ? "currentColor" : "none"}
                    />{" "}
                    {item.featured ? "Principal" : "Destacar"}
                  </button>}
                  {can("news", "edit") && <button className="table-action" onClick={() => open(item)}>Editar →</button>}
                  {can("news", "delete") && <button type="button" className="icon-button danger" aria-label={`Eliminar ${item.title}`} onClick={() => remove(item)}><Trash2 size={16} /></button>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty />
        )}
      </Panel>
      {editing && (
        <Modal
          title={editing.id ? "Editar notícia" : "Nova notícia"}
          onClose={() => setEditing(null)}
          wide
        >
          <form onSubmit={save} className="form-stack">
            <div className="form-section-title">01 / IDENTIDADE DA NOTÍCIA</div>
            <Field label="Título principal">
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
            <div className="form-grid">
              <Field label="Subtítulo">
                <input
                  value={form.subtitle}
                  onChange={(event) =>
                    setForm({ ...form, subtitle: event.target.value })
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
              <Field label="Categoria">
                <input
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                />
              </Field>
              <Field label="Data">
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Resumo para o card">
              <textarea
                rows="2"
                required
                value={form.summary}
                onChange={(event) =>
                  setForm({ ...form, summary: event.target.value })
                }
              />
            </Field>
            <div className="form-section-title">02 / CORPO DO ARTIGO</div>
            {form.sections.map((section, index) => (
              <div className="article-section" key={index}>
                <div className="image-fields-title">
                  <b>Secção {index + 1}</b>
                  <button
                    type="button"
                    className="table-action danger-text"
                    onClick={() =>
                      setForm({
                        ...form,
                        sections: form.sections.filter(
                          (_, position) => position !== index,
                        ),
                      })
                    }
                  >
                    Remover
                  </button>
                </div>
                <Field label="Título da secção">
                  <input
                    value={section.title}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        sections: form.sections.map((item, position) =>
                          position === index
                            ? { ...item, title: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Texto">
                  <textarea
                    rows="4"
                    value={section.text}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        sections: form.sections.map((item, position) =>
                          position === index
                            ? { ...item, text: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </Field>
              </div>
            ))}
            <button
              type="button"
              className="button subtle"
              onClick={() =>
                setForm({
                  ...form,
                  sections: [...form.sections, { title: "", text: "" }],
                })
              }
            >
              <Plus size={15} /> Adicionar secção
            </button>
            <Field
              label="Lista de pontos assinalados"
              hint="Um ponto por linha."
            >
              <textarea
                rows="3"
                value={checkText}
                onChange={(event) => setCheckText(event.target.value)}
              />
            </Field>
            <ImageFields
              images={form.images}
              onChange={(images) => setForm((current) => ({ ...current, images }))}
            />
            <div className="form-grid">
              <Field label="Estado editorial">
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                >
                  <option>Rascunho</option>
                  <option>Pronto para revisão</option>
                  <option>Publicado</option>
                </select>
              </Field>
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    setForm({ ...form, featured: event.target.checked })
                  }
                />
                <Star size={16} /> Notícia principal
              </label>
            </div>
            <FormActions onCancel={() => setEditing(null)} />
          </form>
        </Modal>
      )}
    </>
  );
}
