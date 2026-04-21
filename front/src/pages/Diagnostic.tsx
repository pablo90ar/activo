import { useState } from "react";
import { fetchJson } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";

export default function Diagnostic() {
  const [modalData, setModalData] = useState<{ title: string; data: any; loading: boolean; error: string | null } | null>(null);

  usePageTitle("Diagnóstico");

  const entities = [
    { title: "Trainees", endpoint: "trainees" },
    { title: "Routines", endpoint: "routines" },
    { title: "Trainee Routines", endpoint: "trainee-routines" },
    { title: "Training Days", endpoint: "training-days" },
    { title: "Day Sets", endpoint: "day-sets" },
    { title: "Exercises Sets", endpoint: "exercises-sets" },
    { title: "Exercises", endpoint: "exercises" },
    { title: "Tags", endpoint: "tags" },
    { title: "Exercise Tags", endpoint: "exercise-tags" },
    { title: "Completed Training Days", endpoint: "history" },
  ];

  const openModal = async (title: string, endpoint: string) => {
    setModalData({ title, data: null, loading: true, error: null });
    try {
      const data = await fetchJson<any>(`/${endpoint}`);
      setModalData({ title, data, loading: false, error: null });
    } catch (error: any) {
      setModalData({ title, data: null, loading: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-cream to-brand-sage p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Diagnóstico" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map((entity) => (
            <button
              key={entity.endpoint}
              onClick={() => openModal(entity.title, entity.endpoint)}
              className="bg-white hover:bg-gray-50 text-brand-dark font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            >{entity.title}</button>
          ))}
        </div>
      </div>

      {modalData && (
        <Modal title={modalData.title} onClose={() => setModalData(null)} maxWidth="max-w-4xl">
          <div className="p-6 overflow-auto max-h-[calc(80vh-80px)]">
            {modalData.loading && <p className="text-center text-brand-olive">Cargando...</p>}
            {modalData.error && <p className="text-center text-red-600">Error: {modalData.error}</p>}
            {modalData.data && (
              <pre className="bg-brand-cream p-4 rounded overflow-auto text-sm text-brand-dark">
                {JSON.stringify(modalData.data, null, 2)}
              </pre>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
