import type { Area } from "react-easy-crop";

export default function cropImage(src: string, crop: Area): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Crop failed"));
        resolve(new File([blob], "photo.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 0.9);
    };
    img.onerror = reject;
    img.src = src;
  });
}
