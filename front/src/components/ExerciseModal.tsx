import { useState, useEffect } from "react";
import { getTags } from "../services/tagService";
import {
  getExercise,
  createExercise,
  updateExercise,
} from "../services/exerciseService";
import type { ExerciseTag } from "../types/api";

interface ExerciseModalProps {
  mode: "create" | "edit";
  exerciseId?: string;
  onClose: () => void;
  onSaved: () => void;
}

interface ExerciseForm {
  name: string;
  description: string;
  tag_ids: Array<string>;
}

const EMPTY_FORM: ExerciseForm = { name: "", description: "", tag_ids: [] };

export default function ExerciseModal({
  mode,
  exerciseId,
  onClose,
  onSaved,
}: ExerciseModalProps) {
  const [form, setForm] = useState<ExerciseForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<Array<ExerciseTag>>([]);

  useEffect(() => {
    getTags()
      .then(setTags)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mode === "edit" && exerciseId) {
      getExercise(exerciseId)
        .then((data) =>
          setForm({
            name: data.name || "",
            description: data.description || "",
            tag_ids: data.tag_ids ? data.tag_ids.split(",") : [],
          }),
        )
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [mode, exerciseId]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") await createExercise(form);
      else if (exerciseId) await updateExercise(exerciseId, form);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-brand-olive px-5 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">
            {mode === "create" ? "Nuevo ejercicio" : "Editar ejercicio"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-brand-olive">Cargando...</div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">
                Agrupadores
              </label>
              <div className="flex gap-1 flex-wrap">
                {tags.map((t) => (
                  <button
                    key={t.group_id}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tag_ids: f.tag_ids.includes(t.group_id)
                          ? f.tag_ids.filter((g) => g !== t.group_id)
                          : [...f.tag_ids, t.group_id],
                      }))
                    }
                    className={`px-2 py-0.5 text-xs rounded-full transition ${form.tag_ids.includes(t.group_id) ? "bg-brand-action text-white" : "bg-gray-100 text-brand-olive hover:bg-gray-200"}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            {mode === "edit" && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                ⚠️ Los cambios impactarán en todas las rutinas que utilicen este
                ejercicio.
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 bg-brand-action text-white rounded-lg font-medium hover:bg-brand-action-hover transition disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : mode === "create"
                  ? "Crear ejercicio"
                  : "Guardar cambios"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
