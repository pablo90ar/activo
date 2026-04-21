import { useState, useEffect } from "react";
import { getHistorySnapshot, type SnapshotSet } from "../services/historyService";
import { useSettings } from "../hooks/useSettings";
import Modal from "./Modal";

interface Props {
  historyId: string;
  title: string;
  onClose: () => void;
}

export default function HistorySnapshotModal({ historyId, title, onClose }: Props) {
  const { repsUnit, weightUnit } = useSettings();
  const [sets, setSets] = useState<SnapshotSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistorySnapshot(historyId)
      .then(setSets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [historyId]);

  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-md">
      <div className="p-4 max-h-[70vh] overflow-y-auto">
        {loading ? (
          <p className="text-center text-brand-olive">Cargando...</p>
        ) : sets.length === 0 ? (
          <p className="text-center text-brand-olive italic">Sin datos de ejercicios para este registro</p>
        ) : (
          <div className="space-y-2">
            {sets.map((set, si) => (
              <div key={si} className="bg-brand-cream/40 rounded-lg p-2">
                {set.is_circuit === 1 && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-brand-action text-white px-2 py-0.5 rounded-full font-medium">CIRCUITO</span>
                    <span className="text-xs text-brand-olive">
                      <span className="text-base font-bold">{set.work_time}</span> trabajo / <span className="text-base font-bold">{set.rest_time}</span> descanso
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex items-center shrink-0">
                    <span className="text-xl font-bold text-brand-olive">{set.iterations}</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    {set.exercises.map((ex, ei) => (
                      <div key={ei} className="flex items-center text-sm text-brand-dark bg-white/60 rounded-md p-1.5 min-w-0">
                        <span className="uppercase font-bold text-lg min-w-0 flex-1">{ex.exercise_name}</span>
                        {!set.is_circuit && ex.repetitions > 0 && (
                          <span className="text-lg font-bold text-brand-dark text-right shrink-0 ml-2">
                            {ex.repetitions}<span className="text-sm font-normal text-brand-muted">{repsUnit}</span>
                          </span>
                        )}
                        {ex.weight > 0 && (
                          <span className="text-lg font-bold text-brand-dark text-right shrink-0 ml-2">
                            {ex.weight}<span className="text-sm font-normal text-brand-muted">{weightUnit}</span>
                          </span>
                        )}
                        {ex.repetitions === 0 && ex.weight === 0 && ex.other_text && (
                          <span className="text-lg font-bold text-brand-dark text-right shrink-0 ml-2">{ex.other_text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
