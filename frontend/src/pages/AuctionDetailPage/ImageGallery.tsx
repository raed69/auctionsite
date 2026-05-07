import { useState } from 'react';

interface GalleryImage {
  src: string;
  alt: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero image */}
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container-low relative group">
        <img
          src={images[active].src}
          alt={images[active].alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-surface-container-lowest/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            zoom_in
          </span>
          <span className="text-xs font-bold font-label">HI-RES VIEW</span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`aspect-square rounded-xl overflow-hidden bg-surface-container-low transition-all hover:opacity-90 relative ${
              active === i ? 'ring-2 ring-primary' : ''
            }`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className={`w-full h-full object-cover ${i === 3 ? 'grayscale brightness-50' : ''}`}
            />
            {i === 3 && (
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold font-label text-lg">
                +12
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}