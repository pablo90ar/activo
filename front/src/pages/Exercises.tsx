import { useState, useEffect, useCallback, useRef } from "react";
import { getExercisesPaginated, deleteExercise, getExerciseRoutines } from "../services/exerciseService";
import { getTags } from "../services/tagService";
import type { ExerciseData, ExerciseTag, RoutineRef } from "../types/api";
import { usePageTitle } from "../hooks/usePageTitle";
import ConfirmDialog from "../components/ConfirmDialog";
import ExerciseModal from "../components/ExerciseModal";
import MergeExercisesModal from "../components/MergeExercisesModal";
import PageHeader from "../components/PageHeader";
import ViewToggle from "../components/ViewToggle";
import ActionButton from "../components/ActionButton";
import Modal from "../components/Modal";

const PAGE_SIZE = 100;

export default function Exercises() {
  const [exercises, setExercises] = useState<Array<ExerciseData>>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExerciseData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [routinesModal, setRoutinesModal] = useState<{ exercise: ExerciseData; routines: Array<RoutineRef> } | null>(null);
  const [routinesLoading, setRoutinesLoading] = useState(false);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; exerciseId?: string } | null>(null);
  const [tags, setTags] = useState<Array<ExerciseTag>>([]);
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);
  const [filterEmpty, setFilterEmpty] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = exercises.length < total;

  usePageTitle("Ejercicios");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { getTags().then(setTags).catch(() => {}); }, []);

  const fetchPage = useCallback(async (offset: number, append: boolean) => {
    if (offset === 0) setLoading(true); else setLoadingMore(true);
    try {
      const res = await getExercisesPaginated({
        offset, limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        groups: selectedTags.length ? selectedTags : undefined,
        filterEmpty: filterEmpty || undefined,
      });
      setExercises(prev => append ? [...prev, ...res.items] : res.items);
      setTotal(res.total);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, selectedTags, filterEmpty]);

  useEffect(() => { fetchPage(0, false); }, [fetchPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
        fetchPage(exercises.length, true);
      }
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadingMore, exercises.length, fetchPage]);

  const openRoutines = async (ex: ExerciseData) => {
    if (ex.routine_count === 0) return;
    setRoutinesLoading(true);
    setRoutinesModal({ exercise: ex, routines: [] });
    try {
      setRoutinesModal({ exercise: ex, routines: await getExerciseRoutines(ex.exercise_id) });
    } catch {
      setRoutinesModal(null);
    } finally {
      setRoutinesLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExercise(deleteTarget.exercise_id);
      setDeleteTarget(null);
      fetchPage(0, false);
    } catch {
      alert("Error al eliminar el ejercicio");
    } finally {
      setDeleting(false);
    }
  };

  const RoutineCount = ({ ex }: { ex: ExerciseData }) =>
    ex.routine_count > 0 ? (
      <button onClick={() => openRoutines(ex)} className="text-sm text-brand-action underline hover:text-brand-action-hover transition">
        {ex.routine_count} {ex.routine_count === 1 ? "rutina" : "rutinas"}
      </button>
    ) : (
      <span className="text-sm text-brand-olive">Sin rutinas</span>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-cream to-brand-sage p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader title="Ejercicios" />

        <div className="flex flex-col gap-3 mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-brand-sage"
            />
            <button
              onClick={() => setModal({ mode: "create" })}
              className="px-4 py-2 bg-brand-action text-white rounded-lg shadow font-medium hover:bg-brand-action-hover transition shrink-0"
            >+ Nuevo</button>
          </div>
          <div className="flex gap-2 items-center">
            <ViewToggle value={viewMode} onChange={setViewMode} />
            <button
              onClick={() => setMergeOpen(true)}
              className="px-4 py-2 bg-white text-brand-olive rounded-lg shadow font-medium hover:bg-gray-100 transition shrink-0 text-sm"
            >Unificar</button>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-4">
            <button
              onClick={() => setSelectedTags([])}
              className={`px-2 py-0.5 text-xs rounded-full transition ${selectedTags.length === 0 && !filterEmpty ? "bg-brand-olive text-white" : "bg-white text-brand-olive hover:bg-gray-100"}`}
            >Todos</button>
            <button
              onClick={() => { setFilterEmpty(!filterEmpty); setSelectedTags([]); }}
              className={`px-2 py-0.5 text-xs rounded-full transition ${filterEmpty ? "bg-brand-olive text-white" : "bg-white text-brand-olive hover:bg-gray-100"}`}
            >Vacíos</button>
            {tags.map((t) => (
              <button
                key={t.group_id}
                onClick={() => { setSelectedTags((prev) => prev.includes(t.group_id) ? prev.filter((g) => g !== t.group_id) : [...prev, t.group_id]); setFilterEmpty(false); }}
                className={`px-2 py-0.5 text-xs rounded-full transition ${selectedTags.includes(t.group_id) ? "bg-brand-olive text-white" : "bg-white text-brand-olive hover:bg-gray-100"}`}
              >{t.name}</button>
            ))}
          </div>
        )}

        {loading && <p className="text-center text-brand-dark text-lg">Cargando...</p>}
        {error && <p className="text-center text-red-700 text-lg">Error: {error}</p>}
        {!loading && !error && exercises.length === 0 && (
          <p className="text-center text-brand-olive text-lg">No se encontraron ejercicios.</p>
        )}

        {!loading && exercises.length > 0 && (
          <p className="text-xs text-brand-olive mb-2">{exercises.length} de {total} ejercicios</p>
        )}

        {viewMode === "list" && exercises.length > 0 && (
          <div className="flex flex-col gap-2">
            {exercises.map((e) => (
              <div
                key={e.exercise_id}
                onClick={() => setModal({ mode: "edit", exerciseId: e.exercise_id })}
                className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-brand-cream/60 transition"
              >
                <p className="font-semibold text-brand-dark truncate min-w-0">{e.name}</p>
                <div className="flex items-center gap-3 shrink-0" onClick={(ev) => ev.stopPropagation()}>
                  <RoutineCount ex={e} />
                  <ActionButton icon="🗑️" variant="delete" disabled={e.routine_count > 0} onClick={() => setDeleteTarget(e)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "cards" && exercises.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {exercises.map((e) => (
              <div
                key={e.exercise_id}
                onClick={() => setModal({ mode: "edit", exerciseId: e.exercise_id })}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col cursor-pointer hover:bg-brand-cream/60 transition"
              >
                <div className="bg-brand-olive flex items-center justify-center py-6">
                  <span className="text-4xl font-bold text-white">{e.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <p className="font-semibold text-brand-dark truncate text-center">{e.name}</p>
                  <div className="text-center mt-1"><RoutineCount ex={e} /></div>
                  <div className="flex gap-2 mt-3 justify-center" onClick={(ev) => ev.stopPropagation()}>
                    <ActionButton icon="🗑️" variant="delete" compact disabled={e.routine_count > 0} onClick={() => setDeleteTarget(e)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-4" />
        {loadingMore && <p className="text-center text-brand-olive py-2">Cargando más...</p>}
      </div>

      {modal && (
        <ExerciseModal
          mode={modal.mode}
          exerciseId={modal.exerciseId}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchPage(0, false); }}
        />
      )}

      {routinesModal && (
        <Modal title={routinesModal.exercise.name} onClose={() => setRoutinesModal(null)} maxWidth="max-w-sm">
          <div className="p-5">
            <p className="text-sm text-brand-olive mb-3">Rutinas que usan este ejercicio:</p>
            {routinesLoading ? (
              <p className="text-center text-brand-olive">Cargando...</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {routinesModal.routines.map((r) => (
                  <li key={r.routine_id} className="bg-brand-cream rounded-lg px-4 py-2 text-brand-dark font-medium">
                    {r.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {mergeOpen && (
        <MergeExercisesModal
          onClose={() => setMergeOpen(false)}
          onMerged={() => { setMergeOpen(false); fetchPage(0, false); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="¿Eliminar ejercicio?"
          message={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
