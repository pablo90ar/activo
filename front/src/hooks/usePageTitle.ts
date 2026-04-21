import { useEffect } from "react";
import { useSettings } from "./useSettings";

export function usePageTitle(title: string) {
  const { systemName } = useSettings();
  useEffect(() => { document.title = `${title} - ${systemName}`; }, [title, systemName]);
}
