import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  ReceiptText,
  Wallet,
  Trash2,
} from "lucide-react";
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
import { formatDate, id, money, today } from "../lib/storage";

export default function Finance() {
  const { clients, projects, transactions, setTransactions, can } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    type: "Despesa",
    title: "",
    amount: "",
    date: today(),
    clientId: "",
  });
  const budgets = projects.reduce(
    (sum, item) => sum + Number(item.budget || 0),
    0,
  );
  const costs = transactions
    .filter((item) => item.type === "Despesa")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const gains = transactions
    .filter((item) => item.type === "Outro ganho")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  function save(event) {
    event.preventDefault();
    const item = { ...form, amount: Number(form.amount), id: editingId || id() };
    setTransactions(editingId ? transactions.map((entry) => entry.id === editingId ? item : entry) : [item, ...transactions]);
    setEditing(false); setEditingId(null);
    setForm({
      type: "Despesa",
      title: "",
      amount: "",
      date: today(),
      clientId: "",
    });
  }
  return (
    <>
      <PageIntro
        eyebrow="EMPRESA / GESTÃO"
        title="Gestão financeira"
        description="Acompanha orçamentos previstos, despesas registadas e outros ganhos num só lugar."
        action={
          can("finance", "create") && <button className="button primary" onClick={() => { setEditingId(null); setEditing(true); }}>
            <Plus size={16} /> Novo movimento
          </button>
        }
      />
      <div className="finance-summary">
        <div className="finance-card">
          <span className="finance-icon">
            <Wallet size={20} />
          </span>
          <small>ORÇAMENTOS PREVISTOS</small>
          <b>{money(budgets)}</b>
          <p>Somatório dos orçamentos dos projetos registados.</p>
        </div>
        <div className="finance-card">
          <span className="finance-icon cost">
            <ArrowDownRight size={20} />
          </span>
          <small>DESPESAS REGISTADAS</small>
          <b>{money(costs)}</b>
          <p>Saídas adicionadas nesta área.</p>
        </div>
        <div className="finance-card">
          <span className="finance-icon gain">
            <ArrowUpRight size={20} />
          </span>
          <small>OUTROS GANHOS</small>
          <b>{money(gains)}</b>
          <p>Ganhos registados fora dos orçamentos.</p>
        </div>
        <div className="finance-card dark">
          <span className="finance-icon">
            <ReceiptText size={20} />
          </span>
          <small>PROJEÇÃO</small>
          <b>{money(budgets + gains - costs)}</b>
          <p>Orçamentos + ganhos − despesas. Não representa caixa recebido.</p>
        </div>
      </div>
      <div className="two-column finance-columns">
        <Panel
          title="Movimentos"
          action={<Badge>{transactions.length} registos</Badge>}
        >
          {transactions.length ? (
            transactions.map((item) => (
              <div className="transaction" key={item.id}>
                <span
                  className={`transaction-icon ${item.type === "Despesa" ? "out" : "in"}`}
                >
                  {item.type === "Despesa" ? (
                    <ArrowDownRight size={18} />
                  ) : (
                    <ArrowUpRight size={18} />
                  )}
                </span>
                <div>
                  <b>{item.title}</b>
                  <small>
                    {formatDate(item.date)}
                    {item.clientId
                      ? ` · ${clients.find((c) => c.id === item.clientId)?.name || "Projeto"}`
                      : ""}
                  </small>
                </div>
                {can("finance", "edit") && <button type="button" className="table-action" onClick={() => { setForm({ type: item.type, title: item.title, amount: item.amount, date: item.date, clientId: item.clientId || "" }); setEditingId(item.id); setEditing(true); }}>Editar</button>}
                {can("finance", "delete") && <button className="icon-button danger" type="button" aria-label={`Eliminar ${item.title}`} onClick={() => { if (window.confirm(`Eliminar movimento ${item.title}?`)) setTransactions(transactions.filter((entry) => entry.id !== item.id)); }}><Trash2 size={16}/></button>}
                <strong
                  className={item.type === "Despesa" ? "expense" : "income"}
                >
                  {item.type === "Despesa" ? "−" : "+"} {money(item.amount)}
                </strong>
              </div>
            ))
          ) : (
            <Empty />
          )}
        </Panel>
        <Panel title="Orçamentos por projeto">
          {projects.filter((item) => item.budget).length ? (
            projects
              .filter((item) => item.budget)
              .map((item) => (
                <div className="budget-row" key={item.id}>
                  <div>
                    <b>{item.title}</b>
                    <small>
                      {item.client?.name || "Projeto interno"} · {item.status}
                    </small>
                  </div>
                  <strong>{money(item.budget)}</strong>
                </div>
              ))
          ) : (
            <Empty>Adiciona o orçamento na ficha de cada projeto.</Empty>
          )}
          <p className="aside-note">
            Orçamento é uma proposta prevista; depois será possível acompanhar
            faturação e pagamentos separadamente.
          </p>
        </Panel>
      </div>
      {editing && (
        <Modal title={editingId ? "Editar movimento" : "Novo movimento"} onClose={() => { setEditing(false); setEditingId(null); }}>
          <form className="form-stack" onSubmit={save}>
            <Field label="Tipo">
              <select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value })
                }
              >
                <option>Despesa</option>
                <option>Outro ganho</option>
              </select>
            </Field>
            <Field label="Descrição">
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </Field>
            <div className="form-grid">
              <Field label="Valor (Kz)">
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })
                  }
                />
              </Field>
              <Field label="Data">
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Cliente relacionado (opcional)">
              <select
                value={form.clientId}
                onChange={(event) =>
                  setForm({ ...form, clientId: event.target.value })
                }
              >
                <option value="">Sem cliente associado</option>
                {clients.map((client) => (
                  <option value={client.id} key={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </Field>
            <FormActions
              onCancel={() => setEditing(false)}
              submit={editingId ? "Guardar movimento" : "Registar movimento"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}
