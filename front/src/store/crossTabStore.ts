const STORAGE_KEY = "activo_shared_state";
const CHANNEL_NAME = "activo_sync";

export interface UIState {
  navbarPinned: boolean;
}

export interface NewTraineeForm {
  name: string;
  document: string;
  birth_date: string;
  gender: boolean;
  goal: string;
  color: string;
}

export interface ActiveWorkout {
  trainee_id: string;
  name: string;
  color: string;
}

export interface SharedState {
  ui: UIState;
  newTrainee: NewTraineeForm | null;
  traineeEditor: Record<string, unknown>;
  routineEditor: Record<string, unknown>;
  activeWorkouts: ActiveWorkout[];
}

const DEFAULT_STATE: SharedState = {
  ui: { navbarPinned: false },
  newTrainee: null,
  traineeEditor: {},
  routineEditor: {},
  activeWorkouts: [],
};

type Listener = (state: SharedState) => void;

const listeners = new Set<Listener>();
const channel = new BroadcastChannel(CHANNEL_NAME);

function load(): SharedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
    if (!Array.isArray(parsed.activeWorkouts)) parsed.activeWorkouts = [];
    return parsed;
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function save(state: SharedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let cached: SharedState = load();

function notify(state: SharedState) {
  cached = state;
  listeners.forEach((fn) => fn(state));
}

channel.onmessage = (e: MessageEvent<SharedState>) => {
  notify(e.data);
};

export function getState(): SharedState {
  return cached;
}

export function setState(updater: (prev: SharedState) => Partial<SharedState>) {
  const prev = cached;
  const next = { ...prev, ...updater(prev) };
  save(next);
  notify(next);
  channel.postMessage(next);
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
