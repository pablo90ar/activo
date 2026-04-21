import { useState, useEffect, useCallback } from "react";
import {
  getRoutines,
  deleteRoutine,
  duplicateRoutine,
  getRoutineTrainees,
} from "../services/routineService";
import type { RoutineData } from "../types/api";
import { usePageTitle } from "../hooks/usePageTitle";
import { norm } from "../utils/string";
import ConfirmDialog from "../components/ConfirmDialog";
import RoutineModal from "../components/RoutineModal";
import PageHeader from "../components/PageHeader";
import ViewToggle from "../components/ViewToggle";
import ActionButton from "../components/ActionButton";
import Modal from "../components/Modal";

export default function Routines() {
  const [routines, setRoutines] = useState<RoutineData[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoutineData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [modal, setModal] = useState<{ routineId?: string } | null>(null);
  const [traineesModal, setTraineesModal] = useState<{
    name: string;
    trainees: { trainee_id: string; name: string; color: string }[];
  } | null>(null);

  usePageTitle("Rutinas");

  const fetchRoutines = useCallback(() => {
    setLoading(true);
    getRoutines()
      .then(setRoutines)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const filtered = routines
    .filter(
      (r) =>
        norm(r.name).includes(norm(search)) &&
        (showTemplates || r.is_template === 0),
    )
    .sort((a, b) => b.is_template - a.is_template);

  const handleDuplicate = async (r: RoutineData) => {
    setDuplicating(r.routine_id);
    try {
      await duplicateRoutine(r.routine_id);
      fetchRoutines();
    } catch {
      alert("Error al duplicar la rutina");
    } finally {
      setDuplicating(null);
    }
  };

  const openTrainees = async (r: RoutineData) => {
    if (r.trainee_count === 0) return;
    try {
      setTraineesModal({
        name: r.name,
        trainees: await getRoutineTrainees(r.routine_id),
      });
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRoutine(deleteTarget.routine_id);
      setDeleteTarget(null);
      fetchRoutines();
    } catch {
      alert("Error al eliminar la rutina");
    } finally {
      setDeleting(false);
    }
  };

  const TraineeCount = ({ r }: { r: RoutineData }) =>
    r.is_template ? (
      <span>Plantilla</span>
    ) : (
      <button
        onClick={(e) => { e.stopPropagation(); openTrainees(r); }}
        className={
          r.trainee_count > 0
            ? "underline hover:text-brand-dark cursor-pointer"
            : ""
        }
      >
        {r.trainee_count} {r.trainee_count === 1 ? "alumno" : "alumnos"}
      </button>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-cream to-brand-sage p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader title="Rutinas" />

        <div className="flex flex-col gap-3 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-brand-sage"
            />
            <button
              onClick={() => setModal({})}
              className="px-4 py-2 bg-brand-action text-white rounded-lg shadow font-medium hover:bg-brand-action-hover transition shrink-0"
            >
              + Nueva
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`px-4 py-2 rounded-lg shadow font-medium transition shrink-0 text-sm ${showTemplates ? "bg-brand-olive text-white" : "bg-white text-brand-olive hover:bg-gray-100"}`}
            >
              {showTemplates ? "Ocultar Plantillas" : "Mostrar Plantillas"}
            </button>
            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {loading && (
          <p className="text-center text-brand-dark text-lg">Cargando...</p>
        )}
        {error && (
          <p className="text-center text-red-700 text-lg">Error: {error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-brand-olive text-lg">
            No se encontraron rutinas.
          </p>
        )}

        {viewMode === "list" && filtered.length > 0 && (
          <div className="flex flex-col gap-2">
            {filtered.map((r) => (
              <div
                key={r.routine_id}
                onClick={() => setModal({ routineId: r.routine_id })}
                className={`rounded-lg px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition ${r.is_template ? "bg-white/50 border-2 border-dashed border-brand-sage hover:bg-white/70" : "bg-white shadow hover:bg-brand-cream/60"}`}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-brand-dark truncate">
                    {r.name}
                  </p>
                  <p className="text-sm text-brand-olive truncate">
                    {r.day_count} {r.day_count === 1 ? "día" : "días"} ·{" "}
                    <TraineeCount r={r} />
                  </p>
                </div>
                <div
                  className="flex gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ActionButton
                    icon={duplicating === r.routine_id ? "⏳" : "📋"}
                    variant="neutral"
                    disabled={duplicating === r.routine_id}
                    onClick={() => handleDuplicate(r)}
                    title="Duplicar"
                  />
                  <ActionButton
                    icon="🗑️"
                    variant="delete"
                    disabled={r.trainee_count > 0}
                    onClick={() => setDeleteTarget(r)}
                    title={r.trainee_count > 0 ? "Rutina en uso" : "Eliminar"}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "cards" && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((r) => (
              <div
                key={r.routine_id}
                onClick={() => setModal({ routineId: r.routine_id })}
                className={`rounded-xl overflow-hidden flex flex-col cursor-pointer transition ${r.is_template ? "bg-white/50 border-2 border-dashed border-brand-sage hover:bg-white/70" : "bg-white shadow-lg hover:bg-brand-cream/60"}`}
              >
                <div className="bg-brand-olive flex items-center justify-center py-6">
                  <span className="text-4xl font-bold text-white">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <p className="font-semibold text-brand-dark truncate text-center">
                    {r.name}
                  </p>
                  <p className="text-xs text-brand-olive text-center mt-1">
                    {r.day_count} {r.day_count === 1 ? "día" : "días"} ·{" "}
                    <TraineeCount r={r} />
                  </p>
                  <div
                    className="flex gap-2 mt-3 justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionButton
                      icon={duplicating === r.routine_id ? "⏳" : "📋"}
                      variant="neutral"
                      compact
                      disabled={duplicating === r.routine_id}
                      onClick={() => handleDuplicate(r)}
                      title="Duplicar"
                    />
                    <ActionButton
                      icon="🗑️"
                      variant="delete"
                      compact
                      disabled={r.trainee_count > 0}
                      onClick={() => setDeleteTarget(r)}
                      title={r.trainee_count > 0 ? "Rutina en uso" : "Borrar"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {traineesModal && (
        <Modal
          title={`Alumnos usando "${traineesModal.name}"`}
          onClose={() => setTraineesModal(null)}
          maxWidth="max-w-sm"
        >
          <div className="p-5">
            <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {traineesModal.trainees.map((t) => (
                <li key={t.trainee_id} className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: t.color || "#9AA595" }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-brand-dark truncate">{t.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}

      {modal && (
        <RoutineModal
          routineId={modal.routineId}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            fetchRoutines();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="¿Eliminar rutina?"
          message={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
