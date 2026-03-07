import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">ACTIVO</h1>
        <p className="text-gray-600 text-center mb-6">
          Gestor de rutinas de entrenamiento
        </p>
        <div className="space-y-3">
          <Link to="/diagnostic" className="block w-full px-4 py-3 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700">
            Diagnóstico
          </Link>
        </div>
      </div>
    </div>
  )
}