import { useState } from "react";
import {
  ArrowUpRight,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useAdmin } from "../App";
import { Field, PageIntro, Panel } from "../components/UI";

export default function Settings() {
  const { settings, setSettings, can } = useAdmin();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const change = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
    setSaved(false);
  };
  return (
    <>
      <PageIntro
        eyebrow="EMPRESA / DEFINIÇÕES"
        title="Contactos & canais"
        description="Organiza os números e endereços que mais tarde serão publicados e usados nas ações do website."
        action={
          can("settings", "edit") && <button className="button primary" type="submit" form="settings-form">
            <Save size={16} /> Guardar contactos
          </button>
        }
      />
      <div className="two-column settings-columns">
        <Panel title="Canais de contacto">
          <form
            id="settings-form"
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              setSettings(form);
              setSaved(true);
            }}
          >
            <div className="settings-group">
              <span className="settings-group-icon">
                <Phone size={19} />
              </span>
              <div>
                <b>Chamadas telefónicas</b>
                <p>Números apresentados nos cartões e ações de chamada.</p>
              </div>
            </div>
            <div className="form-grid">
              <Field label="Número principal">
                <input
                  type="tel"
                  value={form.callPrimary}
                  onChange={change("callPrimary")}
                />
              </Field>
              <Field label="Número secundário">
                <input
                  type="tel"
                  value={form.callSecondary}
                  onChange={change("callSecondary")}
                />
              </Field>
            </div>
            <div className="settings-group">
              <span className="settings-group-icon">
                <MessageCircle size={19} />
              </span>
              <div>
                <b>Redirecionamento WhatsApp</b>
                <p>Destino para iniciar uma conversa a partir do site.</p>
              </div>
            </div>
            <Field label="Número de WhatsApp">
              <input
                type="tel"
                value={form.whatsapp}
                onChange={change("whatsapp")}
              />
            </Field>
            <div className="settings-group">
              <span className="settings-group-icon">
                <Mail size={19} />
              </span>
              <div>
                <b>Email e localização</b>
                <p>Informações institucionais.</p>
              </div>
            </div>
            <Field label="Email geral">
              <input
                type="email"
                value={form.generalEmail}
                onChange={change("generalEmail")}
              />
            </Field>
            <Field label="Email de projetos"><input type="email" value={form.projectEmail || "projetos@sirus.cloud"} onChange={change("projectEmail")} /></Field>
            <Field label="Email de suporte"><input type="email" value={form.supportEmail || "suporte@sirus.cloud"} onChange={change("supportEmail")} /></Field>
            <Field label="Morada">
              <input value={form.location} onChange={change("location")} />
            </Field>
            <button type="submit" className="button primary">
              <Save size={16} /> Guardar alterações
            </button>
            {saved && (
              <p className="save-message" role="status">
                Alterações guardadas nesta demonstração.
              </p>
            )}
          </form>
        </Panel>
        <div className="settings-side">
          <div className="settings-preview">
            <span className="eyebrow">PRÉ-VISUALIZAÇÃO DOS CONTACTOS</span>
            <h2>
              Estamos aqui para
              <br />
              <em>conversar.</em>
            </h2>
            <div>
              <Phone size={16} /> {form.callPrimary || "Número principal"}
            </div>
            <div>
              <MessageCircle size={16} /> {form.whatsapp || "WhatsApp"}
            </div>
            <div>
              <Mail size={16} /> {form.generalEmail || "Email"}
            </div>
            <div>
              <MapPin size={16} /> {form.location || "Localização"}
            </div>
          </div>
          <div className="note-box">
            <ShieldCheck size={20} />
            <span>
              Os contactos guardados são publicados no website através da API.
            </span>
          </div>
          <a
            href="https://www.sirus.cloud/"
            target="_blank"
            rel="noreferrer"
            className="site-preview-link"
          >
            <Globe2 size={17} /> Abrir website público{" "}
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </>
  );
}
