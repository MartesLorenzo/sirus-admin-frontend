import { useEffect, useState } from "react";

// Estado local para experimentar os fluxos do painel. A API substituirá esta camada.
export function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(`sirus-admin:${key}`);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`sirus-admin:${key}`, JSON.stringify(value));
    } catch {
      /* A interface continua utilizável se o armazenamento estiver cheio. */
    }
  }, [key, value]);

  return [value, setValue];
}

export const id = () => crypto.randomUUID();
export const formatDate = (value) =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
export const money = (value) =>
  new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
export const elapsedDays = (value) =>
  value
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(`${value}T00:00:00`).getTime()) / 86400000,
        ),
      )
    : 0;
export const today = () => new Date().toISOString().slice(0, 10);

// Só três itens por coleção podem surgir em destaque no site público.
export function toggleFeatured(items, setItems, itemId, onLimit = () => {}) {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) return;
  if (!item.featured && items.filter((entry) => entry.featured).length >= 3) {
    onLimit("Podes destacar até 3 itens nesta secção. Retira um destaque primeiro.");
    return;
  }
  setItems(
    items.map((entry) =>
      entry.id === itemId ? { ...entry, featured: !entry.featured } : entry,
    ),
  );
}
