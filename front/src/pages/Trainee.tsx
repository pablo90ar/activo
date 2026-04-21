import { useState, useEffect, useCallback } from "react";
import { getTrainees } from "../services/traineeService";
import type { TraineeData } from "../types/api";
import { usePageTitle } from "../hooks/usePageTitle";
import { norm } from "../utils/string";
import { fmtDate } from "../utils/format";
import TraineeModal from "../components/TraineeModal";
import RoutineModal from "../components/RoutineModal";
import TraineeAvatar from "../components/TraineeAvatar";
import PageHeader from "../components/PageHeader";
import ViewToggle from "../components/ViewToggle";
import * as XLSX from "xlsx";

export default function Trainee() {
  const [trainees, setTrainees] = useState<TraineeData[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; traineeId?: string } | null>(null);
  const [routineModal, setRoutineModal] = useState<string | null>(null);
  const [photoVersion, setPhotoVersion] = useState(0);

  usePageTitle("Alumnos");

  const fetchTrainees = useCallback(() => {
    setLoading(true);
    getTrainees()
      .then(setTrainees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTrainees(); }, [fetchTrainees]);

  const filtered = trainees.filter((t) => norm(t.name).includes(norm(search)));

  const handleExport = () => {
    const data = filtered.map((t) => ({
      Nombre: t.name,
      Documento: t.document,
      "Fecha de nacimiento": fmtDate(t.birth_date),
      Género: t.gender ? "Masculino" : "Femenino",
      Objetivo: t.goal,
      Rutina: t.routine_name || "Sin rutina",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alumnos");
    XLSX.writeFile(wb, "alumnos_activo.xls");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-cream to-brand-sage p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader title="Alumnos" />

        <div className="flex flex-col gap-3 mb-6">
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
            {filtered.length > 0 && (
              <button
                onClick={handleExport}
                className="px-3 py-2 h-[38px] bg-white text-brand-olive rounded-lg shadow font-medium hover:bg-gray-100 transition flex items-center gap-1 text-sm"
                title="Exportar a Excel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
                </svg>
                .xls
              </button>
            )}
          </div>
        </div>

        {loading && <p className="text-center text-brand-dark text-lg">Cargando...</p>}
        {error && <p className="text-center text-red-700 text-lg">Error: {error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-brand-olive text-lg">No se encontraron alumnos.</p>
        )}

        {viewMode === "list" && filtered.length > 0 && (
          <div className="flex flex-col gap-2">
            {filtered.map((t) => (
              <div
                key={t.trainee_id}
                onClick={() => setModal({ mode: "edit", traineeId: t.trainee_id })}
                className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-brand-cream/60 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TraineeAvatar traineeId={t.trainee_id} name={t.name} color={t.color} photoVersion={photoVersion} clickable />
                  <p className="font-semibold text-brand-dark truncate">{t.name}</p>
                </div>
                {t.routine_name
                  ? <button onClick={(e) => { e.stopPropagation(); setRoutineModal(t.routine_id); }} className="px-3 py-1.5 text-sm bg-brand-cream text-brand-dark rounded-lg hover:bg-brand-sage hover:text-white transition shrink-0">{t.routine_name}</button>
                  : <span className="text-sm text-gray-400 shrink-0">Sin rutina</span>
                }
              </div>
            ))}
          </div>
        )}

        {viewMode === "cards" && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((t) => (
              <div
                key={t.trainee_id}
                onClick={() => setModal({ mode: "edit", traineeId: t.trainee_id })}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col cursor-pointer hover:bg-brand-cream/60 transition"
              >
                <div className="flex items-center justify-center py-6" style={{ backgroundColor: t.color || '#9AA595' }}>
                  <TraineeAvatar traineeId={t.trainee_id} name={t.name} color={t.color} size="w-40 h-40" textSize="text-7xl" photoVersion={photoVersion} clickable />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <p className="font-semibold text-brand-dark truncate text-center">{t.name}</p>
                  {t.routine_name
                    ? <button onClick={(e) => { e.stopPropagation(); setRoutineModal(t.routine_id); }} className="text-xs text-brand-dark truncate text-center mt-1 hover:text-[#5B7E6A] transition">{t.routine_name}</button>
                    : <p className="text-xs text-gray-400 truncate text-center mt-1">Sin rutina</p>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <TraineeModal
          mode={modal.mode}
          traineeId={modal.traineeId}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchTrainees(); setPhotoVersion((v) => v + 1); }}
          onDeleted={() => { setModal(null); fetchTrainees(); }}
        />
      )}
      {routineModal && (
        <RoutineModal
          routineId={routineModal}
          onClose={() => setRoutineModal(null)}
          onSaved={() => { setRoutineModal(null); fetchTrainees(); }}
        />
      )}
    </div>
  );
}
