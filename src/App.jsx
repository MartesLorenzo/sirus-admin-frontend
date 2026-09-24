import { createContext, useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import { useStoredState } from "./lib/storage";
import {
  demoAvailability,
  demoBookings,
  demoClients,
  demoNews,
  demoPortfolio,
  demoSettings,
  demoTransactions,
} from "./data/demo";
import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import Clients from "./pages/Clients";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

function AdminProvider({ children }) {
  // A mesma estrutura pode ser alimentada por endpoints REST sem alterar as páginas.
  const [bookings, setBookings] = useStoredState("bookings", demoBookings);
  const [availability, setAvailability] = useStoredState(
    "availability",
    demoAvailability,
  );
  const [clients, setClients] = useStoredState("clients", demoClients);
  const [portfolio, setPortfolio] = useStoredState("portfolio", demoPortfolio);
  const [news, setNews] = useStoredState("news", demoNews);
  const [transactions, setTransactions] = useStoredState(
    "transactions",
    demoTransactions,
  );
  const [settings, setSettings] = useStoredState("settings", demoSettings);
  return (
    <AdminContext.Provider
      value={{
        bookings,
        setBookings,
        availability,
        setAvailability,
        clients,
        setClients,
        portfolio,
        setPortfolio,
        news,
        setNews,
        transactions,
        setTransactions,
        settings,
        setSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="reunioes" element={<Meetings />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="portfolio/:category" element={<Portfolio />} />
            <Route path="noticias" element={<News />} />
            <Route path="gestao" element={<Finance />} />
            <Route path="configuracoes" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
