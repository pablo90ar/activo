import { useState } from "react";
import type { DaySetForm, ExerciseSetForm } from "../types/routine";
import { emptyExercise } from "../types/routine";
import { useSettings } from "../hooks/useSettings";
import ExercisePickerModal from "./ExercisePickerModal";

interface Props {
  set: DaySetForm;
  canRemove: boolean;
  onUpdate: (patch: Partial<DaySetForm>) => void;
  onRemove: () => void;
}

export default function DaySet({ set, canRemove, onUpdate, onRemove }: Props) {
  const [pickerTarget, setPickerTarget] = useState<number | null>(null);
  const { repsUnit, weightUnit } = useSettings();

  const updateExercise = (ei: number, patch: Partial<ExerciseSetForm>) =>
    onUpdate({
      exercises: set.exercises.map((e, k) =>
        k === ei ? { ...e, ...patch } : e,
      ),
    });

  const toggleCircuit = (isCircuit: boolean) => {
    if (isCircuit) {
      // Al activar circuito, setear repeticiones a 0 en todos los ejercicios
      const updatedExercises = set.exercises.map((ex) => ({
        ...ex,
        repetitions: 0,
      }));
      onUpdate({ is_circuit: true, exercises: updatedExercises });
    } else {
      onUpdate({ is_circuit: false });
    }
  };

  const addExercise = () =>
    onUpdate({ exercises: [...set.exercises, emptyExercise()] });
  const removeExercise = (ei: number) =>
    onUpdate({ exercises: set.exercises.filter((_, i) => i !== ei) });

  return (
    <>
      <div className="rounded-lg border p-2 bg-gray-50 border-gray-200 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            min={1}
            value={set.iterations}
            onChange={(e) => onUpdate({ iterations: +e.target.value || 1 })}
            className="w-12 px-1 py-0.5 text-xs border rounded text-center"
            title="Iteraciones"
          />
          <span className="text-xs font-bold text-[#6C766B]">Series</span>

          <label className="flex items-center gap-1 text-xs text-[#6C766B]">
            <input
              type="checkbox"
              checked={set.is_circuit}
              onChange={(e) => toggleCircuit(e.target.checked)}
              className="accent-[#5B7E6A]"
            />
            Circuito
          </label>

          <div className="flex-1" />
          {canRemove && (
            <button
              onClick={onRemove}
              className="text-xs text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          )}
        </div>

        {set.is_circuit && (
          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              min={0}
              value={set.work_time || ""}
              onChange={(e) => onUpdate({ work_time: +e.target.value || 0 })}
              className="w-12 px-1 py-0.5 text-xs border rounded text-center"
              title="Tiempo de trabajo (segundos)"
              placeholder=""
            />
            <span className="text-[10px] text-[#6C766B]">trabajo</span>

            <input
              type="number"
              min={0}
              value={set.rest_time || ""}
              onChange={(e) => onUpdate({ rest_time: +e.target.value || 0 })}
              className="w-12 px-1 py-0.5 text-xs border rounded text-center"
              title="Tiempo de descanso (segundos)"
              placeholder=""
            />
            <span className="text-[10px] text-[#6C766B]">descanso</span>
          </div>
        )}

        {set.exercises.map((ex, ei) => (
          <div
            key={ei}
            className="mb-1 p-1.5 bg-white rounded border border-gray-200 min-w-0"
          >
            <div className="flex items-center gap-1">
              <input
                type="text"
                readOnly
                value={ex.exercise_name}
                placeholder="Ejercicio..."
                onClick={() => setPickerTarget(ei)}
                className="flex-1 min-w-0 text-xs px-1 py-1 border rounded cursor-pointer bg-white hover:bg-gray-50 focus:outline-none truncate"
              />
              {set.exercises.length > 1 && (
                <button
                  onClick={() => removeExercise(ei)}
                  className="text-xs text-red-400 hover:text-red-600 shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                min={0}
                value={ex.repetitions || ""}
                onChange={(e) =>
                  updateExercise(ei, { repetitions: +e.target.value })
                }
                className={`w-14 px-1 py-1 text-xs border rounded text-center ${
                  set.is_circuit
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white"
                }`}
                title="Repeticiones"
                placeholder="Reps"
                disabled={set.is_circuit}
              />
              <span className="text-[10px] text-[#6C766B]">{repsUnit} - </span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={ex.weight || ""}
                onChange={(e) =>
                  updateExercise(ei, { weight: +e.target.value })
                }
                className="w-14 px-1 py-1 text-xs border rounded text-center"
                title="Peso"
                placeholder={weightUnit}
              />
              <span className="text-[10px] text-[#6C766B]">{weightUnit} - </span>
              <input
                type="text"
                value={ex.other_text}
                onChange={(e) =>
                  updateExercise(ei, { other_text: e.target.value })
                }
                className="w-14 px-1 py-1 text-xs border rounded text-center"
                title="text"
                placeholder="otro..."
              />
            </div>
          </div>
        ))}

        <button
          onClick={addExercise}
          className="w-full mt-1 py-1.5 text-xs text-[#5B7E6A] border border-dashed border-[#9AA595] rounded hover:bg-[#9AA595]/10 transition"
        >
          + Ejercicio
        </button>
      </div>

      {pickerTarget !== null && (
        <ExercisePickerModal
          onSelect={(selected) => {
            updateExercise(pickerTarget, {
              exercise_id: selected.exercise_id,
              exercise_name: selected.name,
            });
            setPickerTarget(null);
          }}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </>
  );
}
