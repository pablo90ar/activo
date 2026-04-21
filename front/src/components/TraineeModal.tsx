import { useState, useEffect } from "react";
import { getTrainee, createTrainee, updateTrainee, deleteTrainee, uploadTraineePhoto, deleteTraineePhoto, traineePhotoUrl } from "../services/traineeService";
import { getTraineeRoutines, assignRoutine, unassignRoutine } from "../services/traineeRoutineService";
import { getRoutines } from "../services/routineService";
import { useCrossTabStore } from "../store/useCrossTabStore";
import type { NewTraineeForm } from "../store/crossTabStore";
import ConfirmDialog from "./ConfirmDialog";
import ImageCropper from "./ImageCropper";

interface TraineeModalProps {
  mode: "create" | "edit";
  traineeId?: string;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
}

interface RoutineOption {
  routine_id: string;
  name: string;
}

const EMPTY_FORM: NewTraineeForm = {
  name: "",
  document: "",
  birth_date: "",
  gender: true,
  goal: "",
  color: "#9AA595",
};

export default function TraineeModal({ mode, traineeId, onClose, onSaved, onDeleted }: TraineeModalProps) {
  const [state, setState] = useCrossTabStore();
  const [form, setForm] = useState<NewTraineeForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [routine, setRoutine] = useState<RoutineOption | null>(null);
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);
  const [routines, setRoutines] = useState<RoutineOption[]>([]);
  const [routinesLoading, setRoutinesLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [confirmDeletePhoto, setConfirmDeletePhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [photoZoom, setPhotoZoom] = useState(false);

  useEffect(() => {
    if (mode === "create" && state.newTrainee) {
      setForm(state.newTrainee);
    }
  }, []);

  useEffect(() => {
    if (mode === "edit" && traineeId) {
      setPhotoPreview(traineePhotoUrl(traineeId));
      Promise.all([getTrainee(traineeId), getTraineeRoutines(traineeId)])
        .then(async ([data, trArr]) => {
          setForm({
            name: data.name || "",
            document: data.document || "",
            birth_date: data.birth_date || "",
            gender: !!data.gender,
            goal: data.goal || "",
            color: data.color || "#9AA595",
          });
          if (trArr.length > 0) {
            const rData = await getRoutines();
            const found = rData.find((r: any) => r.routine_id === trArr[0].routine_id);
            if (found) setRoutine({ routine_id: found.routine_id, name: found.name });
          }
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [mode, traineeId]);

  const updateField = (field: keyof NewTraineeForm, value: string | boolean) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (mode === "create") {
      setState(() => ({ newTrainee: updated }));
    }
  };

  const openRoutinePicker = async () => {
    setShowRoutinePicker(true);
    setRoutinesLoading(true);
    try {
      setRoutines(await getRoutines({ is_template: false }));
    } catch {
      setRoutines([]);
    } finally {
      setRoutinesLoading(false);
    }
  };

  const handleAssignRoutine = async (r: RoutineOption) => {
    if (mode === "edit" && traineeId) {
      await assignRoutine(traineeId, r.routine_id);
    }
    setRoutine(r);
    setShowRoutinePicker(false);
  };

  const handleUnassignRoutine = async () => {
    if (mode === "edit" && traineeId) {
      await unassignRoutine(traineeId);
    }
    setRoutine(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        const created = await createTrainee(form);
        if (photoFile) await uploadTraineePhoto(created.trainee_id, photoFile);
        if (routine) {
          await assignRoutine(created.trainee_id, routine.routine_id);
        }
        setState(() => ({ newTrainee: null }));
      } else {
        await updateTrainee(traineeId!, form);
        if (photoFile) await uploadTraineePhoto(traineeId!, photoFile);
      }
      onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (mode === "create") {
      const hasData = form.name || form.document || form.birth_date || form.goal;
      if (hasData) {
        setState(() => ({ newTrainee: form }));
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#6C766B] px-5 py-4 flex justify-between items-center sticky top-0">
          <h2 className="text-lg font-bold text-white">
            {mode === "create" ? "Nuevo alumno" : "Editar alumno"}
          </h2>
          <button onClick={handleClose} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-[#6C766B]">Cargando...</div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3A3F39] mb-2">Foto</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-[#9AA595] ring-offset-2 cursor-pointer hover:ring-brand-action transition"
                      onError={() => setPhotoPreview(null)}
                      onClick={() => setPhotoZoom(true)}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full text-white flex items-center justify-center font-bold text-3xl ring-2 ring-[#9AA595] ring-offset-2" style={{ backgroundColor: form.color || '#9AA595' }}>
                      {form.name ? form.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-action text-white rounded-lg cursor-pointer hover:bg-[#4A6D59] transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    {photoPreview ? "Cambiar" : "Subir foto"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCropSrc(URL.createObjectURL(file));
                      e.target.value = "";
                    }} />
                  </label>
                  {(photoPreview || photoFile) && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeletePhoto(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F39] mb-1">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AA595]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F39] mb-1">Documento</label>
              <input
                type="text"
                value={form.document}
                onChange={(e) => updateField("document", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AA595]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F39] mb-1">Fecha de nacimiento</label>
              <div className="flex gap-2">
                <select
                  value={form.birth_date ? parseInt(form.birth_date.split("-")[2]) : ""}
                  onChange={(e) => {
                    const parts = (form.birth_date || "0000-01-01").split("-");
                    updateField("birth_date", `${parts[0]}-${parts[1]}-${e.target.value.padStart(2, "0")}`);
                  }}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AA595]"
                >
                  <option value="">Día</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <select
                  value={form.birth_date ? parseInt(form.birth_date.split("-")[1]) : ""}
                  onChange={(e) => {
                    const parts = (form.birth_date || "0000-01-01").split("-");
                    updateField("birth_date", `${parts[0]}-${e.target.value.padStart(2, "0")}-${parts[2]}`);
                  }}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AA595]"
                >
                  <option value="">Mes</option>
                  {["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={form.birth_date ? parseInt(form.birth_date.split("-")[0]) : ""}
                  onChange={(e) => {
                    const parts = (form.birth_date || "0000-01-01").split("-");
                    updateField("birth_date", `${e.target.value}-${parts[1]}-${parts[2]}`);
                  }}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AA595]"
                >
                  <option value="">Año</option>
                  {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F39] mb-1">Género</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-[#3A3F39]">
                  <input type="radio" checked={form.gender} onChange={() => updateField("gender", true)} className="accent-[#6C766B]" />
                  Masculino
                </label>
                <label className="flex items-center gap-2 text-sm text-[#3A3F39]">
                  <input type="radio" checked={!form.gender} onChange={() => updateField("gender", false)} className="accent-[#6C766B]" />
                  Femenino
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F39] mb-1">Objetivo</label>
              <input
                type="text"
                value={form.goal}
                onChange={(e) => updateField("goal", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AA595]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F39] mb-1">Color identificatorio</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => updateField("color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm text-[#6C766B]">{form.color}</span>
                {form.color !== "#9AA595" && (
                  <button
                    type="button"
                    onClick={() => updateField("color", "#9AA595")}
                    className="px-2 py-1 text-xs bg-gray-200 text-[#3A3F39] rounded hover:bg-gray-300 transition"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F39] mb-1">Rutina</label>
              <div className="flex items-center gap-2">
                {routine ? (
                  <span className="flex-1 px-3 py-2 bg-[#ECEBE2] rounded-lg text-[#3A3F39] text-sm truncate">{routine.name}</span>
                ) : (
                  <span className="flex-1 px-3 py-2 text-gray-400 text-sm">Sin rutina</span>
                )}
                <button
                  type="button"
                  onClick={openRoutinePicker}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                >✏️</button>
                {routine && (
                  <button
                    type="button"
                    onClick={handleUnassignRoutine}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >🗑️</button>
                )}
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 bg-[#5B7E6A] text-white rounded-lg font-medium hover:bg-[#4A6D59] transition disabled:opacity-50"
            >
              {saving ? "Guardando..." : mode === "create" ? "Crear alumno" : "Guardar cambios"}
            </button>

            {mode === "edit" && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2.5 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition text-sm"
              >
                🗑️ Eliminar alumno
              </button>
            )}
          </div>
        )}
      </div>

      {showRoutinePicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[60]" onClick={() => setShowRoutinePicker(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#6C766B] px-5 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Seleccionar rutina</h3>
              <button onClick={() => setShowRoutinePicker(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-4 max-h-60 overflow-y-auto">
              {routinesLoading ? (
                <p className="text-center text-[#6C766B]">Cargando...</p>
              ) : routines.length === 0 ? (
                <p className="text-center text-gray-400">No hay rutinas disponibles</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {routines.map((r) => (
                    <button
                      key={r.routine_id}
                      onClick={() => handleAssignRoutine(r)}
                      className="text-left px-4 py-2 rounded-lg hover:bg-[#ECEBE2] text-[#3A3F39] transition"
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {photoZoom && photoPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4" onClick={() => setPhotoZoom(false)}>
          <img
            src={photoPreview}
            alt=""
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onCropped={(file, preview) => {
            setPhotoFile(file);
            setPhotoPreview(preview);
            setCropSrc(null);
          }}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="¿Eliminar alumno?"
          message={form.name}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await deleteTrainee(traineeId!);
              setConfirmDelete(false);
              onDeleted?.();
            } catch {
              alert("Error al eliminar el alumno");
            } finally {
              setDeleting(false);
            }
          }}
          onCancel={() => setConfirmDelete(false)}
          loading={deleting}
        />
      )}
      {confirmDeletePhoto && (
        <ConfirmDialog
          title="¿Eliminar imagen?"
          message="Esta acción no se puede deshacer"
          onConfirm={async () => {
            setDeletingPhoto(true);
            try {
              if (mode === "edit" && traineeId) {
                await deleteTraineePhoto(traineeId);
              }
              setPhotoFile(null);
              setPhotoPreview(null);
              setConfirmDeletePhoto(false);
            } catch {
              alert("Error al eliminar la imagen");
            } finally {
              setDeletingPhoto(false);
            }
          }}
          onCancel={() => setConfirmDeletePhoto(false)}
          loading={deletingPhoto}
        />
      )}
    </div>
  );
}
