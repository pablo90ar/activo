import type { ReactNode } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  zIndex?: string;
}

export default function Modal({ title, onClose, children, maxWidth = "max-w-md", zIndex = "z-50" }: Props) {
  return (
    <div className={`fixed inset-0 bg-black/40 flex items-center justify-center p-4 ${zIndex}`} onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} overflow-hidden max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="bg-brand-olive px-5 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-white truncate">{title}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
