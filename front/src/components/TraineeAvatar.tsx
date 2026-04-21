import { useState, useEffect } from "react";
import { traineePhotoUrl } from "../services/traineeService";

interface Props {
  traineeId: string;
  name: string;
  color: string;
  size?: string;
  textSize?: string;
  photoVersion?: number;
  clickable?: boolean;
}

export default function TraineeAvatar({ traineeId, name, color, size = "w-10 h-10", textSize = "text-lg", photoVersion, clickable }: Props) {
  const [imgError, setImgError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => { setImgError(false); }, [photoVersion]);

  const fallback = (
    <div
      className={`${size} rounded-full text-white flex items-center justify-center font-bold ${textSize} shrink-0`}
      style={{ backgroundColor: color || "#9AA595" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );

  if (imgError) return fallback;

  const src = traineePhotoUrl(traineeId, photoVersion);

  return (
    <>
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        onClick={clickable ? () => setOpen(true) : undefined}
        className={`${size} rounded-full object-cover shrink-0 ${clickable ? "cursor-pointer hover:ring-2 hover:ring-brand-sage hover:ring-offset-1 transition" : ""}`}
      />
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <img
            src={src}
            alt={name}
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
