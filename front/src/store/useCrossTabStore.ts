import { useSyncExternalStore } from "react";
import {
  getState,
  setState,
  subscribe,
  type SharedState,
} from "./crossTabStore";

export function useCrossTabStore(): [
  SharedState,
  (updater: (prev: SharedState) => Partial<SharedState>) => void,
] {
  const state = useSyncExternalStore(subscribe, getState);
  return [state, setState];
}
