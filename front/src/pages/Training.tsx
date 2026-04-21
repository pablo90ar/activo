import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSettings } from "../hooks/useSettings";
import { useTrainingSocket } from "../hooks/useTrainingSocket";
import TrainingTrainee from "../components/TrainingTrainee";
import TraineePickerModal from "../components/TraineePickerModal";
import CompletionCelebration from "../components/CompletionCelebration";
import {
  getActiveTrainings,
  startTraining,
  stopTraining,
  type ActiveTraining,
} from "../services/activeTrainingService";
import { getTraineeRoutineFull } from "../services/traineeService";
import { getHistory } from "../services/historyService";

export default function Training() {
  const [workouts, setWorkouts] = useState<Array<ActiveTraining>>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [celebration, setCelebration] = useState<{ name: string; color: string; traineeId: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const { trainingTitle } = useSettings();
  usePageTitle(trainingTitle);

  const refresh = useCallback(() => {
    getActiveTrainings().then(setWorkouts).catch(() => {});
  }, []);

  // Carga inicial
  useEffect(() => { refresh(); }, [refresh]);

  // Handlers de WebSocket
  const wsHandlers = useMemo(() => ({
    "training:start": () => refresh(),
    "training:stop": () => refresh(),
    "training:dayChange": () => refresh(),
    "training:completed": (data: any) => {
      // Buscar alumno para mostrar celebración
      const w = workouts.find((w) => w.trainee_id === data.trainee_id);
      if (w) setCelebration({ name: w.name, color: w.color, traineeId: w.trainee_id });
      refresh();
    },
    "routine:updated": () => setRefreshKey((k) => k + 1),
    "trainee:updated": () => { refresh(); setRefreshKey((k) => k + 1); },
    "trainee:photo": () => setRefreshKey((k) => k + 1),
    "trainee:routineChanged": () => { refresh(); setRefreshKey((k) => k + 1); },
  }), [refresh, workouts]);

  useTrainingSocket(wsHandlers);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleAdd = async (trainee: { trainee_id: string; name: string; color: string }) => {
    const routine = await getTraineeRoutineFull(trainee.trainee_id);
    if (!routine?.days?.length) return;

    let dayId = routine.days[0].training_day_id;
    try {
      const history = await getHistory({ trainee_id: trainee.trainee_id });
      if (history.length && history[0].routine_id === routine.routine_id) {
        const lastDayId = history[0].training_day_id;
        const idx = routine.days.findIndex((d: any) => d.training_day_id === lastDayId);
        if (idx >= 0) dayId = routine.days[(idx + 1) % routine.days.length].training_day_id;
      }
    } catch { /* ignore - fallback to first day */ }

    await startTraining(trainee.trainee_id, dayId);
    setPickerOpen(false);
    refresh();
  };

  const handleRemove = async (traineeId: string) => {
    await stopTraining(traineeId);
    refresh();
  };

  return (
    <div className="h-screen bg-linear-to-br from-brand-cream to-brand-sage flex flex-col p-2">
      <div className="relative flex items-center justify-center md:px-8 md:py-4">
        <h1 className="text-2xl font-bold text-brand-dark">{trainingTitle}</h1>
        <div className="hidden md:flex absolute right-8 gap-2">
          <button
            onClick={() => setPickerOpen(true)}
            disabled={workouts.length >= 6}
            className="px-4 py-2 bg-brand-action text-white rounded-lg shadow font-medium hover:bg-brand-action-hover transition disabled:opacity-40"
          >+ Agregar alumno</button>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-2 bg-brand-olive text-white rounded-lg shadow hover:bg-[#5a645a] transition"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >⛶</button>
        </div>
      </div>

      {workouts.length > 0 ? (
        <>
          <div
            className="hidden md:grid flex-1 min-h-0 gap-3 mx-auto w-full"
            style={{
              gridTemplateColumns: `repeat(${Math.min(workouts.length, 6)}, minmax(0, 25%))`,
              justifyContent: "center",
            }}
          >
            {workouts.map((w) => (
              <TrainingTrainee
                key={w.trainee_id}
                traineeId={w.trainee_id}
                name={w.name}
                color={w.color}
                initialDayId={w.training_day_id}
                refreshKey={refreshKey}
                onRemove={() => handleRemove(w.trainee_id)}
                onFinish={() => setCelebration({ name: w.name, color: w.color, traineeId: w.trainee_id })}
              />
            ))}
          </div>

          <div
            ref={scrollRef}
            className="md:hidden flex-1 flex overflow-x-auto snap-x snap-mandatory pb-16"
            onScroll={() => {
              const el = scrollRef.current;
              if (el && el.clientWidth > 0) setActiveSlide(Math.round(el.scrollLeft / el.clientWidth));
            }}
          >
            {workouts.map((w) => (
              <div key={w.trainee_id} className="snap-center shrink-0 w-full h-full p-3">
                <TrainingTrainee
                  traineeId={w.trainee_id}
                  name={w.name}
                  color={w.color}
                  initialDayId={w.training_day_id}
                  refreshKey={refreshKey}
                  onRemove={() => handleRemove(w.trainee_id)}
                  onFinish={() => handleRemove(w.trainee_id)}
                />
              </div>
            ))}
          </div>

          {workouts.length > 1 && (
            <div className="md:hidden flex justify-center gap-2 pb-2">
              {workouts.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full transition ${i === activeSlide ? "bg-brand-dark" : "bg-brand-dark/30"}`} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-brand-olive text-lg">No hay alumnos entrenando</p>
        </div>
      )}

      <button
        onClick={() => setPickerOpen(true)}
        disabled={workouts.length >= 6}
        className="md:hidden fixed bottom-4 right-4 z-40 bg-brand-action text-white rounded-full p-3 backdrop-blur shadow-lg font-medium hover:bg-brand-action-hover transition disabled:opacity-40"
      >
        <span className="text-lg leading-none">+👤</span>
      </button>

      {celebration && (
        <CompletionCelebration
          traineeId={celebration.traineeId}
          name={celebration.name}
          color={celebration.color}
          onDone={() => { handleRemove(celebration.traineeId); setCelebration(null); }}
        />
      )}

      {pickerOpen && (
        <TraineePickerModal
          excludeIds={workouts.map((w) => w.trainee_id)}
          onSelect={handleAdd}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
