import { ImagePlus, Trash2 } from "lucide-react";
import { Field } from "./UI";

// Um registo pode guardar várias URLs; upload real irá usar armazenamento de ficheiros na API.
export default function ImageFields({ images, onChange }) {
  return (
    <div className="image-fields">
      <div className="image-fields-title">
        <b>Galeria de imagens</b>
        <span>{images.length} imagens</span>
      </div>
      {images.map((url, index) => (
        <div className="image-entry" key={index}>
          <span className="image-thumb">
            {url ? (
              <img
                src={url}
                alt=""
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <ImagePlus size={21} />
            )}
          </span>
          <Field label={`Imagem ${index + 1} · URL`}>
            <input
              type="url"
              value={url}
              onChange={(event) =>
                onChange(
                  images.map((item, position) =>
                    position === index ? event.target.value : item,
                  ),
                )
              }
              placeholder="https://…/imagem.jpg"
            />
          </Field>
          <button
            type="button"
            className="icon-button danger"
            onClick={() =>
              onChange(images.filter((_, position) => position !== index))
            }
            aria-label="Remover imagem"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button subtle"
        onClick={() => onChange([...images, ""])}
      >
        <ImagePlus size={16} /> Adicionar imagem
      </button>
      <small className="field-note">
        Nesta fase, usa endereços públicos de imagem. O upload de ficheiros virá
        com o backend.
      </small>
    </div>
  );
}
