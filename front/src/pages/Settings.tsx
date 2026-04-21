import { useState, useEffect, useRef } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSettings } from "../hooks/useSettings";
import {
  updateSettings,
  getLogoUrl,
  uploadLogo,
} from "../services/settingsService";
import { changePassword, clearToken } from "../services/authService";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function Settings() {
  usePageTitle("Ajustes");

  const {
    systemName: current,
    showClock: currentClock,
    repsUnit: currentRepsUnit,
    weightUnit: currentWeightUnit,
    trainingTitle: currentTrainingTitle,
    refresh,
  } = useSettings();
  const [systemName, setSystemName] = useState("");
  const [showClock, setShowClock] = useState(true);
  const [repsUnit, setRepsUnit] = useState("rp");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [trainingTitle, setTrainingTitle] = useState("Entrenamiento");
  const [saved, setSaved] = useState(false);
  const [logoKey, setLogoKey] = useState(0);
  const [logoExists, setLogoExists] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    setSystemName(current);
  }, [current]);
  useEffect(() => {
    setShowClock(currentClock);
  }, [currentClock]);
  useEffect(() => {
    setRepsUnit(currentRepsUnit);
  }, [currentRepsUnit]);
  useEffect(() => {
    setWeightUnit(currentWeightUnit);
  }, [currentWeightUnit]);
  useEffect(() => {
    setTrainingTitle(currentTrainingTitle);
  }, [currentTrainingTitle]);

  useEffect(() => {
    fetch(getLogoUrl(), { method: "HEAD" })
      .then((r) => setLogoExists(r.ok))
      .catch(() => setLogoExists(false));
  }, [logoKey]);

  const handleSave = async () => {
    await updateSettings({
      systemName,
      showClock,
      repsUnit,
      weightUnit,
      trainingTitle,
    });
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/png") {
      alert("Solo se admiten archivos .png");
      return;
    }
    setUploading(true);
    try {
      await uploadLogo(file);
      setLogoKey((k) => k + 1);
    } catch {
      alert("Error al subir el logo");
    } finally {
      setUploading(false);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!current) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-cream to-brand-sage p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Ajustes" />
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex gap-6">
            <label className="block text-sm font-medium text-brand-dark flex-1">
              Nombre del sistema
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value.slice(0, 20))}
                maxLength={20}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-sage"
              />
              <span className="text-xs text-gray-400">
                {systemName.length}/20
              </span>
            </label>

            <div className="flex-1 space-y-2">
              <span className="block text-sm font-medium text-brand-dark">Logo del sistema</span>
              <div className="flex items-center gap-3">
                {logoExists ? (
                  <img
                    src={`${getLogoUrl()}?v=${logoKey}`}
                    alt="Logo"
                    className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-gray-50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
                    Sin logo
                  </div>
                )}
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".png"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-1.5 text-sm bg-brand-action text-white rounded-lg hover:bg-brand-action-hover transition disabled:opacity-50"
                  >
                    {uploading
                      ? "Subiendo..."
                      : logoExists
                        ? "Cambiar"
                        : "Subir"}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">Solo .png</p>
                </div>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-brand-dark cursor-pointer">
            <span>Mostrar reloj</span>
            <button
              type="button"
              role="switch"
              aria-checked={showClock}
              onClick={() => setShowClock(!showClock)}
              className={`relative w-11 h-6 rounded-full transition ${showClock ? "bg-brand-action" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showClock ? "translate-x-5" : ""}`}
              />
            </button>
          </label>
          <div className="flex gap-4">
            <label className="block text-sm font-medium text-brand-dark flex-1">
              Abreviación de repeticiones
              <input
                type="text"
                value={repsUnit}
                onChange={(e) => setRepsUnit(e.target.value.slice(0, 6))}
                maxLength={6}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-sage"
              />
              <span className="text-xs text-gray-400">{repsUnit.length}/6</span>
            </label>
            <label className="block text-sm font-medium text-brand-dark flex-1">
              Abreviación de pesos
              <input
                type="text"
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value.slice(0, 6))}
                maxLength={6}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-sage"
              />
              <span className="text-xs text-gray-400">
                {weightUnit.length}/6
              </span>
            </label>
          </div>
          <label className="block text-sm font-medium text-brand-dark">
            Título de página de entrenamiento (soporta emojis)
            <input
              type="text"
              value={trainingTitle}
              onChange={(e) => setTrainingTitle(e.target.value.slice(0, 30))}
              maxLength={30}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-sage"
            />
            <span className="text-xs text-gray-400">
              {trainingTitle.length}/30
            </span>
          </label>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-brand-action text-white rounded-lg hover:bg-brand-action-hover transition"
          >
            {saved ? "✓ Guardado" : "Guardar"}
          </button>

          <hr className="border-gray-200" />

          <div className="space-y-3">
            <span className="block text-sm font-medium text-brand-dark">
              Cambiar contraseña
            </span>
            <input
              type="password"
              placeholder="Contraseña actual"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-sage"
            />
            <input
              type="password"
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-sage"
            />
            <input
              type="password"
              placeholder="Repetir nueva contraseña"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className={`block w-full px-3 py-2 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${confirmPw && confirmPw !== newPw ? "border-red-400" : "border-gray-300"}`}
            />
            {confirmPw && confirmPw !== newPw && (
              <p className="text-sm text-red-600">Las contraseñas no coinciden</p>
            )}
            {pwMsg && (
              <p
                className={`text-sm ${pwMsg.ok ? "text-green-600" : "text-red-600"}`}
              >
                {pwMsg.text}
              </p>
            )}
            <button
              disabled={pwLoading || !currentPw || newPw.length < 6 || newPw !== confirmPw}
              onClick={async () => {
                setPwLoading(true);
                setPwMsg(null);
                try {
                  await changePassword(currentPw, newPw);
                  setPwMsg({ text: "Contraseña actualizada", ok: true });
                  setCurrentPw("");
                  setNewPw("");
                  setConfirmPw("");
                } catch (e) {
                  setPwMsg({ text: e instanceof Error ? e.message : "Error desconocido", ok: false });
                } finally {
                  setPwLoading(false);
                }
              }}
              className="px-4 py-2 bg-brand-action text-white rounded-lg hover:bg-brand-action-hover transition disabled:opacity-50"
            >
              {pwLoading ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </div>

          <hr className="border-gray-200" />

          <button
            onClick={() => {
              clearToken();
              navigate("/login");
            }}
            className="w-full py-2.5 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
