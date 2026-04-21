import type { DayForm, DaySetForm } from "../types/routine";
import { emptySet } from "../types/routine";
import DaySetComponent from "./DaySet";

interface Props {
  day: DayForm;
  isActive?: boolean;
  canRemove: boolean;
  onUpdate: (patch: Partial<DayForm>) => void;
  onRemove: () => void;
}

export default function TrainingDay({ day, isActive, canRemove, onUpdate, onRemove }: Props) {
  const updateSet = (si: number, patch: Partial<DaySetForm>) =>
    onUpdate({ sets: day.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) });

  const addSet = () => onUpdate({ sets: [...day.sets, emptySet()] });
  const removeSet = (si: number) => onUpdate({ sets: day.sets.filter((_, i) => i !== si) });

  return (
    <div className="flex flex-col min-w-0 bg-white rounded-xl shadow overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#6C766B] text-white">
        {isActive && (
          <span className="w-3 h-3 rounded-full bg-[#34D399] border-2 border-white shrink-0" title="Día en entrenamiento" />
        )}
        <input
          type="text"
          value={day.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="flex-1 bg-transparent border-b border-white/40 focus:outline-none text-sm font-semibold placeholder-white/60"
          placeholder="Nombre del día"
        />
        {canRemove && (
          <button onClick={onRemove} className="text-xs hover:text-red-300 transition">✕</button>
        )}
      </div>

      <div className="overflow-y-auto p-2 flex flex-col gap-2 min-w-0">
        {day.sets.map((set, si) => (
          <DaySetComponent
            key={si}
            set={set}
            canRemove={day.sets.length > 1}
            onUpdate={(patch) => updateSet(si, patch)}
            onRemove={() => removeSet(si)}
          />
        ))}
      </div>

      <button
        onClick={addSet}
        className="m-2 py-1.5 text-sm text-[#5B7E6A] border border-dashed border-[#9AA595] rounded-lg hover:bg-[#9AA595]/10 transition"
      >
        + Serie
      </button>
    </div>
  );
}
