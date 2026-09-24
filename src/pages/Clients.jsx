import { useState } from "react";
import { ArrowUpRight, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useAdmin } from "../App";
import {
  Badge,
  Empty,
  Field,
  FormActions,
  Modal,
  PageIntro,
  Panel,
} from "../components/UI";
import { elapsedDays, formatDate, id, money, today } from "../lib/storage";

const stages = [
  "Todos",
  "Potencial",
  "Em aberto",
  "Por responder",
  "A acompanhar",
  "Finalizado",
];
const blank = {
  name: "",
  contact: "",
  phone: "",
  email: "",
  status: "Potencial",
  origin: "",
  bookingCode: "",
  notes: "",
  project: "",
  startDate: "",
  deadline: "",
  progress: 0,
  budget: "",
};

export default function Clients() {
  const { clients, setClients, bookings } = useAdmin();
  const [stage, setStage] = useState("Todos");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const filtered = clients.filter(
    (client) =>
      (stage === "Todos" || client.status === stage) &&
      [
        client.name,
        client.contact,
        client.phone,
        client.project,
        client.bookingCode,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
  );
  const booking =
    editing && bookings.find((item) => item.code === form.bookingCode);

  function open(client) {
    setEditing(client || {});
    setForm(client ? { ...client } : { ...blank });
  }
  function save(event) {
    event.preventDefault();
    const item = {
      ...form,
      id: editing.id || id(),
      progress: Math.min(100, Math.max(0, Number(form.progress) || 0)),
      budget: Number(form.budget) || 0,
    };
    if (item.deadline && item.startDate && item.deadline < item.startDate)
      return window.alert("O prazo deve ser posterior à data de início.");
    setClients(
      editing.id
        ? clients.map((client) => (client.id === editing.id ? item : client))
        : [item, ...clients],
    );
    setEditing(null);
  }
  return (
    <>
      <PageIntro
        eyebrow="CRM / RELAÇÕES"
        title="Clientes & projetos"
        description="Organiza oportunidades, acompanha entregas e regressa aos clientes certos no momento certo."
        action={
          <button className="button primary" onClick={() => open()}>
            <Plus size={16} /> Novo cliente
          </button>
        }
      />
      <div className="stage-grid">
        {stages.slice(1).map((value) => (
          <button
            key={value}
            onClick={() => setStage(value)}
            className={`stage-card ${stage === value ? "active" : ""}`}
          >
            <span>{value}</span>
            <b>
              {String(
                clients.filter((client) => client.status === value).length,
              ).padStart(2, "0")}
            </b>
            <small>
              Ver clientes <ArrowUpRight size={13} />
            </small>
          </button>
        ))}
      </div>
      <Panel
        title="Base de clientes"
        action={<Badge>{filtered.length} registos</Badge>}
      >
        <div className="table-toolbar">
          <div className="searchbox">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nome, código, telefone ou projeto…"
              aria-label="Pesquisar clientes"
            />
          </div>
          <div className="filter-select">
            <SlidersHorizontal size={16} />
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value)}
              aria-label="Filtrar estado"
            >
              {stages.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CLIENTE</th>
                <th>PROJETO / PRAZO</th>
                <th>PROGRESSO</th>
                <th>ESTADO</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id}>
                  <td>
                    <b>{client.name}</b>
                    <small>
                      {client.contact} · {client.phone}
                    </small>
                  </td>
                  <td>
                    <b>{client.project || "Sem projeto"}</b>
                    <small>
                      {client.deadline
                        ? `Entrega: ${formatDate(client.deadline)} · ${elapsedDays(client.startDate)} dias decorridos`
                        : "Prazo por definir"}
                    </small>
                  </td>
                  <td>
                    <span className="mini-progress">
                      <span style={{ width: `${client.progress}%` }} />
                    </span>
                    <small>{client.progress}% concluído</small>
                  </td>
                  <td>
                    <Badge
                      tone={
                        client.status === "Finalizado"
                          ? "success"
                          : client.status === "Por responder"
                            ? "warning"
                            : ""
                      }
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="table-action"
                      onClick={() => open(client)}
                    >
                      Abrir →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <Empty>Nenhum cliente corresponde aos filtros.</Empty>
          )}
        </div>
      </Panel>
      {editing && (
        <Modal
          title={editing.id ? "Ficha de cliente" : "Novo cliente"}
          onClose={() => setEditing(null)}
          wide
        >
          <form onSubmit={save} className="form-stack">
            <div className="form-section-title">01 / IDENTIFICAÇÃO</div>
            <div className="form-grid">
              <Field label="Empresa ou cliente">
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </Field>
              <Field label="Pessoa de contacto">
                <input
                  value={form.contact}
                  onChange={(event) =>
                    setForm({ ...form, contact: event.target.value })
                  }
                />
              </Field>
              <Field label="WhatsApp / telefone">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </Field>
              <Field label="Código da reunião">
                <input
                  value={form.bookingCode}
                  onChange={(event) =>
                    setForm({ ...form, bookingCode: event.target.value })
                  }
                  placeholder="SC-260924-4821"
                />
              </Field>
              <Field label="Origem do contacto">
                <input
                  value={form.origin}
                  onChange={(event) =>
                    setForm({ ...form, origin: event.target.value })
                  }
                  placeholder="Instagram, indicação…"
                />
              </Field>
            </div>
            {booking && (
              <div className="linked-booking">
                Reunião associada: <b>{booking.projectName}</b> ·{" "}
                {formatDate(booking.date)} às {booking.time}
              </div>
            )}
            <div className="form-section-title">02 / ACOMPANHAMENTO</div>
            <div className="form-grid">
              <Field label="Etapa">
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                >
                  {stages.slice(1).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Nome do projeto">
                <input
                  value={form.project}
                  onChange={(event) =>
                    setForm({ ...form, project: event.target.value })
                  }
                />
              </Field>
              <Field label="Início do projeto">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm({ ...form, startDate: event.target.value })
                  }
                />
              </Field>
              <Field label="Prazo de conclusão">
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(event) =>
                    setForm({ ...form, deadline: event.target.value })
                  }
                />
              </Field>
              <Field label="Progresso: {form.progress}%">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(event) =>
                    setForm({ ...form, progress: event.target.value })
                  }
                />
              </Field>
              <Field
                label="Orçamento do projeto (Kz)"
                hint="Valor previsto; a gestão apresenta este valor separadamente do dinheiro recebido."
              >
                <input
                  type="number"
                  min="0"
                  value={form.budget}
                  onChange={(event) =>
                    setForm({ ...form, budget: event.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Notas de acompanhamento">
              <textarea
                rows="3"
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
                placeholder="Próximo contacto, necessidades, oportunidade de venda…"
              />
            </Field>
            {editing.id && (
              <div className="linked-booking">
                Decorreram <b>{elapsedDays(form.startDate)} dias</b> desde o
                início. Orçamento previsto: <b>{money(form.budget)}</b>.
              </div>
            )}
            <FormActions
              onCancel={() => setEditing(null)}
              submit={editing.id ? "Guardar cliente" : "Criar cliente"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}
