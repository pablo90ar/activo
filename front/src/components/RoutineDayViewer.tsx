import { useState, useEffect, useRef } from "react";
import { getHistory } from "../services/historyService";
import { getTraineeRoutineFull } from "../services/traineeService";
import { useSettings } from "../hooks/useSettings";
import Modal from "./Modal";
import RoutineModal from "./RoutineModal";

interface Exercise {
  exercise_name: string;
  exercise_description?: string;
  exercise_tags?: string;
  repetitions: number;
  weight: number;
  other_text?: string;
}

interface DaySet {
  iterations: number;
  is_circuit?: number;
  work_time?: number;
  rest_time?: number;
  exercises: Array<Exercise>;
}

interface Day {
  training_day_id: string;
  name: string;
  sets: Array<DaySet>;
}

interface Routine {
  routine_id: string;
  name: string;
  days: Array<Day>;
}

interface Props {
  traineeId: string;
  initialDayId?: string;
  refreshKey?: number;
  onDayChange?: (routineId: string, trainingDayId: string) => void;
}

export default function RoutineDayViewer({
  traineeId,
  initialDayId,
  refreshKey,
  onDayChange,
}: Props) {
  const { repsUnit, weightUnit } = useSettings();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [dayCounts, setDayCounts] = useState<Record<string, number>>({});

  const fetchCounts = () => {
    getHistory({ trainee_id: traineeId })
      .then((rows: Array<{ training_day_id: string }>) => {
        const counts: Record<string, number> = {};
        for (const r of rows)
          counts[r.training_day_id] = (counts[r.training_day_id] || 0) + 1;
        setDayCounts(counts);
      })
      .catch(() => {});
  };

  const fetchRoutine = () => {
    setLoading(true);
    getTraineeRoutineFull(traineeId)
      .then((data) => {
        setRoutine(data);
        if (data) {
          if (initialDayId) {
            const idx = data.days.findIndex(
              (d: Day) => d.training_day_id === initialDayId,
            );
            if (idx >= 0) setDayIndex(idx);
            else setDayIndex((prev) => Math.min(prev, data.days.length - 1));
          } else {
            setDayIndex((prev) => Math.min(prev, data.days.length - 1));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoutine();
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traineeId, initialDayId, refreshKey]);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const fit = () => {
      const available = container.clientHeight;
      const containerW = container.clientWidth;
      let s = 1;
      // Iterar: el escalado cambia el ancho efectivo, lo que cambia los saltos de línea y la altura
      for (let i = 0; i < 5; i++) {
        content.style.transform = "scale(1)";
        content.style.width = `${containerW / s}px`;
        const needed = content.scrollHeight;
        if (needed * s <= available) break;
        s = Math.max(1 / 5, available / needed);
      }
      content.style.width = `${containerW / s}px`;
      content.style.transform = `scale(${s})`;
      content.style.transformOrigin = "top left";
      setScale(s);
    };

    requestAnimationFrame(fit);
    const ro = new ResizeObserver(() => requestAnimationFrame(fit));
    ro.observe(container);
    return () => ro.disconnect();
  }, [routine, dayIndex]);

  useEffect(() => {
    if (routine && routine.days[dayIndex]) {
      onDayChange?.(routine.routine_id, routine.days[dayIndex].training_day_id);
    }
  }, [routine, dayIndex, onDayChange]);

  const days = routine?.days ?? [];
  const day = days[dayIndex];
  const empty = loading || !routine || days.length === 0;
  const emptyMsg = loading
    ? "Cargando..."
    : !routine
      ? "Sin rutina asignada"
      : "Rutina sin días";

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden px-2">
        {empty ? (
          <p className="text-center text-brand-olive text-sm py-4">
            {emptyMsg}
          </p>
        ) : (
          <>
            {/* Navegación de días */}
            <div className="shrink-0 flex items-center justify-between mb-2">
              <button
                onClick={() => setDayIndex((i) => Math.max(0, i - 1))}
                disabled={dayIndex === 0}
                className="px-2 py-0.5 text-brand-olive disabled:opacity-30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => setEditing(true)}
                title="Editar rutina"
                className="text-sm font-semibold text-brand-dark hover:text-brand-action transition"
              >
                {day.name || `Día ${dayIndex + 1}`}{" "}
                <span className="text-brand-olive font-normal">
                  ({dayCounts[day.training_day_id] || 0})
                </span>
              </button>

              <button
                onClick={() =>
                  setDayIndex((i) => Math.min(days.length - 1, i + 1))
                }
                disabled={dayIndex === days.length - 1}
                className="px-2 py-0.5 text-brand-olive disabled:opacity-30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Sets y ejercicios */}
            <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden">
              <div
                ref={contentRef}
                className="space-y-2 origin-top-left"
                style={{ transform: `scale(${scale})` }}
              >
                {day &&
                  day.sets.map((set, si) => (
                    <div key={si} className="bg-white/40 rounded-lg p-2">
                      {set.is_circuit === 1 && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-brand-action text-white px-2 py-0.5 rounded-full font-medium">
                            CIRCUITO
                          </span>
                          <span className="text-xs text-brand-olive">
                            <span className="text-base font-bold">
                              {set.work_time}
                            </span>{" "}
                            trabajo /{" "}
                            <span className="text-base font-bold">
                              {set.rest_time}
                            </span>{" "}
                            descanso
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <div className="flex items-center shrink-0">
                          <span className="text-xl font-bold text-brand-olive">
                            {set.iterations}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          {set.exercises.map((ex, ei) => (
                            <div
                              key={ei}
                              onClick={() => setSelectedExercise(ex)}
                              className="flex items-center text-sm text-brand-dark bg-white/60 rounded-md p-1.5 min-w-0 cursor-pointer hover:bg-white/90 transition"
                            >
                              <span className="uppercase font-bold text-xl min-w-0 flex-1">
                                {ex.exercise_name}
                              </span>
                              {!set.is_circuit && ex.repetitions > 0 && (
                                <span className="text-xl font-bold text-brand-dark text-right shrink-0 ml-2">
                                  {ex.repetitions}
                                  <span className="text-sm font-normal text-brand-muted">
                                    {repsUnit}
                                  </span>
                                </span>
                              )}
                              <span className="text-xl font-bold text-brand-dark text-right shrink-0 ml-2">
                                {ex.weight > 0 && (
                                  <>
                                    {ex.weight}
                                    <span className="text-sm font-normal text-brand-muted">
                                      {weightUnit}
                                    </span>
                                  </>
                                )}
                              </span>
                              {ex.repetitions === 0 &&
                                ex.weight === 0 &&
                                ex.other_text && (
                                  <span className="text-xl font-bold text-brand-dark text-right shrink-0 ml-2">
                                    {ex.other_text}
                                  </span>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedExercise && (
        <Modal title={selectedExercise.exercise_name} onClose={() => setSelectedExercise(null)} maxWidth="max-w-sm">
          <div className="p-5 flex flex-col gap-3">
            {selectedExercise.exercise_description
              ? <p className="text-brand-dark whitespace-pre-line">{selectedExercise.exercise_description}</p>
              : <p className="text-brand-olive italic">Sin descripción</p>
            }
            {selectedExercise.exercise_tags && (
              <div className="flex flex-wrap gap-1">
                {selectedExercise.exercise_tags.split(",").map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs bg-brand-cream text-brand-olive rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {editing && (
        <RoutineModal
          routineId={routine!.routine_id}
          activeDayId={day?.training_day_id}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            fetchRoutine();
          }}
        />
      )}
    </>
  );
}
