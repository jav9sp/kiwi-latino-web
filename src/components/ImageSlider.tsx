import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Props {
  images: string[];
  height?: string;
}

function LightboxOverlay({
  images, current, onClose, onPrev, onNext,
}: {
  images: string[];
  current: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? onNext() : onPrev();
    setTouchStartX(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        aria-label="Cerrar"
      >
        <X size={20} />
      </button>

      <img
        src={images[current]}
        alt={`Imagen ${current + 1}`}
        className="object-contain select-none"
        style={{ maxHeight: '90vh', maxWidth: '90vw' }}
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-sm tabular-nums">
            {current + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

export default function ImageSlider({ images, height = 'h-64' }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, prev, next]);

  if (images.length === 0) return null;

  const onTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setTouchStartX(null);
  };

  if (images.length === 1) {
    return (
      <>
        <img
          src={images[0]}
          alt=""
          className={`w-full ${height} object-cover cursor-zoom-in`}
          onClick={() => setLightbox(true)}
        />
        {lightbox && (
          <LightboxOverlay
            images={images}
            current={0}
            onClose={() => setLightbox(false)}
            onPrev={prev}
            onNext={next}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className={`relative overflow-hidden ${height} cursor-zoom-in`}
        onClick={() => setLightbox(true)}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Imagen ${i + 1}`}
              className="w-full h-full object-cover shrink-0"
            />
          ))}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          aria-label="Siguiente"
        >
          <ChevronRight size={18} />
        </button>

        <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
          {current + 1} / {images.length}
        </div>

        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/55'
              }`}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <LightboxOverlay
          images={images}
          current={current}
          onClose={() => setLightbox(false)}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}
