import { useState } from "react";
import API_BASE_URL from "../config/api";

export default function Diagnostic() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState({
    title: "",
    endpoint: "",
    data: null as any,
    loading: false,
    error: null as string | null,
  });

  const entities = [
    { title: "Trainees", endpoint: "trainees" },
    { title: "Routines", endpoint: "routines" },
    { title: "Trainee Routines", endpoint: "trainee-routines" },
    { title: "Training Days", endpoint: "training-days" },
    { title: "Day Sets", endpoint: "day-sets" },
    { title: "Exercises Sets", endpoint: "exercises-sets" },
    { title: "Exercises", endpoint: "exercises" },
    { title: "Muscle Groups", endpoint: "muscle-groups" },
    { title: "Exercise Groups", endpoint: "exercise-groups" },
    { title: "Tools", endpoint: "tools" },
    { title: "Exercise Tools", endpoint: "exercise-tools" },
    { title: "Completed Training Days", endpoint: "completed-training-days" },
  ];

  const openModal = async (title: string, endpoint: string) => {
    setSelectedEntity({ title, endpoint, data: null, loading: true, error: null });
    setModalOpen(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setSelectedEntity(prev => ({ ...prev, data, loading: false }));
    } catch (error: any) {
      setSelectedEntity(prev => ({ ...prev, error: error.message, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          ACTIVO - Diagnóstico
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map((entity) => (
            <button
              key={entity.endpoint}
              onClick={() => openModal(entity.title, entity.endpoint)}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            >
              {entity.title}
            </button>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{selectedEntity.title}</h2>
              <button onClick={() => setModalOpen(false)} className="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(80vh-80px)]">
              {selectedEntity.loading && <p className="text-center text-gray-600">Cargando...</p>}
              {selectedEntity.error && <p className="text-center text-red-600">Error: {selectedEntity.error}</p>}
              {selectedEntity.data && (
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(selectedEntity.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
