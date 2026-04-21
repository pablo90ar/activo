import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import cropImage from "../utils/cropImage";

interface Props {
  imageSrc: string;
  onCropped: (file: File, preview: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCancel, onCropped }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setArea(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!area) return;
    const file = await cropImage(imageSrc, area);
    onCropped(file, URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-[70]" onClick={(e) => e.stopPropagation()}>
      <div className="relative w-80 h-80">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <input
        type="range"
        min={1}
        max={3}
        step={0.1}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        className="w-64 mt-4 accent-[#5B7E6A]"
      />
      <div className="flex gap-3 mt-4">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-[#3A3F39] rounded-lg hover:bg-gray-300 transition">
          Cancelar
        </button>
        <button onClick={handleConfirm} className="px-4 py-2 bg-[#5B7E6A] text-white rounded-lg hover:bg-[#4A6D59] transition">
          Recortar
        </button>
      </div>
    </div>
  );
}
