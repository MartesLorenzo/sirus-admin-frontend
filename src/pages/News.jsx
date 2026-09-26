import { FileText, Plus, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdmin } from "../App";
import { Badge, Empty, PageIntro, Panel } from "../components/UI";
import { useSystemDialog } from "../components/SystemDialog";
import { formatDate } from "../lib/storage";

export default function News() {
  const { news, setNews, can } = useAdmin();
  const dialog = useSystemDialog();
  async function feature(item) {
    if (!item.featured && news.filter((entry) => entry.featured).length >= 3) {
      await dialog.notice("Podes destacar até três notícias."); return;
    }
    setNews(news.map((entry) => entry.id === item.id ? { ...entry, featured: !entry.featured } : entry));
  }
  async function remove(item) {
    if (await dialog.confirm(`Eliminar a notícia ${item.title}?`))
      setNews(news.filter((entry) => entry.id !== item.id));
  }
  return <>
    <PageIntro eyebrow="CONTEÚDO / EDITORIAL" title="Notícias & histórias" description="Cria artigos com blocos de texto, imagens e elementos de destaque." action={can("news", "create") && <Link className="button primary" to="/noticias/nova"><Plus size={16} /> Nova notícia</Link>} />
    <div className="editorial-banner"><span className="eyebrow">THE SIRUS JOURNAL</span><h2>Boas ideias merecem<br /><em>ser bem contadas.</em></h2><p>{news.filter((item) => item.featured).length} / 3 notícias em destaque · {news.length} artigos na biblioteca</p><span className="editorial-mark">✳</span></div>
    <Panel title="Biblioteca de notícias" action={<Badge>{news.length} artigos</Badge>}>
      {news.length ? <div className="news-list">{news.map((item) => <article className="news-row" key={item.id}>
        <div className="news-thumb">{item.images?.[0] ? <img src={item.images[0]} alt="" /> : <FileText size={24} />}</div>
        <div className="news-copy"><span className="eyebrow">{item.category} · {formatDate(item.date)}</span><h3>{item.title}</h3><p>{item.summary}</p></div>
        <div className="news-actions"><Badge tone={item.status === "Publicado" ? "success" : "neutral"}>{item.status}</Badge>
          {can("news", "edit") && <button className={`feature-button ${item.featured ? "featured" : ""}`} onClick={() => feature(item)}><Star size={16} fill={item.featured ? "currentColor" : "none"} /> {item.featured ? "Principal" : "Destacar"}</button>}
          {can("news", "edit") && <Link className="table-action" to={`/noticias/${item.id}/editar`}>Editar →</Link>}
          {can("news", "delete") && <button type="button" className="icon-button danger" aria-label={`Eliminar ${item.title}`} onClick={() => remove(item)}><Trash2 size={16} /></button>}
        </div></article>)}</div> : <Empty />}
    </Panel>
  </>;
}
