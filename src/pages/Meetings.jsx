import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, Clock3, Copy, Plus, Search, Trash2 } from "lucide-react";
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
import { formatDate, id } from "../lib/storage";

export default function Meetings() {
  const { bookings, setBookings, availability, setAvailability } = useAdmin();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("codigo") || "");
  const [tab, setTab] = useState("pedidos");
  const [date, setDate] = useState("");
  const [times, setTimes] = useState("09:00, 10:30, 15:00");
  const [selected, setSelected] = useState(null);
  const matches = bookings.filter((item) =>
    [item.code, item.name, item.company, item.projectName].some((text) =>
      String(text || "")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    ),
  );

  function addDay(event) {
    event.preventDefault();
    const slots = [
      ...new Set(
        times
          .split(",")
          .map((time) => time.trim())
          .filter((time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)),
      ),
    ].sort();
    if (!slots.length || availability.some((item) => item.date === date))
      return window.alert(
        "Escolhe uma data nova e horários válidos separados por vírgulas.",
      );
    setAvailability(
      [...availability, { id: id(), date, times: slots, enabled: true }].sort(
        (a, b) => a.date.localeCompare(b.date),
      ),
    );
    setDate("");
  }
  return (
    <>
      <PageIntro
        eyebrow="AGENDA / LEADS"
        title="Reuniões & disponibilidade"
        description="Consulta cada briefing pelo código da marcação e define os horários que queres disponibilizar."
        action={
          <button
            className="button primary"
            onClick={() => setTab("disponibilidade")}
          >
            <Plus size={16} /> Abrir horários
          </button>
        }
      />
      <div className="segmented">
        <button
          className={tab === "pedidos" ? "selected" : ""}
          onClick={() => setTab("pedidos")}
        >
          Pedidos de reunião <span>{bookings.length}</span>
        </button>
        <button
          className={tab === "disponibilidade" ? "selected" : ""}
          onClick={() => setTab("disponibilidade")}
        >
          Disponibilidade <span>{availability.length}</span>
        </button>
      </div>
      {tab === "pedidos" ? (
        <Panel
          title="Marcações recebidas"
          action={
            <Badge tone="warning">
              {bookings.filter((b) => b.status === "Por confirmar").length} por
              confirmar
            </Badge>
          }
        >
          <div className="searchbox">
            <Search size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar pelo código, nome ou projeto…"
              aria-label="Pesquisar marcações"
            />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>CLIENTE / PROJETO</th>
                  <th>CÓDIGO</th>
                  <th>DATA E HORA</th>
                  <th>ESTADO</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {matches.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <b>{item.name}</b>
                      <small>
                        {item.projectName || item.service} · {item.company}
                      </small>
                    </td>
                    <td>
                      <code>{item.code}</code>
                    </td>
                    <td>
                      <b>{formatDate(item.date)}</b>
                      <small>{item.time}</small>
                    </td>
                    <td>
                      <Badge
                        tone={
                          item.status === "Confirmada"
                            ? "success"
                            : item.status === "Cancelada"
                              ? "neutral"
                              : "warning"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="table-action"
                        onClick={() => setSelected(item)}
                      >
                        Ver briefing →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!matches.length && (
              <Empty>Nenhuma marcação corresponde à pesquisa.</Empty>
            )}
          </div>
        </Panel>
      ) : (
        <div className="two-column">
          <Panel title="Abrir um novo dia">
            <form className="form-stack" onSubmit={addDay}>
              <Field label="Data">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </Field>
              <Field
                label="Horários"
                hint="Separa os horários por vírgulas. Ex.: 09:00, 10:30, 15:00"
              >
                <input
                  value={times}
                  onChange={(event) => setTimes(event.target.value)}
                  required
                />
              </Field>
              <button className="button primary" type="submit">
                <Plus size={16} /> Adicionar disponibilidade
              </button>
            </form>
          </Panel>
          <Panel title="Datas disponíveis">
            {availability.length ? (
              availability.map((day) => (
                <div className="availability-row" key={day.id}>
                  <CalendarDays size={19} />
                  <div>
                    <b>{formatDate(day.date)}</b>
                    <small>{day.times.join(" · ")}</small>
                  </div>
                  <button
                    className="button subtle small"
                    onClick={() =>
                      setAvailability(
                        availability.map((item) =>
                          item.id === day.id
                            ? { ...item, enabled: !item.enabled }
                            : item,
                        ),
                      )
                    }
                  >
                    {day.enabled ? "Ativo" : "Pausado"}
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => {
                      if (window.confirm("Remover esta data?"))
                        setAvailability(
                          availability.filter((item) => item.id !== day.id),
                        );
                    }}
                    aria-label="Remover data"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <Empty />
            )}
          </Panel>
        </div>
      )}
      <div className="note-box">
        <Clock3 size={18} />
        <span>
          Os dados e horários desta versão são demonstrativos. A confirmação, o
          envio por WhatsApp e a ocupação automática de vagas dependem da
          ligação ao backend.
        </span>
      </div>
      {selected && (
        <Modal
          title="Briefing da reunião"
          onClose={() => setSelected(null)}
          wide
        >
          <div className="brief-header">
            <div>
              <span className="eyebrow">REFERÊNCIA DA MARCAÇÃO</span>
              <h3>{selected.code}</h3>
            </div>
            <button
              className="button subtle small"
              onClick={() => navigator.clipboard?.writeText(selected.code)}
            >
              <Copy size={15} /> Copiar código
            </button>
          </div>
          <div className="detail-grid">
            {[
              ["Cliente", selected.name],
              ["Empresa", selected.company],
              ["Contacto", selected.phone],
              ["Email", selected.email],
              ["Serviço", selected.service],
              ["Projeto", selected.projectName],
              [
                "Data e hora",
                `${formatDate(selected.date)} às ${selected.time}`,
              ],
              ["Cores desejadas", selected.colors],
            ].map(([label, value]) => (
              <div key={label}>
                <small>{label}</small>
                <b>{value || "—"}</b>
              </div>
            ))}
          </div>
          <div className="detail-description">
            <small>DESCRIÇÃO DO PROJETO</small>
            <p>{selected.description}</p>
          </div>
          <Field label="Estado da reunião">
            <select
              value={selected.status}
              onChange={(event) => {
                const status = event.target.value;
                setBookings(
                  bookings.map((item) =>
                    item.id === selected.id ? { ...item, status } : item,
                  ),
                );
                setSelected({ ...selected, status });
              }}
            >
              {["Por confirmar", "Confirmada", "Concluída", "Cancelada"].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
          </Field>
          <div className="form-actions">
            <button
              type="button"
              className="button primary"
              onClick={() => setSelected(null)}
            >
              Fechar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
