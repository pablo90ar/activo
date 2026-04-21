import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { getSettings, getLogoUrl } from "../services/settingsService";

const FALLBACK_LOGO = "/favicon.png";

const Ctx = createContext({ systemName: "Activo", showClock: true, repsUnit: "rp", weightUnit: "kg", trainingTitle: "Entrenamiento", logoUrl: FALLBACK_LOGO, refresh: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [systemName, setSystemName] = useState("Activo");
  const [showClock, setShowClock] = useState(true);
  const [repsUnit, setRepsUnit] = useState("rp");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [trainingTitle, setTrainingTitle] = useState("Entrenamiento");
  const [logoUrl, setLogoUrl] = useState(FALLBACK_LOGO);

  const refresh = useCallback(() => {
    getSettings().then((s) => {
      setSystemName((s.systemName as string) || "Activo");
      setShowClock(s.showClock !== false);
      setRepsUnit((s.repsUnit as string) || "rp");
      setWeightUnit((s.weightUnit as string) || "kg");
      setTrainingTitle((s.trainingTitle as string) || "Entrenamiento");
    });
    const url = getLogoUrl();
    fetch(url, { method: "HEAD" })
      .then((r) => setLogoUrl(r.ok ? `${url}?v=${Date.now()}` : FALLBACK_LOGO))
      .catch(() => setLogoUrl(FALLBACK_LOGO));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (link) link.href = logoUrl;
  }, [logoUrl]);

  return <Ctx.Provider value={{ systemName, showClock, repsUnit, weightUnit, trainingTitle, logoUrl, refresh }}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);
