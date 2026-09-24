import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  ContactRound,
  Globe2,
  LayoutDashboard,
  Menu,
  Monitor,
  Newspaper,
  Settings2,
  Smartphone,
  X,
} from "lucide-react";

const groups = [
  {
    title: "ESPAÇO DE TRABALHO",
    links: [
      { to: "/", label: "Visão geral", icon: LayoutDashboard },
      { to: "/reunioes", label: "Reuniões e agenda", icon: CalendarDays },
      { to: "/clientes", label: "Clientes e projetos", icon: ContactRound },
    ],
  },
  {
    title: "CONTEÚDO DO SITE",
    links: [
      { to: "/portfolio/websites", label: "Portfólio Web", icon: Globe2 },
      { to: "/portfolio/mobile", label: "Portfólio Mobile", icon: Smartphone },
      { to: "/portfolio/pc", label: "Portfólio PC", icon: Monitor },
      { to: "/noticias", label: "Notícias", icon: Newspaper },
    ],
  },
  {
    title: "EMPRESA",
    links: [
      { to: "/gestao", label: "Gestão financeira", icon: ChartNoAxesCombined },
      { to: "/configuracoes", label: "Contactos e canais", icon: Settings2 },
    ],
  },
];

export default function Shell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const current = groups
    .flatMap((group) => group.links)
    .find((link) => link.to === location.pathname);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-top">
          <NavLink to="/" className="logo" onClick={() => setOpen(false)}>
            <span className="logo-cloud">☁</span>
            <span>
              SIRUS <em>CLOUD</em>
              <small>ADMIN SPACE</small>
            </span>
          </NavLink>
          <button
            className="icon-button mobile-only"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-chip">
          <span className="workspace-avatar">S</span>
          <span>
            <b>Sirus Cloud</b>
            <small>Workspace principal</small>
          </span>
          <ChevronDown size={15} />
        </div>
        <nav aria-label="Navegação principal">
          {groups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-caption">{group.title}</div>
              {group.links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  end
                  to={to}
                  key={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <CircleHelp size={19} />
            <b>Uma base para crescer.</b>
            <p>Estrutura pronta para conectar à API e publicar o conteúdo.</p>
          </div>
          <a
            className="sidebar-site"
            href="https://www.sirus.cloud/"
            target="_blank"
            rel="noreferrer"
          >
            Ver website <ArrowUpRight size={16} />
          </a>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-only"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb">
              Sirus Cloud <span>/</span>{" "}
              <strong>{current?.label || "Painel"}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="demo-indicator">
              <span /> Modo demonstração
            </span>
            <NavLink
              to="/reunioes"
              className="icon-button notification"
              title="Reuniões"
            >
              <Bell size={19} />
              <i />
            </NavLink>
            <div className="user-chip">
              <span>ML</span>
              <div>
                <b>Administrador</b>
                <small>Sirus Cloud</small>
              </div>
            </div>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
        <footer className="footer">
          SIRUS CLOUD <span>·</span> Painel administrativo{" "}
          <span className="footer-right">Versão inicial · frontend</span>
        </footer>
      </div>
    </div>
  );
}
