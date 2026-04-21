import { useState, useRef, useCallback, useEffect } from "react";
import { registerTraining } from "../services/historyService";
import { updateActiveDay } from "../services/activeTrainingService";
import ConfirmDialog from "./ConfirmDialog";
import RoutineDayViewer from "./RoutineDayViewer";
import TraineeAvatar from "./TraineeAvatar";

interface Props {
  traineeId: string;
  name: string;
  color: string;
  initialDayId: string;
  refreshKey?: number;
  onRemove: () => void;
  onFinish: () => void;
}

export default function TrainingTrainee({
  traineeId,
  name,
  color,
  initialDayId,
  refreshKey,
  onRemove,
  onFinish,
}: Props) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDayRef = useRef<{
    routineId: string;
    trainingDayId: string;
  } | null>(null);

  const startHold = useCallback(() => {
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setHolding(false);
      const day = currentDayRef.current;
      if (day) {
        registerTraining(traineeId, day.routineId, day.trainingDayId).catch(
          () => {},
        );
      }
      onFinish();
    }, 1000);
  }, [onFinish, traineeId]);

  const cancelHold = useCallback(() => {
    setHolding(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const [showButtons, setShowButtons] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const startHideTimer = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setShowButtons(false), 2000);
  }, [clearHideTimer]);

  const handleMouseEnter = useCallback(() => {
    clearHideTimer();
    setShowButtons(true);
    startHideTimer();
  }, [clearHideTimer, startHideTimer]);

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    [],
  );

  return (
    <>
      <div
        className="h-full min-h-0 flex flex-col bg-white/30 rounded-xl border border-white/50 overflow-hidden relative"
        onMouseEnter={handleMouseEnter}
      >
        <div className="shrink-0 flex items-center gap-3 pt-2 px-2 mb-2">
          <TraineeAvatar
            traineeId={traineeId}
            name={name}
            color={color}
            photoVersion={refreshKey}
            clickable
          />
          <span className="text-lg font-bold text-brand-dark">{name}</span>
        </div>
        <RoutineDayViewer
          traineeId={traineeId}
          initialDayId={initialDayId}
          refreshKey={refreshKey}
          onDayChange={(routineId, trainingDayId) => {
            const prev = currentDayRef.current;
            currentDayRef.current = { routineId, trainingDayId };
            if (prev && prev.trainingDayId !== trainingDayId) {
              updateActiveDay(traineeId, trainingDayId).catch(() => {});
            }
          }}
        />
        {/* Mobile: siempre visible */}
        <div className="shrink-0 flex gap-2 p-3 md:hidden">
          <button
            onClick={() => setConfirmCancel(true)}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-brand-dark bg-white/60 hover:bg-white transition text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            className="flex-1 py-2 rounded-lg text-white text-sm font-medium relative overflow-hidden bg-brand-action hover:bg-brand-action-hover transition select-none touch-none"
          >
            {holding && (
              <span
                className="absolute inset-0 bg-brand-success origin-left"
                style={{ animation: "fill-bar 1s linear forwards" }}
              />
            )}
            <span className="relative z-10">
              {holding ? "Mantenga..." : "Completar"}
            </span>
          </button>
        </div>
        {/* Desktop: overlay en hover */}
        <div
          className={`hidden md:flex absolute bottom-0 left-0 right-0 flex-col transition-opacity duration-500 ${
            showButtons ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onMouseEnter={clearHideTimer}
          onMouseLeave={startHideTimer}
        >
          <div className="h-10 bg-linear-to-t from-brand-dark/80 to-transparent" />
          <div className="flex gap-2 p-3 bg-brand-dark/80">
            <button
              onClick={() => setConfirmCancel(true)}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-brand-dark bg-white/60 hover:bg-white transition text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              className="flex-1 py-2 rounded-lg text-white text-sm font-medium relative overflow-hidden bg-brand-action hover:bg-brand-action-hover transition"
            >
              {holding && (
                <span
                  className="absolute inset-0 bg-brand-success origin-left"
                  style={{ animation: "fill-bar 1s linear forwards" }}
                />
              )}
              <span className="relative z-10">
                {holding ? "Mantenga..." : "Completar"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {confirmCancel && (
        <ConfirmDialog
          title="¿Abortar entrenamiento?"
          message={name}
          cancelLabel="Volver"
          confirmLabel="Abortar"
          onConfirm={() => {
            setConfirmCancel(false);
            onRemove();
          }}
          onCancel={() => setConfirmCancel(false)}
        />
      )}
    </>
  );
}
