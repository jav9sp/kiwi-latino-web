import { useState } from 'react';
import api from '../lib/api';
import { compressImage } from '../lib/imageUtils';

interface UploadState {
  uploading: boolean;
  error: string | null;
}

export function useImageUpload() {
  const [state, setState] = useState<UploadState>({ uploading: false, error: null });

  const upload = async (file: File): Promise<string | null> => {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED.includes(file.type)) {
      setState({ uploading: false, error: 'Solo se permiten imágenes JPG, PNG o WebP.' });
      return null;
    }

    setState({ uploading: true, error: null });
    try {
      const blob = await compressImage(file, 1200, 0.85);
      const form = new FormData();
      form.append('image', blob, 'image.jpg');
      const { data } = await api.post<{ data: { url: string } }>('/upload/image', form, { timeout: 60_000 });
      setState({ uploading: false, error: null });
      return data.data.url;
    } catch {
      setState({ uploading: false, error: 'Error al subir la imagen. Intenta de nuevo.' });
      return null;
    }
  };

  const clearError = () => setState((s) => ({ ...s, error: null }));

  return { upload, uploading: state.uploading, error: state.error, clearError };
}
