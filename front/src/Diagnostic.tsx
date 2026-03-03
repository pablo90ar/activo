import { useState } from 'react'
import Modal from './Modal'

export default function Diagnostic() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState({ title: '', endpoint: '' })

  const entities = [
    { title: 'Trainees', endpoint: 'trainees' },
    { title: 'Routines', endpoint: 'routines' },
    { title: 'Trainee Routines', endpoint: 'trainee-routines' },
    { title: 'Training Days', endpoint: 'training-days' },
    { title: 'Day Sets', endpoint: 'day-sets' },
    { title: 'Exercises Sets', endpoint: 'exercises-sets' },
    { title: 'Exercises', endpoint: 'exercises' },
    { title: 'Muscle Groups', endpoint: 'muscle-groups' },
    { title: 'Exercise Groups', endpoint: 'exercise-groups' },
    { title: 'Tools', endpoint: 'tools' },
    { title: 'Exercise Tools', endpoint: 'exercise-tools' },
    { title: 'Completed Training Days', endpoint: 'completed-training-days' }
  ]

  const openModal = (title: string, endpoint: string) => {
    setSelectedEntity({ title, endpoint })
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">ACTIVO - Diagnóstico</h1>
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
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedEntity.title}
        endpoint={selectedEntity.endpoint}
      />
    </div>
  )
}