import { useState, useEffect } from "react";
import { getRoutineFull, createRoutine, updateRoutine } from "../services/routineService";
import type { RoutineForm, DayForm } from "../types/routine";
import { emptyDay } from "../types/routine";
import TrainingDay from "./TrainingDay";

interface Props {
  routineId?: string;
  activeDayId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function RoutineModal({ routineId, activeDayId, onClose, onSaved }: Props) {
  const isEdit = !!routineId;
  const [form, setForm] = useState<RoutineForm>({
    name: "",
    description: "",
    is_template: false,
    days: [emptyDay(0)],
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [hasTrainees, setHasTrainees] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  useEffect(() => {
    if (!routineId) return;
    getRoutineFull(routineId)
      .then((data) => {
        setHasTrainees(data.trainee_count > 0);
        setForm({
          name: data.name,
          description: data.description || "",
          is_template: !!data.is_template,
          days: data.days.map((d: any) => ({
            training_day_id: d.training_day_id,
            name: d.name || "",
            sets: d.sets.map((s: any) => ({
              day_set_id: s.day_set_id,
              iterations: s.iterations,
              is_circuit: !!s.is_circuit,
              work_time: s.work_time || 0,
              rest_time: s.rest_time || 0,
              exercises: s.exercises.map((e: any) => ({
                exercise_set_id: e.exercise_set_id,
                exercise_id: e.exercise_id,
                exercise_name: e.exercise_name,
                weight: e.weight,
                repetitions: e.repetitions,
                work_time: e.work_time,
                rest_time: e.rest_time,
                other_text: e.other_text || "",
              })),
            })),
          })),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [routineId]);

  const updateDay = (di: number, patch: Partial<DayForm>) =>
    setForm((f) => ({ ...f, days: f.days.map((d, i) => (i === di ? { ...d, ...patch } : d)) }));

  const addDay = () => {
    setForm((f) => ({ ...f, days: [...f.days, emptyDay(f.days.length)] }));
    setActiveDayIndex(form.days.length);
  };
  const removeDay = (di: number) => {
    setForm((f) => ({ ...f, days: f.days.filter((_, i) => i !== di) }));
    setActiveDayIndex((prev) => Math.min(prev, form.days.length - 2));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    
    // Validar que todos los ejercicios estén definidos
    const undefinedExercises: Array<string> = [];
    
    form.days.forEach((day, dayIndex) => {
      day.sets.forEach((set, setIndex) => {
        set.exercises.forEach((exercise, exerciseIndex) => {
          if (!exercise.exercise_id || !exercise.exercise_name.trim()) {
            const dayName = day.name || `Día ${dayIndex + 1}`;
            undefinedExercises.push(`${dayName} - Serie ${setIndex + 1} - Ejercicio ${exerciseIndex + 1}`);
          }
        });
      });
    });
    
    if (undefinedExercises.length > 0) {
      const message = `No se puede guardar la rutina.\n\nHay ejercicios sin definir:\n\n${undefinedExercises.join('\n')}\n\nPor favor, defina todos los ejercicios antes de guardar.`;
      alert(message);
      return;
    }
    
    setSaving(true);
    try {
      if (isEdit) await updateRoutine(routineId!, form);
      else await createRoutine(form);
      onSaved();
    } catch {
      alert("Error al guardar la rutina");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <p className="text-white text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#ECEBE2] flex flex-col">
      {/* Header - desktop: fila única */}
      <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-[#3A3F39] text-white shrink-0">
        <button onClick={onClose} className="px-3 py-1 rounded hover:bg-white/20 transition shrink-0">
          ✕ Cerrar
        </button>
        <span className="text-lg font-bold shrink-0">{isEdit ? "Editar Rutina" : "Nueva Rutina"}</span>
        <input
          type="text"
          placeholder="Nombre de la rutina"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="px-3 py-1 rounded bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#9AA595] font-semibold text-white placeholder-white/50"
        />
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="flex-1 px-3 py-1 rounded bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#9AA595] text-white placeholder-white/50"
        />
        <label className={`flex items-center gap-2 text-sm shrink-0 ${hasTrainees ? "text-white/40" : "text-white"}`}>
          <input
            type="checkbox"
            checked={form.is_template}
            disabled={hasTrainees}
            onChange={(e) => setForm((f) => ({ ...f, is_template: e.target.checked }))}
          />
          Plantilla
        </label>
        <button
          onClick={addDay}
          className="px-3 py-1 bg-white/10 border border-white/30 rounded font-medium hover:bg-white/20 transition shrink-0 text-sm"
        >
          + Día
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
          className="px-4 py-1 bg-[#5B7E6A] rounded font-medium hover:bg-[#4A6D59] transition disabled:opacity-40 shrink-0"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      {/* Header - mobile: apilado */}
      <div className="md:hidden flex flex-col gap-2 px-3 py-2 bg-[#3A3F39] text-white shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="px-2 py-1 rounded hover:bg-white/20 transition text-sm">
            ✕ Cerrar
          </button>
          <span className="text-sm font-bold">{isEdit ? "Editar Rutina" : "Nueva Rutina"}</span>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="px-3 py-1 bg-[#5B7E6A] rounded text-sm font-medium hover:bg-[#4A6D59] transition disabled:opacity-40"
          >
            {saving ? "..." : "Guardar"}
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="flex-1 px-2 py-1 rounded bg-white/10 border border-white/30 focus:outline-none text-sm font-semibold text-white placeholder-white/50"
          />
          <label className={`flex items-center gap-1 text-xs shrink-0 ${hasTrainees ? "text-white/40" : "text-white"}`}>
            <input
              type="checkbox"
              checked={form.is_template}
              disabled={hasTrainees}
              onChange={(e) => setForm((f) => ({ ...f, is_template: e.target.checked }))}
            />
            Plantilla
          </label>
        </div>
        {/* Tabs de días */}
        <div className="flex gap-1 overflow-x-auto">
          {form.days.map((day, di) => (
            <button
              key={di}
              onClick={() => setActiveDayIndex(di)}
              className={`px-3 py-1 text-xs rounded-t-lg shrink-0 transition ${di === activeDayIndex ? "bg-[#ECEBE2] text-[#3A3F39] font-bold" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            >
              {day.name || `Día ${di + 1}`}
            </button>
          ))}
          <button
            onClick={addDay}
            className="px-2 py-1 text-xs text-white/60 hover:text-white transition shrink-0"
          >
            +
          </button>
        </div>
      </div>

      {/* PC: columnas en grilla */}
      <div className="flex-1 overflow-y-auto hidden md:block p-4">
        <div
          className="grid gap-3 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${form.days.length}, minmax(0, 1fr))`,
            maxWidth: form.days.length <= 3 ? `${form.days.length * 24}rem` : undefined,
          }}
        >
          {form.days.map((day, di) => (
            <TrainingDay
              key={di}
              day={day}
              isActive={!!activeDayId && day.training_day_id === activeDayId}
              canRemove={form.days.length > 1}
              onUpdate={(patch) => updateDay(di, patch)}
              onRemove={() => removeDay(di)}
            />
          ))}
        </div>
      </div>

      {/* Mobile: día activo único */}
      <div className="flex-1 overflow-y-auto md:hidden p-3">
        {form.days[activeDayIndex] && (
          <TrainingDay
            key={activeDayIndex}
            day={form.days[activeDayIndex]}
            isActive={!!activeDayId && form.days[activeDayIndex].training_day_id === activeDayId}
            canRemove={form.days.length > 1}
            onUpdate={(patch) => updateDay(activeDayIndex, patch)}
            onRemove={() => removeDay(activeDayIndex)}
          />
        )}
      </div>
    </div>
  );
}
