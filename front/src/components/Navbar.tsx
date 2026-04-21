import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";

const links = [
  { to: "/", label: "Inicio", icon: "/icons/home.svg" },
  { to: "/training", label: "Entrenamiento", icon: "/icons/training.svg" },
  { to: "/trainees", label: "Alumnos", icon: "/icons/trainees.svg" },
  { to: "/routines", label: "Rutinas", icon: "/icons/routines.svg" },
  { to: "/exercises", label: "Ejercicios", icon: "/icons/excercise.svg" },
  { to: "/tags", label: "Agrupadores", icon: "/icons/tag.svg" },
  { to: "/history", label: "Historial", icon: "/icons/history.svg" },
  { to: "/settings", label: "Ajustes", icon: "/icons/settings.svg" },
];

export default function Navbar() {
  const { systemName, showClock } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [scrollAtTop, setScrollAtTop] = useState(true);
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("es-AR", { hour12: false }),
  );
  const { pathname } = useLocation();
  const isTraining = pathname === "/training";
  const atTop = !isTraining || scrollAtTop;

  useEffect(() => {
    if (!isTraining) return;
    const onScroll = () => setScrollAtTop(window.scrollY < 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isTraining]);

  useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toLocaleTimeString("es-AR", { hour12: false })),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  const open = () => {
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  };

  const close = () => {
    setVisible(false);
    setTimeout(() => setMounted(false), 300);
  };

  return (
    <>
      <div
        className={`fixed top-3 left-3 z-50 flex items-center gap-3 transition-opacity duration-300 ${atTop ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <button
          onClick={open}
          className="bg-brand-dark/80 text-white rounded-lg p-2 backdrop-blur"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {showClock && (
          <span className="hidden md:flex items-center bg-brand-dark/80 text-white backdrop-blur rounded-lg px-3 h-10 font-mono text-2xl font-semibold tabular-nums">
            {time}
          </span>
        )}
      </div>

      {mounted && (
        <div className="fixed inset-0 z-50" onClick={close}>
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
          />
          <nav
            className={`absolute top-0 left-0 h-full w-56 bg-brand-dark text-white p-6 flex flex-col gap-1 transition-transform duration-300 ${visible ? "translate-x-0" : "-translate-x-full"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg uppercase">{systemName}</span>
              <button onClick={close} className="text-2xl leading-none">
                &times;
              </button>
            </div>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={close}
                className={`py-2 px-3 rounded hover:bg-brand-olive transition flex items-center gap-2 ${pathname === l.to ? "bg-brand-olive font-semibold" : ""}`}
              >
                <img src={l.icon} alt="" className="w-5 h-5 invert" />
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
