interface Props {
  value: "list" | "cards";
  onChange: (v: "list" | "cards") => void;
}

export default function ViewToggle({ value, onChange }: Props) {
  const btn = (mode: "list" | "cards", label: string) => (
    <button
      onClick={() => onChange(mode)}
      className={`px-3 py-1.5 rounded text-sm font-medium transition ${value === mode ? "bg-brand-olive text-white" : "text-brand-olive hover:bg-gray-100"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-1 bg-white rounded-lg shadow p-1 self-start">
      {btn("list", "☰ Lista")}
      {btn("cards", "▦ Grilla")}
    </div>
  );
}
