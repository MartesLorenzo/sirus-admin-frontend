import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";

const DialogContext = createContext(null);
export const useSystemDialog = () => useContext(DialogContext);

export function SystemDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);
  const focus = useRef(null);
  function close(answer) {
    resolver.current?.(answer);
    resolver.current = null;
    setDialog(null);
  }
  function open(type, message) {
    return new Promise((resolve) => {
      resolver.current?.(false);
      resolver.current = resolve;
      setDialog({ type, message });
    });
  }
  useEffect(() => {
    if (!dialog) return;
    focus.current?.focus();
    const onKey = (event) => { if (event.key === "Escape") close(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);
  return <DialogContext.Provider value={{ notice: (message) => open("notice", message), confirm: (message) => open("confirm", message) }}>
    {children}
    {dialog && <div className="system-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(false); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="system-dialog-title" aria-describedby="system-dialog-message" className="system-dialog">
        <span className="system-dialog-icon"><AlertCircle size={22} /></span>
        <h2 id="system-dialog-title">{dialog.type === "confirm" ? "Confirmar ação" : "Atenção"}</h2>
        <p id="system-dialog-message">{dialog.message}</p>
        <div className="system-dialog-actions">{dialog.type === "confirm" && <button ref={focus} className="button subtle" onClick={() => close(false)}>Cancelar</button>}
          <button ref={dialog.type === "notice" ? focus : undefined} className="button primary" onClick={() => close(true)}>{dialog.type === "confirm" ? "Confirmar" : "Entendi"}</button>
        </div>
      </section>
    </div>}
  </DialogContext.Provider>;
}
