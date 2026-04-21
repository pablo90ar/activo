import { useState, useEffect } from "react";
import { getExercises, createExercise } from "../services/exerciseService";
import { getTags } from "../services/tagService";
import type { ExerciseTag } from "../types/api";

interface Exercise {
  exercise_id: string;
  name: string;
  tags: string | null;
  tag_ids: string | null;
}

interface Props {
  onSelect: (exercise: { exercise_id: string; name: string }) => void;
  onClose: () => void;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function ExercisePickerModal({ onSelect, onClose }: Props) {
  const [exercises, setExercises] = useState<Array<Exercise>>([]);
  const [tags, setTags] = useState<Array<ExerciseTag>>([]);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createStep, setCreateStep] = useState(false);
  const [selectedCreateTags, setSelectedCreateTags] = useState<Array<string>>(
    [],
  );

  useEffect(() => {
    Promise.all([getExercises(), getTags()])
      .then(([ex, t]) => {
        setExercises(ex);
        setTags(t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = exercises.filter((e) => {
    if (!norm(e.name).includes(norm(search))) return false;
    if (
      selectedTags.length > 0 &&
      !selectedTags.some((g) => (e.tag_ids || "").split(",").includes(g))
    )
      return false;
    return true;
  });

  const exactMatch =
    search.trim() &&
    exercises.some((e) => norm(e.name) === norm(search.trim()));
  const showCreate = search.trim().length > 1 && !exactMatch && !loading;

  const toggleCreateTag = (id: string) =>
    setSelectedCreateTags((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );

  const handleCreate = async () => {
    setCreating(true);
    try {
      const created = await createExercise({
        name: search.trim(),
        tag_ids: selectedCreateTags,
      });
      onSelect({ exercise_id: created.exercise_id, name: created.name });
    } catch {
      alert("Error al crear el ejercicio");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-start justify-center pt-8 md:pt-24 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[85vh] md:max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex flex-col gap-2">
          <input
            type="text"
            autoFocus
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-sage"
          />
          {tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setSelectedTags([])}
                className={`px-2 py-0.5 text-xs rounded-full transition ${selectedTags.length === 0 ? "bg-brand-olive text-white" : "bg-gray-100 text-brand-olive hover:bg-gray-200"}`}
              >
                Todos
              </button>
              {tags.map((t) => (
                <button
                  key={t.group_id}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(t.group_id)
                        ? prev.filter((g) => g !== t.group_id)
                        : [...prev, t.group_id],
                    )
                  }
                  className={`px-2 py-0.5 text-xs rounded-full transition ${selectedTags.includes(t.group_id) ? "bg-brand-olive text-white" : "bg-gray-100 text-brand-olive hover:bg-gray-200"}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading && (
            <p className="text-center text-brand-olive py-4">Cargando...</p>
          )}
          {!loading && filtered.length === 0 && !showCreate && (
            <p className="text-center text-brand-olive py-4">Sin resultados</p>
          )}
          {filtered.map((e) => (
            <button
              key={e.exercise_id}
              onClick={() =>
                onSelect({ exercise_id: e.exercise_id, name: e.name })
              }
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-brand-cream transition"
            >
              <span className="text-brand-dark truncate">{e.name}</span>
              {e.tags && (
                <span className="text-[10px] text-brand-olive shrink-0 ml-2">
                  {e.tags}
                </span>
              )}
            </button>
          ))}
          {showCreate && !createStep && (
            <button
              onClick={() => setCreateStep(true)}
              className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg border-2 border-dashed border-brand-sage text-brand-action hover:bg-brand-sage/10 transition"
            >
              <span className="text-lg">+</span>
              <span className="text-sm">Crear "{search.trim()}"</span>
            </button>
          )}
          {createStep && (
            <div className="mt-2 p-3 rounded-lg border border-brand-sage bg-brand-cream/50">
              <p className="text-sm text-brand-dark mb-2">
                Agrupadores para <strong>"{search.trim()}"</strong>:
              </p>
              <div className="flex gap-1 flex-wrap mb-3">
                {tags.map((t) => (
                  <button
                    key={t.group_id}
                    onClick={() => toggleCreateTag(t.group_id)}
                    className={`px-2 py-0.5 text-xs rounded-full transition ${selectedCreateTags.includes(t.group_id) ? "bg-brand-action text-white" : "bg-gray-100 text-brand-olive hover:bg-gray-200"}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCreateStep(false);
                    setSelectedCreateTags([]);
                  }}
                  className="px-3 py-1 text-sm rounded-lg text-brand-olive hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="px-3 py-1 text-sm rounded-lg bg-brand-action text-white hover:bg-[#4a6d59] transition disabled:opacity-50"
                >
                  {creating ? "Creando..." : "Crear ejercicio"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
