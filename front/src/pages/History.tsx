import { useState, useEffect, useCallback, useMemo } from "react";
import { getHistory, deleteHistory, updateHistoryDate, duplicateHistory } from "../services/historyService";
import type { HistoryRow } from "../types/api";
import { usePageTitle } from "../hooks/usePageTitle";
import { norm } from "../utils/string";
import { fmtDate } from "../utils/format";
import ConfirmDialog from "../components/ConfirmDialog";
import HistorySnapshotModal from "../components/HistorySnapshotModal";
import MultiSelectFilter from "../components/MultiSelectFilter";
import PageHeader from "../components/PageHeader";
import * as XLSX from "xlsx";

type SortKey = "completed_date" | "trainee_name" | "routine_name" | "day_name";

export default function History() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterTrainees, setFilterTrainees] = useState<Set<string>>(new Set());
  const [filterRoutines, setFilterRoutines] = useState<Set<string>>(new Set());
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [snapshotRow, setSnapshotRow] = useState<HistoryRow | null>(null);

  const hasFilters =
    filterTrainees.size > 0 ||
    filterRoutines.size > 0 ||
    filterFrom !== "" ||
    filterTo !== "";

  usePageTitle("Historial");

  const fetchData = useCallback(() => {
    setLoading(true);
    getHistory({ from: filterFrom || undefined, to: filterTo || undefined })
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => {
        setLoading(false);
        setSelected(new Set());
      });
  }, [filterFrom, filterTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const trainees = useMemo(
    () => [...new Set(rows.map((r) => r.trainee_name))].sort(),
    [rows],
  );
  const routines = useMemo(
    () => [...new Set(rows.map((r) => r.routine_name))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    let data = rows;
    if (filterTrainees.size)
      data = data.filter((r) => filterTrainees.has(r.trainee_name));
    if (filterRoutines.size)
      data = data.filter((r) => filterRoutines.has(r.routine_name));
    return data;
  }, [rows, filterTrainees, filterRoutines]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (!sortKey) return copy;
    copy.sort((a, b) => {
      const va = norm(a[sortKey]);
      const vb = norm(b[sortKey]);
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return copy;
  }, [filtered, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortAsc(key !== "completed_date");
    } else if (sortAsc === (key !== "completed_date"))
      setSortAsc(key === "completed_date");
    else {
      setSortKey(null);
      setSortAsc(false);
    }
  };

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ▲" : " ▼") : "";

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map((r) => r.history_id)));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteHistory([...selected]);
      setConfirmDelete(false);
      fetchData();
    } catch {
      alert("Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const data = sorted.map((r) => ({
      Fecha: fmtDate(r.completed_date),
      Alumno: r.trainee_name,
      Rutina: r.routine_name,
      Día: `${r.day_name} (${r.day_order}/${r.total_days})`,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");
    XLSX.writeFile(wb, `historial_activo.xls`);
  };

  const resetFilters = () => {
    setFilterTrainees(new Set());
    setFilterRoutines(new Set());
    setFilterFrom("");
    setFilterTo("");
  };

  const ExportButton = () => (
    <button
      onClick={handleExport}
      className="px-3 py-2 h-10.5 bg-white text-brand-olive rounded-lg shadow font-medium hover:bg-gray-100 transition flex items-center gap-1"
      title="Exportar a Excel"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"
        />
      </svg>
      .xls
    </button>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-cream to-brand-sage p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader title="Historial" />

        {/* Mobile: filtros y acciones */}
        <div className="flex gap-3 mb-3 sm:hidden">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`px-4 py-2 h-10.5 rounded-lg shadow font-medium transition ${hasFilters ? "bg-brand-action text-white" : "bg-white text-brand-dark"}`}
          >
            {filtersOpen ? "▲ Filtrar" : "▼ Filtrar"}
            {hasFilters ? " ●" : ""}
          </button>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 h-10.5 bg-white text-brand-olive rounded-lg shadow font-medium hover:bg-gray-100 transition"
            >
              ✕ Reset
            </button>
          )}
          {selected.size === 1 && (
            <>
              <button
                onClick={() => {
                  const id = [...selected][0];
                  const row = sorted.find((r) => r.history_id === id);
                  if (row) { setEditingId(id); setEditDate(row.completed_date.slice(0, 10)); }
                }}
                className="px-4 py-2 h-10.5 bg-white text-brand-olive rounded-lg shadow font-medium hover:bg-gray-100 transition"
              >
                ✏️ Editar fecha
              </button>
              <button
                onClick={async () => {
                  await duplicateHistory([...selected][0]);
                  fetchData();
                }}
                className="px-4 py-2 h-10.5 bg-white text-brand-olive rounded-lg shadow font-medium hover:bg-gray-100 transition"
              >
                📋 Duplicar
              </button>
            </>
          )}
          {selected.size > 0 && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 h-10.5 bg-brand-danger text-white rounded-lg shadow font-medium hover:bg-red-700 transition"
            >
              🗑️ ({selected.size})
            </button>
          )}
          {sorted.length > 0 && <ExportButton />}
        </div>

        {/* Controles de filtro */}
        <div
          className={`flex-col sm:flex-row gap-3 mb-6 flex-wrap items-start ${filtersOpen ? "flex" : "hidden sm:flex"}`}
        >
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm font-medium text-brand-dark">
              Alumno
            </span>
            <MultiSelectFilter
              options={trainees}
              selected={filterTrainees}
              onChange={setFilterTrainees}
              placeholder="Alumnos"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm font-medium text-brand-dark">
              Rutina
            </span>
            <MultiSelectFilter
              options={routines}
              selected={filterRoutines}
              onChange={setFilterRoutines}
              placeholder="Rutinas"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm font-medium text-brand-dark">
              Desde
            </span>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="px-3 py-2 h-10.5 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm font-medium text-brand-dark">
              Hasta
            </span>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="px-3 py-2 h-10.5 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white"
            />
          </div>
          <div className="hidden sm:flex gap-3">
            {sorted.length > 0 && <ExportButton />}
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 h-10.5 bg-white text-brand-olive rounded-lg shadow font-medium hover:bg-gray-100 transition"
              >
                ✕ Reset
              </button>
            )}
            {selected.size === 1 && (
              <>
                <button
                  onClick={() => {
                    const id = [...selected][0];
                    const row = sorted.find((r) => r.history_id === id);
                    if (row) { setEditingId(id); setEditDate(row.completed_date.slice(0, 10)); }
                  }}
                  className="px-4 py-2 h-10.5 bg-white text-brand-olive rounded-lg shadow font-medium hover:bg-gray-100 transition"
                >
                  ✏️ Editar fecha
                </button>
                <button
                  onClick={async () => {
                    await duplicateHistory([...selected][0]);
                    fetchData();
                  }}
                  className="px-4 py-2 h-10.5 bg-white text-brand-olive rounded-lg shadow font-medium hover:bg-gray-100 transition"
                >
                  📋 Duplicar
                </button>
              </>
            )}
            {selected.size > 0 && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 h-10.5 bg-brand-danger text-white rounded-lg shadow font-medium hover:bg-red-700 transition"
              >
                🗑️ Eliminar ({selected.size})
              </button>
            )}
          </div>
        </div>

        {loading && (
          <p className="text-center text-brand-dark text-lg">Cargando...</p>
        )}
        {error && (
          <p className="text-center text-red-700 text-lg">Error: {error}</p>
        )}
        {!loading && !error && sorted.length === 0 && (
          <p className="text-center text-brand-olive text-lg">
            No hay entrenamientos registrados.
          </p>
        )}

        {!loading && !error && sorted.length > 0 && (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="w-full bg-white">
              <thead>
                <tr className="bg-brand-olive text-white text-left">
                  <th className="px-2 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        sorted.length > 0 && selected.size === sorted.length
                      }
                      onChange={toggleAll}
                      className="accent-brand-action w-4 h-4"
                    />
                  </th>
                  {(
                    [
                      ["completed_date", "Fecha"],
                      ["trainee_name", "Alumno"],
                      ["routine_name", "Rutina"],
                      ["day_name", "Día"],
                    ] as [SortKey, string][]
                  ).map(([key, label]) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-4 py-3 cursor-pointer select-none hover:bg-[#5B6B5A] transition text-sm"
                    >
                      {label}
                      {sortIcon(key)}
                    </th>
                  ))}

                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr
                    key={r.history_id}
                    onClick={() => setSnapshotRow(r)}
                    className={`border-t border-gray-100 hover:bg-gray-50 transition cursor-pointer ${selected.has(r.history_id) ? "bg-red-50" : ""}`}
                  >
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(r.history_id)}
                        onChange={() => toggleOne(r.history_id)}
                        className="accent-brand-action w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-dark" onClick={(e) => editingId === r.history_id ? e.stopPropagation() : undefined}>
                      {editingId === r.history_id ? (
                        <form
                          className="flex items-center gap-1"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            await updateHistoryDate(r.history_id, new Date(editDate + "T12:00:00").toISOString());
                            setEditingId(null);
                            fetchData();
                          }}
                        >
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="px-1 py-0.5 rounded border text-xs"
                            autoFocus
                          />
                          <button type="submit" className="text-brand-action text-xs">✓</button>
                          <button type="button" onClick={() => setEditingId(null)} className="text-gray-400 text-xs">✕</button>
                        </form>
                      ) : (
                        fmtDate(r.completed_date)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-dark font-medium">
                      {r.trainee_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-dark">
                      {r.routine_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-dark">
                      {r.day_name}{" "}
                      <span className="text-gray-400">
                        ({r.day_order}/{r.total_days})
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-center text-sm text-brand-olive mt-4">
          {sorted.length} registro{sorted.length !== 1 ? "s" : ""}
        </p>
      </div>

      {snapshotRow && (
        <HistorySnapshotModal
          historyId={snapshotRow.history_id}
          title={`${snapshotRow.trainee_name} — ${snapshotRow.day_name} (${fmtDate(snapshotRow.completed_date)})`}
          onClose={() => setSnapshotRow(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="¿Eliminar entrenamientos?"
          message={`Se eliminarán ${selected.size} registro${selected.size !== 1 ? "s" : ""}`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          loading={deleting}
        />
      )}
    </div>
  );
}
