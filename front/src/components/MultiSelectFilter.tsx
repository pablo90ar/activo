import { useState, useRef, useEffect } from "react";

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

interface Props {
  options: Array<string>;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  placeholder: string;
}

export default function MultiSelectFilter({ options, selected, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) => norm(o).includes(norm(search)));

  const toggle = (val: string) => {
    const next = new Set(selected);
    next.has(val) ? next.delete(val) : next.add(val);
    onChange(next);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 h-[42px] rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-[#9AA595] bg-white text-sm text-left min-w-[180px] flex items-center justify-between gap-2"
      >
        <span className="truncate text-[#3A3F39]">
          {selected.size === 0 ? placeholder : `${selected.size} seleccionado${selected.size !== 1 ? "s" : ""}`}
        </span>
        <span className="text-[#6C766B]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 flex flex-col">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            autoFocus
            className="px-3 py-2 border-b border-gray-200 text-sm focus:outline-none"
          />
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 px-3 py-2">Sin resultados</p>
            )}
            {filtered.map((o) => (
              <label key={o} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-[#3A3F39]">
                <input
                  type="checkbox"
                  checked={selected.has(o)}
                  onChange={() => toggle(o)}
                  className="accent-[#5B7E6A] w-4 h-4"
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {[...selected].map((s) => (
            <span key={s} className="inline-flex items-center gap-1 bg-[#6C766B] text-white text-xs px-2 py-0.5 rounded-full">
              {s}
              <button onClick={() => toggle(s)} className="hover:text-red-200">✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
