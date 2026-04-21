import { useState, useEffect } from "react";
import { getTrainees } from "../services/traineeService";
import TraineeAvatar from "./TraineeAvatar";

interface Trainee {
  trainee_id: string;
  name: string;
  color: string;
  routine_name: string | null;
}

interface Props {
  excludeIds: Array<string>;
  onSelect: (trainee: Trainee) => void;
  onClose: () => void;
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function TraineePickerModal({ excludeIds, onSelect, onClose }: Props) {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrainees()
      .then(setTrainees)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = trainees.filter(
    (t) => !excludeIds.includes(t.trainee_id) && norm(t.name).includes(norm(search))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <input
            type="text"
            autoFocus
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#9AA595]"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading && <p className="text-center text-[#6C766B] py-4">Cargando...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-[#6C766B] py-4">Sin resultados</p>
          )}
          {filtered.map((t) => {
            const hasRoutine = !!t.routine_name;
            return (
              <button
                key={t.trainee_id}
                onClick={() => hasRoutine && onSelect(t)}
                disabled={!hasRoutine}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${hasRoutine ? "hover:bg-[#ECEBE2]" : "opacity-40 cursor-not-allowed"}`}
              >
                <TraineeAvatar traineeId={t.trainee_id} name={t.name} color={t.color} size="w-8 h-8" textSize="text-sm" />
                <span className="text-[#3A3F39] truncate">{t.name}</span>
                {!hasRoutine && <span className="text-xs text-[#6C766B] shrink-0">Sin rutina</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
