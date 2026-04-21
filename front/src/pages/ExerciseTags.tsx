import { useState, useEffect, useCallback } from "react";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getTagExercises,
} from "../services/tagService";
import { getExercise, updateExercise } from "../services/exerciseService";
import type { ExerciseTag } from "../types/api";
import { usePageTitle } from "../hooks/usePageTitle";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import ActionButton from "../components/ActionButton";
import Modal from "../components/Modal";

export default function ExerciseTags() {
  const [tags, setTags] = useState<Array<ExerciseTag>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ExerciseTag | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newName, setNewName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [exercisesModal, setExercisesModal] = useState<{
    tag: ExerciseTag;
    exercises: Array<{ exercise_id: string; name: string }>;
  } | null>(null);
  const [exercisesLoading, setExercisesLoading] = useState(false);

  usePageTitle("Agrupadores");

  const fetchGroups = useCallback(() => {
    setLoading(true);
    getTags()
      .then(setTags)
      .catch(() => setError("No se pudieron cargar los agrupadores"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const startEdit = (g: ExerciseTag) => {
    setEditingId(g.group_id);
    setEditName(g.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await updateTag(editingId, editName.trim());
      setEditingId(null);
      fetchGroups();
    } catch {
      alert("Error al guardar");
    }
  };

  const handleCreate = async () => {
    if (!newName?.trim()) return;
    setSaving(true);
    try {
      await createTag(newName.trim());
      setNewName(null);
      fetchGroups();
    } catch {
      alert("Error al crear");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTag(deleteTarget.group_id);
      setDeleteTarget(null);
      fetchGroups();
    } catch {
      alert("Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const openExercises = async (g: ExerciseTag) => {
    if (!g.exercise_count) return;
    setExercisesLoading(true);
    setExercisesModal({ tag: g, exercises: [] });
    try {
      setExercisesModal({
        tag: g,
        exercises: await getTagExercises(g.group_id),
      });
    } catch {
      setExercisesModal(null);
    } finally {
      setExercisesLoading(false);
    }
  };

  const handleUnassign = async (exerciseId: string) => {
    if (!exercisesModal) return;
    try {
      const ex = await getExercise(exerciseId);
      const currentGroups: Array<string> = ex.tag_ids
        ? ex.tag_ids.split(",")
        : [];
      const newGroups = currentGroups.filter(
        (gid: string) => gid !== exercisesModal.tag.group_id,
      );
      await updateExercise(exerciseId, {
        name: ex.name,
        description: ex.description || "",
        tag_ids: newGroups,
      });
      const updated = exercisesModal.exercises.filter(
        (e) => e.exercise_id !== exerciseId,
      );
      if (updated.length === 0) setExercisesModal(null);
      else setExercisesModal({ ...exercisesModal, exercises: updated });
      fetchGroups();
    } catch {
      alert("Error al desasociar");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-cream to-brand-sage p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Agrupadores" />

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setNewName("")}
            className="px-4 py-2 bg-brand-action text-white rounded-lg hover:bg-brand-action-hover transition"
          >
            + Nuevo agrupador
          </button>
        </div>

        {newName !== null && (
          <div className="bg-white rounded-lg shadow px-4 py-3 mb-4 flex items-center gap-3">
            <input
              autoFocus
              placeholder="Nombre del agrupador..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setNewName(null);
              }}
              className="flex-1 min-w-0 px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-brand-sage"
            />
            <button
              onClick={handleCreate}
              disabled={saving || !newName.trim()}
              className="px-3 py-1.5 text-sm bg-brand-action text-white rounded hover:bg-brand-action-hover transition disabled:opacity-50"
            >
              ✓
            </button>
            <button
              onClick={() => setNewName(null)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-brand-olive rounded hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>
        )}

        {loading && (
          <p className="text-center text-brand-dark text-lg">Cargando...</p>
        )}
        {error && (
          <p className="text-center text-red-700 text-lg">Error: {error}</p>
        )}
        {!loading && !error && tags.length === 0 && (
          <p className="text-center text-brand-olive text-lg">
            No hay agrupadores.
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-col gap-2">
            {tags.map((g) => (
              <div
                key={g.group_id}
                onClick={() => editingId !== g.group_id && startEdit(g)}
                className={`bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between gap-3 ${editingId === g.group_id ? "" : "cursor-pointer hover:bg-brand-cream/60"} transition`}
              >
                {editingId === g.group_id ? (
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-brand-sage"
                    />
                    {(g.exercise_count ?? 0) > 0 && (
                      <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                        ⚠️ El cambio impactará en {g.exercise_count}{" "}
                        {g.exercise_count === 1
                          ? "ejercicio asociado"
                          : "ejercicios asociados"}
                        .
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="font-semibold text-brand-dark truncate min-w-0">
                    {g.name}
                  </p>
                )}
                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <span
                    onClick={() => openExercises(g)}
                    className={`text-sm ${(g.exercise_count ?? 0) > 0 ? "text-brand-action underline hover:text-brand-action-hover cursor-pointer" : "text-brand-olive"}`}
                  >
                    {g.exercise_count ?? 0}{" "}
                    {g.exercise_count === 1 ? "ejercicio" : "ejercicios"}
                  </span>
                  {editingId === g.group_id ? (
                    <>
                      <ActionButton
                        icon="✓"
                        variant="edit"
                        onClick={saveEdit}
                      />
                      <ActionButton
                        icon="✕"
                        variant="neutral"
                        onClick={() => setEditingId(null)}
                      />
                    </>
                  ) : (
                    <ActionButton
                      icon="🗑️"
                      variant="delete"
                      disabled={(g.exercise_count ?? 0) > 0}
                      onClick={() => setDeleteTarget(g)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {exercisesModal && (
        <Modal
          title={exercisesModal.tag.name}
          onClose={() => setExercisesModal(null)}
          maxWidth="max-w-sm"
        >
          <div className="p-5">
            <p className="text-sm text-brand-olive mb-3">
              Ejercicios asociados:
            </p>
            {exercisesLoading ? (
              <p className="text-center text-brand-olive">Cargando...</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {exercisesModal.exercises.map((e) => (
                  <li
                    key={e.exercise_id}
                    className="flex items-center justify-between bg-brand-cream rounded-lg px-4 py-2"
                  >
                    <span className="text-brand-dark font-medium truncate">
                      {e.name}
                    </span>
                    <button
                      onClick={() => handleUnassign(e.exercise_id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition shrink-0 ml-2"
                    >
                      Desasociar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="¿Eliminar etiqueta?"
          message={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
