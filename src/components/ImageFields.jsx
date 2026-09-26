import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { api } from "../lib/api";

function encodeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Falha na leitura da imagem."));
    reader.readAsDataURL(file);
  });
}

export default function ImageFields({ images = [], onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(event) {
    const files = [...event.target.files];
    event.target.value = "";
    if (!files.length) return;
    setBusy(true); setError("");
    const uploaded = [];
    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name}: o limite é 5 MB por imagem.`);
        const result = await api("/admin/uploads", { method: "POST", body: { data: await encodeImage(file) } });
        uploaded.push(result.url);
      }
      onChange([...images, ...uploaded]);
    } catch (reason) {
      if (uploaded.length) onChange([...images, ...uploaded]);
      setError(reason.message);
    } finally { setBusy(false); }
  }
  return <div className="image-fields">
    <div className="image-fields-title"><b>Galeria de imagens</b><span>{images.length} imagens</span></div>
    {images.map((url, index) => <div className="image-entry" key={`${url}-${index}`}><span className="image-thumb"><img src={url} alt={`Imagem ${index + 1}`} /></span><span className="uploaded-image-name">Imagem {index + 1}<small>{decodeURIComponent(url.split("/").pop())}</small></span><button type="button" className="icon-button danger" onClick={() => onChange(images.filter((_, position) => position !== index))} aria-label="Remover imagem"><Trash2 size={17} /></button></div>)}
    <label className="button subtle image-upload-button"><ImagePlus size={16} /> {busy ? "A carregar imagens…" : "Carregar imagens"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={busy} onChange={upload} /></label>
    <small className="field-note">JPG, PNG, WebP ou GIF até 5 MB por imagem. Os ficheiros recebem nomes únicos no servidor.</small>
    {error && <p role="alert" className="tracking-admin-error">{error}</p>}
  </div>;
}
