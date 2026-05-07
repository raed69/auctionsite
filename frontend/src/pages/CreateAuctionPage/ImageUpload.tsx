// ImageUpload.tsx — drop zone + image preview grid
// Owns its own image state; notifies parent via onImagesChange.
import { useState, useRef, useCallback } from 'react';

const MOCK_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAaHLT_AQHm_WcX9w7K9S-NTvTN5eJmA3MYMbOd0N0GCccbLchHy6KvvzVrwkPe_IQ1OvPRJ_20qrXlTfdSCIpfhII86PSAo2S_DkceAs7ti9Hf0HS8aCF5jBA5r9stViTem5B4mSurtZAyGJIWeMf3KEeA3Be2eY7P69i-n3dAvlrkIBvBSrz1x6q-i-H6K4MyeUapwe7xuqY-CG-o_HSJj4BSAvoAA-gIpNY712x7mwLDNjaTSfCzSNW8eD12kKprPJikLeE8Uw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDUMVDysqKANHbth_3EJq_y4SWk1epzj3aspUWX9O_LmCOG3N8vu3TzCviksjzpFwq2Se-TAFJIVwgJyPgYl0qmDHhJ7aUxrwy56LhZJ2ePudVhfVjeOLK0p7-iJji1S6VwoBupipmKfX9H4piGNU8He778HOXrk4cc42UeGbW6hmi3PneZeo-NzLI9NCbyL5YTN0CreWxPdP8RJNv7B-9fWM8pXvRQcwcL8bha_y8KCbwn0Pp-H5tomw4OGz0m2YnxzTpCIThCfw',
];

interface Props {
  onImagesChange: (urls: string[]) => void;
}

export default function ImageUpload({ onImagesChange }: Props) {
  const [images, setImages] = useState<string[]>(MOCK_IMAGES);
  const fileRef = useRef<HTMLInputElement>(null);

  const open = () => fileRef.current?.click();

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const urls = Array.from(e.target.files ?? []).map(URL.createObjectURL);
    setImages((prev) => {
      const next = [...prev, ...urls];
      onImagesChange(next);
      return next;
    });
    e.target.value = '';
  }, [onImagesChange]);

  const remove = useCallback((i: number) => {
    setImages((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      onImagesChange(next);
      return next;
    });
  }, [onImagesChange]);

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={open}
        className="border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center py-12 px-6 bg-surface-container-lowest cursor-pointer hover:border-primary/40 transition-colors"
      >
        <span className="material-symbols-outlined text-4xl text-primary mb-4">upload_file</span>
        <p className="font-headline font-bold text-lg">Drop high-resolution assets here</p>
        <p className="font-body text-sm text-on-surface-variant mt-2 text-center">
          RAW, TIFF, and JPEG supported. Minimum 4000px wide.
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); open(); }}
          className="mt-6 px-8 py-3 bg-surface-container-high rounded-full font-label font-semibold hover:bg-surface-variant transition-colors"
        >
          Select Files
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>

      {/* Preview grid */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {images.map((src, i) => (
          <div key={src} className="aspect-square rounded-xl bg-surface-container-high overflow-hidden group relative">
            <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => remove(i)} className="text-white">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ))}
        {/* Always show 2 empty add-slots */}
        {[0, 1].map((i) => (
          <button
            key={`add-${i}`}
            type="button"
            onClick={open}
            className="aspect-square rounded-xl border-2 border-dashed border-outline-variant/20 flex items-center justify-center text-outline hover:border-primary/40 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        ))}
      </div>
    </div>
  );
}
