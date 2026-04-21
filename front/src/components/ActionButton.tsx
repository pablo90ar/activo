interface Props {
  icon: string;
  variant: "edit" | "delete" | "neutral";
  disabled?: boolean;
  onClick: () => void;
  compact?: boolean;
  title?: string;
}

const styles = {
  edit: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  delete: "bg-red-100 text-red-700 hover:bg-red-200",
  neutral: "bg-amber-100 text-amber-700 hover:bg-amber-200",
};

export default function ActionButton({ icon, variant, disabled, onClick, compact, title }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${compact ? "px-3 py-1.5 text-sm" : "p-2.5 min-w-[44px] min-h-[44px] text-sm flex items-center justify-center"} rounded transition ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : styles[variant]}`}
    >
      {icon}
    </button>
  );
}
