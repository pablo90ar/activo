import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSettings } from "../hooks/useSettings";

const links = [
  { to: "/training", label: "Entrenamiento", icon: "/icons/training.svg" },
  { to: "/trainees", label: "Alumnos", icon: "/icons/trainees.svg" },
  { to: "/routines", label: "Rutinas", icon: "/icons/routines.svg" },
  { to: "/exercises", label: "Ejercicios", icon: "/icons/excercise.svg" },
  { to: "/tags", label: "Agrupadores", icon: "/icons/tag.svg" },
  { to: "/history", label: "Historial", icon: "/icons/history.svg" },
  { to: "/settings", label: "Ajustes", icon: "/icons/settings.svg" },
];

export default function Home() {
  usePageTitle("Inicio");
  const { logoUrl } = useSettings();

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-cream to-brand-sage flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <img
          src={logoUrl}
          alt="Logo"
          className="w-20 h-20 mx-auto mb-4 object-contain"
        />
        <p className="text-brand-olive text-center mb-6">
          Gestor de rutinas de entrenamiento
        </p>
        <div className="space-y-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-brand-olive text-white rounded-lg hover:bg-brand-olive-hover transition"
            >
              <img src={l.icon} alt="" className="w-5 h-5 invert" />
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
