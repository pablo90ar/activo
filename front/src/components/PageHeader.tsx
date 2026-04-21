import { Link } from "react-router-dom";

const ICONS: { [key: string]: string } = {
  Alumnos: "/icons/trainees.svg",
  Rutinas: "/icons/routines.svg",
  Ejercicios: "/icons/excercise.svg",
  Agrupadores: "/icons/tag.svg",
  Historial: "/icons/history.svg",
  Ajustes: "/icons/settings.svg",
};

interface Props {
  title: string;
}

export default function PageHeader({ title }: Props) {
  const icon = ICONS[title];
  return (
    <div className="relative flex items-center justify-center mb-6">
      <Link
        to="/"
        className="hidden sm:block absolute left-0 text-brand-olive hover:text-brand-dark transition text-sm font-medium"
      >
        ← Inicio
      </Link>
      <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
        {icon && <img src={icon} alt="" className="w-6 h-6" />}
        {title}
      </h1>
    </div>
  );
}
