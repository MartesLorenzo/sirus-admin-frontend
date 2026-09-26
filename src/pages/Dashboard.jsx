import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  Clock3,
  FolderKanban,
  Plus,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../App";
import { Badge, Empty, PageIntro, Panel } from "../components/UI";
import { elapsedDays, formatDate, money } from "../lib/storage";

export default function Dashboard() {
  const { bookings, clients, projects, portfolio, news } = useAdmin();
  const navigate = useNavigate();
  const pending = bookings.filter(
    (item) => item.status === "Por confirmar",
  ).length;
  const active = clients.filter((item) => item.status === "Em aberto").length;
  const total = projects.reduce(
    (sum, item) => sum + Number(item.budget || 0),
    0,
  );
  const nextBookings = [...bookings]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 4);
  return (
    <>
      <PageIntro
        eyebrow={new Date()
          .toLocaleDateString("pt-PT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
          .toUpperCase()}
        title={
          <>
            Bom trabalho, <span className="text-purple">Sirus Cloud.</span>
          </>
        }
        description="Uma visão clara do que precisa da tua atenção hoje."
        action={
          <Link to="/reunioes" className="button primary">
            <Plus size={16} /> Gerir agenda
          </Link>
        }
      />
      <div className="hero-banner">
        <div>
          <span className="hero-kicker">
            CENTRO DE OPERAÇÕES <i />
          </span>
          <h2>
            Os teus projetos.
            <br />
            <em>O próximo passo.</em>
          </h2>
          <p>Da primeira conversa à entrega final, tudo à vista.</p>
          <Link to="/clientes" className="banner-link">
            Explorar clientes <ArrowRight size={17} />
          </Link>
        </div>
        <div className="orbit-art">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="orbit-core"><img width={110} src="logo_1.png" alt="" /></span>
          <span className="orbit-label top">IDEIAS</span>
          <span className="orbit-label bottom">RESULTADOS</span>
        </div>
        <span className="banner-index">S / 01</span>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon violet">
            <CalendarClock size={19} />
          </div>
          <span>Reuniões por confirmar</span>
          <b>{String(pending).padStart(2, "0")}</b>
          <small>
            <Clock3 size={13} /> Pedidos à espera de resposta
          </small>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <FolderKanban size={19} />
          </div>
          <span>Projetos em aberto</span>
          <b>{String(active).padStart(2, "0")}</b>
          <small>
            <TrendingUp size={13} /> Em acompanhamento
          </small>
        </div>
        <div className="stat-card">
          <div className="stat-icon peach">
            <Users size={19} />
          </div>
          <span>Clientes no radar</span>
          <b>{String(clients.length).padStart(2, "0")}</b>
          <small>
            <CircleCheck size={13} /> Em todas as etapas
          </small>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Wallet size={19} />
          </div>
          <span>Orçamentos registados</span>
          <b className="money-stat">{money(total)}</b>
          <small>
            <TrendingUp size={13} /> Valor previsto, não recebido
          </small>
        </div>
      </div>
      <div className="dashboard-columns">
        <Panel
          title="Próximas reuniões"
          action={
            <Link to="/reunioes" className="text-link">
              Ver agenda <ArrowRight size={15} />
            </Link>
          }
        >
          {nextBookings.length ? (
            <div className="meeting-list">
              {nextBookings.map((item) => (
                <button
                  className="meeting-row"
                  key={item.id}
                  onClick={() =>
                    navigate(
                      `/reunioes?codigo=${encodeURIComponent(item.code)}`,
                    )
                  }
                >
                  <span className="date-tile">
                    <b>{item.date.slice(-2)}</b>
                    <small>
                      {new Date(item.date + "T12:00:00").toLocaleDateString(
                        "pt-PT",
                        { month: "short" },
                      )}
                    </small>
                  </span>
                  <span className="row-primary">
                    <b>{item.name}</b>
                    <small>{item.projectName || item.service}</small>
                  </span>
                  <span className="row-end">
                    <strong>{item.time}</strong>
                    <small>{item.code}</small>
                  </span>
                  <Badge
                    tone={item.status === "Confirmada" ? "success" : "warning"}
                  >
                    {item.status}
                  </Badge>
                </button>
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </Panel>
        <Panel
          title="Projetos em curso"
          action={
            <Link to="/projetos" className="text-link">
              Ver projetos <ArrowRight size={15} />
            </Link>
          }
        >
          {projects.filter(
            (item) => item.status !== "Concluído",
          ).length ? (
            projects
              .filter((item) => item.status !== "Concluído")
              .map((item) => (
                <div className="progress-row" key={item.id}>
                  <div className="progress-info">
                    <span className="progress-avatar">{item.title[0]}</span>
                    <div>
                      <b>{item.title}</b>
                      <small>
                        {item.client?.name || "Projeto interno"} · {elapsedDays(item.startDate)} dias
                        decorridos
                      </small>
                    </div>
                    <strong>{item.progress}%</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${item.progress}%` }} />
                  </div>
                  <small>Entrega prevista: {formatDate(item.deadline)}</small>
                </div>
              ))
          ) : (
            <Empty />
          )}
        </Panel>
      </div>
      <div className="dashboard-bottom">
        <div className="mini-summary">
          <span className="eyebrow">CONTEÚDO</span>
          <b>{portfolio.length} trabalhos</b>
          <p>Nas três categorias do portfólio.</p>
          <Link to="/portfolio/websites">
            Gerir trabalhos <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mini-summary">
          <span className="eyebrow">EDITORIAL</span>
          <b>{news.length} notícias</b>
          <p>Histórias prontas para desenvolver.</p>
          <Link to="/noticias">
            Abrir editorial <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mini-summary dark">
          <span className="eyebrow">PRÓXIMO PASSO</span>
          <b>O detalhe faz a diferença.</b>
          <p>Encontra uma marcação pelo código recebido.</p>
          <Link to="/reunioes">
            Pesquisar código <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </>
  );
}
