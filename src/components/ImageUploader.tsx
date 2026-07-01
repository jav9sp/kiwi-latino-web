import { useRef } from 'react';
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export default function ImageUploader({ images, onChange, max = 4 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, error, clearError } = useImageUpload();

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = max - images.length;
    const toUpload = Array.from(files).slice(0, remaining);

    for (const file of toUpload) {
      const url = await upload(file);
      if (url) onChange([...images, url]);
    }
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Imágenes{' '}
        <span className="text-gray-400 font-normal">({images.length}/{max})</span>
      </label>

      {/* Previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < max && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-6 transition-colors cursor-pointer
            ${uploading ? 'border-primary/40 bg-primary/5 cursor-wait' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
        >
          {uploading ? (
            <>
              <Loader2 size={22} className="text-primary animate-spin" />
              <span className="text-sm text-gray-500">Subiendo imagen...</span>
            </>
          ) : (
            <>
              <ImagePlus size={22} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                Haz clic o arrastra imágenes aquí
              </span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP · Máx 5 MB</span>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={clearError} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
