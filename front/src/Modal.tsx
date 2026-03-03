import { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
}

export default function Modal({ isOpen, onClose, title, endpoint }: ModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && endpoint) {
      setLoading(true);
      fetch(`http://localhost:3000/api/${endpoint}`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(() => {
          setData([]);
          setLoading(false);
        });
    }
  }, [isOpen, endpoint]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-96 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}