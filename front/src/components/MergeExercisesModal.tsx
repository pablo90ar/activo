import { useState, useEffect } from "react";
import { getExercises, mergeExercises } from "../services/exerciseService";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";

interface Exercise {
  exercise_id: string;
  name: string;
}

interface Props {
  onClose: () => void;
  onMerged: () => void;
}

export default function MergeExercisesModal({ onClose, onMerged }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceIds, setSourceIds] = useState<string[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const [merging, setMerging] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    getExercises()
      .then(setExercises)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSource = (id: string) => {
    setSourceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
    if (targetId === id) setTargetId(null);
  };

  const targetOptions = exercises.filter((e) => !sourceIds.includes(e.exercise_id));
  const filteredSource = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredTarget = targetOptions.filter((e) =>
    e.name.toLowerCase().includes(targetSearch.toLowerCase()),
  );

  const handleMerge = async () => {
    if (!targetId || sourceIds.length === 0) return;
    setMerging(true);
    try {
      await mergeExercises(sourceIds, targetId);
      onMerged();
    } catch {
      alert("Error al unificar");
    } finally {
      setMerging(false);
      setConfirm(false);
    }
  };

  const sourceNames = sourceIds.map((id) => exercises.find((e) => e.exercise_id === id)?.name).filter(Boolean);
  const targetName = exercises.find((e) => e.exercise_id === targetId)?.name;

  return (
    <>
      <Modal title="Unificar ejercicios" onClose={onClose} maxWidth="max-w-lg">
        <div className="p-5 flex flex-col gap-4">
          {loading ? (
            <p className="text-center text-brand-olive">Cargando...</p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">
                  Ejercicios a unificar
                </label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-1.5 mb-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage"
                />
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredSource.map((e) => (
                    <label
                      key={e.exercise_id}
                      className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-brand-cream/60 transition text-sm ${sourceIds.includes(e.exercise_id) ? "bg-red-50" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={sourceIds.includes(e.exercise_id)}
                        onChange={() => toggleSource(e.exercise_id)}
                        className="accent-red-600"
                      />
                      <span className="truncate">{e.name}</span>
                    </label>
                  ))}
                </div>
                {sourceIds.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">{sourceIds.length} seleccionado{sourceIds.length > 1 ? "s" : ""}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">
                  Ejercicio destino (se conservará)
                </label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={targetSearch}
                  onChange={(e) => setTargetSearch(e.target.value)}
                  className="w-full px-3 py-1.5 mb-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage"
                />
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredTarget.map((e) => (
                    <label
                      key={e.exercise_id}
                      className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-brand-cream/60 transition text-sm ${targetId === e.exercise_id ? "bg-green-50" : ""}`}
                    >
                      <input
                        type="radio"
                        name="target"
                        checked={targetId === e.exercise_id}
                        onChange={() => setTargetId(e.exercise_id)}
                        className="accent-brand-action"
                      />
                      <span className="truncate">{e.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setConfirm(true)}
                disabled={sourceIds.length === 0 || !targetId}
                className="w-full py-2.5 bg-brand-action text-white rounded-lg font-medium hover:bg-brand-action-hover transition disabled:opacity-50"
              >
                Unificar
              </button>
            </>
          )}
        </div>
      </Modal>

      {confirm && (
        <ConfirmDialog
          title="¿Confirmar unificación?"
          message={`${sourceNames.join(", ")} → ${targetName}. Las referencias en rutinas se reasignarán al ejercicio destino. Esta acción no se puede deshacer.`}
          onConfirm={handleMerge}
          onCancel={() => setConfirm(false)}
          loading={merging}
        />
      )}
    </>
  );
}
